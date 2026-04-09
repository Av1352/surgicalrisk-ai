import os
import numpy as np
import pandas as pd
import joblib
import shap
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("../model/model.pkl")
explainer = joblib.load("../model/explainer.pkl")
le = joblib.load("../model/label_encoder.pkl")
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

FEATURE_COLS = ["age", "bmi", "diabetes", "asa_score", "surgery_duration_min",
                "procedure_type_enc", "blood_loss_ml", "antibiotic_prophylaxis",
                "smoker", "immunocompromised"]

FEATURE_LABELS = {
    "age": "Age",
    "bmi": "BMI",
    "diabetes": "Diabetes",
    "asa_score": "ASA Score",
    "surgery_duration_min": "Surgery Duration",
    "procedure_type_enc": "Procedure Type",
    "blood_loss_ml": "Blood Loss",
    "antibiotic_prophylaxis": "Antibiotic Prophylaxis",
    "smoker": "Smoker",
    "immunocompromised": "Immunocompromised"
}

class PatientInput(BaseModel):
    age: int
    bmi: float
    diabetes: bool
    asa_score: int
    surgery_duration_min: int
    procedure_type: str
    blood_loss_ml: int
    antibiotic_prophylaxis: bool
    smoker: bool
    immunocompromised: bool

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
def predict(patient: PatientInput):
    proc_enc = int(le.transform([patient.procedure_type])[0])

    input_data = pd.DataFrame([[
        patient.age, patient.bmi, int(patient.diabetes), patient.asa_score,
        patient.surgery_duration_min, proc_enc, patient.blood_loss_ml,
        int(patient.antibiotic_prophylaxis), int(patient.smoker),
        int(patient.immunocompromised)
    ]], columns=FEATURE_COLS)

    prob = float(model.predict_proba(input_data)[0][1])
    risk_pct = round(prob * 100)

    shap_values = explainer.shap_values(input_data)
    sv = shap_values[0]

    feature_importance = sorted(
        zip(FEATURE_COLS, sv, input_data.values[0]),
        key=lambda x: abs(x[1]), reverse=True
    )

    top3 = feature_importance[:3]
    shap_items = []
    for f, v, val in top3:
        label = FEATURE_LABELS[f]
        if f == "procedure_type_enc":
            display_val = patient.procedure_type
        elif f in ["diabetes", "antibiotic_prophylaxis", "smoker", "immunocompromised"]:
            display_val = "Yes" if val == 1 else "No"
        elif f == "surgery_duration_min":
            display_val = f"{int(val)} min ({round(val/60, 1)} hrs)"
        else:
            display_val = str(round(val, 1))
        shap_items.append({
            "feature": label,
            "shap_value": round(float(v), 3),
            "value": display_val,
            "direction": "increases" if v > 0 else "decreases"
        })

    top3_text = "\n".join([
        f"- {s['feature']}: {s['value']} ({s['direction']} risk, SHAP={s['shap_value']})"
        for s in shap_items
    ])

    prompt = f"""You are a clinical decision support assistant. A patient has been assessed for surgical site infection risk.

Top risk factors driving this prediction (from SHAP analysis):
{top3_text}

Patient: Age {patient.age}, BMI {patient.bmi}, {'Diabetic' if patient.diabetes else 'Non-diabetic'}, ASA score {patient.asa_score}, {patient.surgery_duration_min} min {patient.procedure_type} surgery, blood loss {patient.blood_loss_ml}mL, {'antibiotic prophylaxis given' if patient.antibiotic_prophylaxis else 'no antibiotic prophylaxis'}, {'smoker' if patient.smoker else 'non-smoker'}, {'immunocompromised' if patient.immunocompromised else 'immunocompetent'}.

Overall risk score: {risk_pct}%

Write 2-3 plain English sentences explaining the key drivers of this patient's risk score, suitable for a surgeon to read in 10 seconds. Then provide exactly 3 specific clinical action recommendations as a numbered list. Be specific, not generic."""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=400,
        messages=[{"role": "user", "content": prompt}]
    )

    all_shap = [
        {
            "feature": FEATURE_LABELS[f],
            "shap_value": round(float(v), 3),
            "value": str(round(val, 1))
        }
        for f, v, val in feature_importance
    ]

    return {
        "risk_pct": risk_pct,
        "risk_level": "high" if risk_pct >= 60 else "moderate" if risk_pct >= 30 else "low",
        "explanation": response.content[0].text,
        "top3_shap": shap_items,
        "all_shap": all_shap
    }
    
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)