const sans = "'Inter', sans-serif"
const mono = "'JetBrains Mono', monospace"

export default function ShapChart({ data }) {
    const top8 = data.slice(0, 8)
    const maxAbs = Math.max(...top8.map(d => Math.abs(d.shap_value)), 0.01)

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {top8.map((d, i) => {
                const pct = (Math.abs(d.shap_value) / maxAbs) * 100
                const isPositive = d.shap_value > 0
                return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "160px", fontSize: "11px", color: "var(--text-muted)", fontFamily: sans, textAlign: "right", flexShrink: 0 }}>
                            {d.feature}
                        </div>
                        <div style={{ flex: 1, height: "20px", display: "flex", alignItems: "center" }}>
                            {isPositive ? (
                                <div style={{ display: "flex", width: "100%" }}>
                                    <div style={{ width: "50%" }} />
                                    <div style={{
                                        width: `${pct / 2}%`, height: "12px",
                                        background: "var(--red)", borderRadius: "0 3px 3px 0",
                                        opacity: 0.85
                                    }} />
                                </div>
                            ) : (
                                <div style={{ display: "flex", width: "100%", justifyContent: "flex-end" }}>
                                    <div style={{
                                        width: `${pct / 2}%`, height: "12px",
                                        background: "var(--blue-bright)", borderRadius: "3px 0 0 3px",
                                        opacity: 0.85
                                    }} />
                                    <div style={{ width: "50%" }} />
                                </div>
                            )}
                        </div>
                        <div style={{
                            width: "52px", fontSize: "10px", fontFamily: mono,
                            color: isPositive ? "var(--red)" : "var(--blue-bright)",
                            flexShrink: 0
                        }}>
                            {isPositive ? "+" : ""}{d.shap_value.toFixed(3)}
                        </div>
                    </div>
                )
            })}
            <div style={{ display: "flex", gap: "20px", marginTop: "8px", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "12px", height: "12px", background: "var(--red)", borderRadius: "2px" }} />
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: sans }}>Increases risk</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "12px", height: "12px", background: "var(--blue-bright)", borderRadius: "2px" }} />
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: sans }}>Decreases risk</span>
                </div>
            </div>
        </div>
    )
}