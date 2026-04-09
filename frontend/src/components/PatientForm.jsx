import { useState } from "react"

const mono = "'JetBrains Mono', monospace"
const sans = "'Inter', sans-serif"

const label = (text) => (
    <div style={{
        fontSize: "10px", color: "var(--accent)",
        fontFamily: mono, letterSpacing: "0.1em", marginBottom: "6px"
    }}>{text}</div>
)

const inputStyle = {
    width: "100%", background: "var(--bg-card)",
    border: "1px solid var(--border)", borderRadius: "8px",
    padding: "9px 12px", color: "var(--text)",
    fontSize: "13px", outline: "none",
    fontFamily: sans
}

export default function PatientForm({ onPredict, loading }) {
    const [form, setForm] = useState({
        age: 55, bmi: 27.0, diabetes: false, asa_score: 2,
        surgery_duration_min: 120, procedure_type: "abdominal",
        blood_loss_ml: 300, antibiotic_prophylaxis: true,
        smoker: false, immunocompromised: false
    })

    function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

    function handleSubmit() {
        onPredict({
            ...form,
            age: parseInt(form.age),
            bmi: parseFloat(form.bmi),
            asa_score: parseInt(form.asa_score),
            surgery_duration_min: parseInt(form.surgery_duration_min),
            blood_loss_ml: parseInt(form.blood_loss_ml)
        })
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
                <div style={{
                    fontSize: "10px", color: "var(--accent)", fontFamily: mono,
                    letterSpacing: "0.1em", marginBottom: "10px"
                }}>// PATIENT PROFILE</div>
                <div style={{ fontSize: "16px", fontWeight: "600", color: "var(--text)", letterSpacing: "-0.02em" }}>
                    Enter Patient Data
                </div>
            </div>

            <div>
                {label("// AGE")}
                <input type="number" min={18} max={90} value={form.age}
                    onChange={e => set("age", e.target.value)} style={inputStyle} />
            </div>

            <div>
                {label("// BMI")}
                <input type="number" min={18} max={45} step={0.1} value={form.bmi}
                    onChange={e => set("bmi", e.target.value)} style={inputStyle} />
            </div>

            <div>
                {label("// SURGERY DURATION (MIN)")}
                <input type="number" min={30} max={480} value={form.surgery_duration_min}
                    onChange={e => set("surgery_duration_min", e.target.value)} style={inputStyle} />
            </div>

            <div>
                {label("// BLOOD LOSS (ML)")}
                <input type="number" min={50} max={2000} value={form.blood_loss_ml}
                    onChange={e => set("blood_loss_ml", e.target.value)} style={inputStyle} />
            </div>

            <div>
                {label("// ASA SCORE")}
                <div style={{ display: "flex", gap: "6px" }}>
                    {[1, 2, 3, 4, 5].map(v => (
                        <button key={v} onClick={() => set("asa_score", v)}
                            style={{
                                flex: 1, padding: "8px 4px", borderRadius: "8px",
                                border: `1px solid ${form.asa_score === v ? "var(--accent)" : "var(--border)"}`,
                                background: form.asa_score === v ? "var(--bg-hover)" : "var(--bg-card)",
                                color: form.asa_score === v ? "var(--accent)" : "var(--text-muted)",
                                fontSize: "13px", cursor: "pointer", fontFamily: sans
                            }}>{v}</button>
                    ))}
                </div>
            </div>

            <div>
                {label("// PROCEDURE TYPE")}
                <select value={form.procedure_type}
                    onChange={e => set("procedure_type", e.target.value)}
                    style={{ ...inputStyle, cursor: "pointer" }}>
                    {["orthopedic", "cardiac", "abdominal", "neurological"].map(p => (
                        <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                </select>
            </div>

            <div>
                {label("// RISK FACTORS")}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                        { key: "diabetes", label: "Diabetes" },
                        { key: "antibiotic_prophylaxis", label: "Antibiotic Prophylaxis Given" },
                        { key: "smoker", label: "Smoker" },
                        { key: "immunocompromised", label: "Immunocompromised" }
                    ].map(({ key, label: lbl }) => (
                        <label key={key} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                            <input type="checkbox" checked={form[key]}
                                onChange={e => set(key, e.target.checked)}
                                style={{ accentColor: "var(--accent)", width: "16px", height: "16px" }} />
                            <span style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: sans }}>{lbl}</span>
                        </label>
                    ))}
                </div>
            </div>

            <button onClick={handleSubmit} disabled={loading}
                style={{
                    background: loading ? "var(--bg-hover)" : "var(--accent)",
                    color: loading ? "var(--text-muted)" : "#000",
                    border: "none", borderRadius: "10px", padding: "12px",
                    fontSize: "14px", fontWeight: "600", cursor: "pointer",
                    fontFamily: sans, transition: "all 0.2s", marginTop: "4px"
                }}>
                {loading ? "Analyzing..." : "Predict Risk →"}
            </button>
        </div>
    )
}