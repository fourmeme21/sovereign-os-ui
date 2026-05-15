import { useState } from "react";

const STEPS = [
  {
    id: 1,
    title: "Engine Bağlantısı",
    description: "Sovereign Engine, AI kodunu güvenli filtreler.",
    checkLabel: "Engine durumunu kontrol et",
  },
  {
    id: 2,
    title: "GitHub Bağlantısı",
    description: "Onaylanan değişiklikler otomatik commit atılır.",
    checkLabel: "GitHub token gir",
  },
  {
    id: 3,
    title: "İlk Dokümanı Ekle",
    description: "PRD veya schema.sql ekleyerek hafızayı başlat.",
    checkLabel: "Bir doküman yükle (opsiyonel)",
    optional: true,
  },
];

export default function OnboardingModal({ onComplete }) {
  const [step, setStep] = useState(0);
  const [githubToken, setGithubToken] = useState("");

  const currentStep = STEPS[step];
  const isLastStep = step === STEPS.length - 1;

  const handleNext = () => {
    if (currentStep.id === 2 && githubToken) {
      localStorage.setItem("github_token", githubToken);
    }
    if (isLastStep) {
      onComplete();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        {/* İlerleme */}
        <div className="onboarding-progress">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`progress-dot ${i <= step ? "active" : ""}`}
            />
          ))}
        </div>

        {/* İçerik */}
        <div className="onboarding-content">
          <div className="onboarding-step-num">
            Adım {step + 1} / {STEPS.length}
          </div>
          <h2 className="onboarding-title">{currentStep.title}</h2>
          <p className="onboarding-desc">{currentStep.description}</p>

          {currentStep.id === 2 && (
            <input
              className="onboarding-input"
              type="password"
              placeholder="GitHub Personal Access Token"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
            />
          )}

          {currentStep.optional && (
            <p className="onboarding-optional">
              Bu adım opsiyoneldir, sonradan ekleyebilirsin.
            </p>
          )}
        </div>

        {/* Aksiyon */}
        <div className="onboarding-actions">
          {currentStep.optional && (
            <button className="btn-skip" onClick={onComplete}>
              Şimdi atla
            </button>
          )}
          <button className="btn-primary" onClick={handleNext}>
            {isLastStep ? "Başlayalım →" : "Devam →"}
          </button>
        </div>
      </div>
    </div>
  );
}
