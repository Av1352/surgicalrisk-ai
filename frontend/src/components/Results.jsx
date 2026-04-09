import ShapChart from "./ShapChart"

const mono = "'JetBrains Mono', monospace"
const sans = "'Inter', sans-serif"

export default function Results({ result, loading, error }) {
    if (loading) return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "16px" }}>
            <div style={{ fontSize: "10px", color: "var(--blue-bright)", fontFamily: mono, letterSpacing: "0.1em" }}>
        // RUNNING XGBOOST + SHAP + CLAUDE
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: sans }}>Analyzing patient risk profile...</div>
        </div>
    )

    if (error) return (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "16px", color: "var(--red)", fontSize: "14px", fontFamily: sans }}>
            ⚠ {error}
        </div>
    )

    if (!result) return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "20px" }}>
            <div style={{ fontSize: "48px", opacity: 0.15 }}>✚</div>
            <div style={{ fontSize: "10px", color: "var(--blue-bright)", fontFamily: mono, letterSpacing: "0.1em" }}>
        // SURGICALRISK AI
            </div>
            <div style={{ fontSize: "14px", color: "var(--text-muted)", textAlign: "center", maxWidth: "360px", lineHeight: 1.6, fontFamily: sans }}>
                Enter patient data and click Predict Risk to get an XGBoost prediction with SHAP explainability and a plain-language clinical summary.
            </div>
        </div>
    )

    const riskColor = result.risk_level === "high" ? "var(--red)" : result.risk_level === "moderate" ? "var(--yellow)" : "var(--blue-bright)"
    const riskLabel = result.risk_level === "high" ? "High Risk" : result.risk_level === "moderate" ? "Moderate Risk" : "Low Risk"

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Risk score */}
            <div style={{
                background: "var(--bg-card)", border: `1px solid var(--border)`,
                borderRadius: "14px", padding: "28px 32px",
                borderLeft: `4px solid ${riskColor}`,
                display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
                <div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: mono, letterSpacing: "0.1em", marginBottom: "8px" }}>SSI RISK SCORE</div>
                    <div style={{ fontSize: "64px", fontWeight: "700", color: riskColor, fontFamily: mono, letterSpacing: "-0.02em", lineHeight: 1 }}>
                        {result.risk_pct}%
                    </div>
                    <div style={{ fontSize: "16px", color: riskColor, marginTop: "6px", fontFamily: sans, fontWeight: "500" }}>{riskLabel}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end" }}>
                    {result.top3_shap.map((s, i) => (
                        <div key={i} style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: sans }}>{s.feature}</div>
                            <div style={{
                                fontSize: "12px", fontFamily: mono,
                                color: s.shap_value > 0 ? "var(--red)" : "var(--blue-bright)"
                            }}>
                                {s.shap_value > 0 ? "▲" : "▼"} {s.value}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Clinical explanation */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
                <div style={{ fontSize: "10px", color: "var(--blue-bright)", fontFamily: mono, letterSpacing: "0.1em", marginBottom: "12px" }}>// CLINICAL EXPLANATION</div>
                <div style={{ fontSize: "14px", color: "var(--text)", lineHeight: 1.8, fontFamily: sans }}
                    dangerouslySetInnerHTML={{
                        __html: result.explanation
                            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                            .replace(/\n/g, "<br/>")
                    }}
                />
            </div>

            {/* SHAP Chart */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
                <div style={{ fontSize: "10px", color: "var(--blue-bright)", fontFamily: mono, letterSpacing: "0.1em", marginBottom: "16px" }}>// SHAP FEATURE CONTRIBUTIONS</div>
                <ShapChart data={result.all_shap} />
            </div>

        </div>
    )
}