import pandas as pd
import numpy as np
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import shap
import joblib
import os

np.random.seed(42)
n = 2000

procedure_types = ["orthopedic", "cardiac", "abdominal", "neurological"]
procedure_risk = {"orthopedic": 0.1, "cardiac": 0.3, "abdominal": 0.4, "neurological": 0.2}

df = pd.DataFrame({
    "age": np.random.randint(18, 91, n),
    "bmi": np.round(np.random.uniform(18, 45, n), 1),
    "diabetes": np.random.binomial(1, 0.25, n),
    "asa_score": np.random.randint(1, 6, n),
    "surgery_duration_min": np.random.randint(30, 481, n),
    "procedure_type": np.random.choice(procedure_types, n),
    "blood_loss_ml": np.random.randint(50, 2001, n),
    "antibiotic_prophylaxis": np.random.binomial(1, 0.7, n),
    "smoker": np.random.binomial(1, 0.2, n),
    "immunocompromised": np.random.binomial(1, 0.1, n),
})

proc_risk = df["procedure_type"].map(procedure_risk)
logit = (
    -3.0
    + 0.03 * (df["age"] - 50)
    + 0.05 * (df["bmi"] - 25)
    + 0.8 * df["diabetes"]
    + 0.4 * (df["asa_score"] - 1)
    + 0.004 * df["surgery_duration_min"]
    + 0.001 * df["blood_loss_ml"]
    + proc_risk
    - 1.2 * df["antibiotic_prophylaxis"]
    + 0.5 * df["smoker"]
    + 0.9 * df["immunocompromised"]
)
prob = 1 / (1 + np.exp(-logit))
df["ssi_risk"] = np.random.binomial(1, prob, n)

le = LabelEncoder()
df["procedure_type_enc"] = le.fit_transform(df["procedure_type"])

os.makedirs("../data", exist_ok=True)
os.makedirs("../model", exist_ok=True)
df.to_csv("../data/synthetic_patients.csv", index=False)

feature_cols = ["age", "bmi", "diabetes", "asa_score", "surgery_duration_min",
                "procedure_type_enc", "blood_loss_ml", "antibiotic_prophylaxis",
                "smoker", "immunocompromised"]

X = df[feature_cols]
y = df["ssi_risk"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = XGBClassifier(n_estimators=300, max_depth=6, learning_rate=0.05,
                      eval_metric="logloss", random_state=42, subsample=0.8,
                      colsample_bytree=0.8, min_child_weight=3)
model.fit(X_train, y_train)

explainer = shap.TreeExplainer(model)

joblib.dump(model, "../model/model.pkl")
joblib.dump(le, "../model/label_encoder.pkl")

print(f"Done. SSI rate: {y.mean():.2%}")
print(f"Test accuracy: {model.score(X_test, y_test):.2%}")