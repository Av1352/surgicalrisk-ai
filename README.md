# SurgicalRisk AI

Predicts surgical site infection risk from patient data and explains every prediction in plain language for clinicians.

**Live:** https://surgicalrisk-ai.vercel.app

---

## What it does

Enter patient data. Get three things back:

1. **Risk score** — XGBoost probability of surgical site infection
2. **SHAP waterfall chart** — which factors drove the score up or down, and by how much
3. **Plain-language clinical summary** — Claude translates the SHAP output into a paragraph a clinician can act on

The goal: close the gap between a model that predicts and a clinician who decides.

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite, Vercel |
| Backend | FastAPI, Render |
| Model | XGBoost classifier |
| Explainability | SHAP TreeExplainer |
| Clinical summaries | Claude claude-sonnet-4-20250514 |

---

## Model

Trained on 2,000 synthetic patients with clinically grounded risk factors:

- Age, BMI, diabetes status
- ASA physical status score
- Surgery duration, procedure type, blood loss
- Antibiotic prophylaxis, smoking status, immunocompromised status

Target variable generated with a logistic formula that preserves real clinical risk patterns. SHAP TreeExplainer provides instance-level explanations — every prediction is fully attributable to individual features.

> **Note:** Trained on synthetic data only. Not for clinical use.

---

## Run Locally

**Backend**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python train_model.py
cp .env.example .env  # add ANTHROPIC_API_KEY
python main.py
```

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env  # set VITE_API_URL=http://localhost:8000
npm run dev
```

---

## Why this exists

Most clinical AI tools optimize for accuracy. Fewer optimize for trust. A clinician who cannot understand why a model flagged a patient cannot safely act on it.

This project explores what clinician-facing explainability looks like in practice: not just feature importance bars, but a coherent narrative that connects model reasoning to clinical decision-making.

---

Built by [Anju Vilashni Nandhakumar](https://vxanju.com)
