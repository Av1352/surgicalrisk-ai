import { useState } from "react"
import PatientForm from "./components/PatientForm"
import Results from "./components/Results"

const API = import.meta.env.VITE_API_URL

export default function App() {
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [formData, setFormData] = useState(null)

    async function handlePredict(data) {
        setLoading(true)
        setError(null)
        setFormData(data)
        try {
            const res = await fetch(`${API}/predict`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.detail || "Prediction failed")
            setResult(json)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
            <header style={{
                borderBottom: "1px solid var(--border)",
                padding: "0 40px", height: "60px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "var(--bg)", position: "sticky", top: 0, zIndex: 10
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                        width: "28px", height: "28px", borderRadius: "6px",
                        background: "var(--accent)", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "14px"
                    }}>✚</div>
                    <span style={{ fontSize: "15px", fontWeight: "600", letterSpacing: "-0.02em", color: "var(--text)" }}>
                        SurgicalRisk AI
                    </span>
                    <span style={{
                        fontSize: "10px", color: "var(--text-dim)", fontFamily: "'JetBrains Mono', monospace",
                        letterSpacing: "0.1em", textTransform: "uppercase", marginLeft: "4px"
                    }}>/ SSI Risk Predictor</span>
                </div>
                <div style={{
                    fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                    color: "var(--text-dim)", background: "var(--bg-card)",
                    border: "1px solid var(--border)", borderRadius: "6px", padding: "5px 12px"
                }}>
                    XGBoost + SHAP + Claude
                </div>
            </header>

            <div style={{ display: "flex", flex: 1, minHeight: "calc(100vh - 60px)" }}>
                <aside style={{
                    width: "320px", minWidth: "320px",
                    borderRight: "1px solid var(--border)",
                    padding: "28px 20px", overflowY: "auto",
                    background: "var(--bg)"
                }}>
                    <PatientForm onPredict={handlePredict} loading={loading} />
                </aside>
                <main style={{ flex: 1, padding: "32px 40px", overflowY: "auto" }}>
                    <Results result={result} loading={loading} error={error} />
                </main>
            </div>
        </div>
    )
}