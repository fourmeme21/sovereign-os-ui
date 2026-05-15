// OnboardingModal.jsx Step 2 içinde githubToken'ın altına ekle:

const [githubRepo, setGithubRepo] = useState("");

// handleNext içinde:
if (currentStep.id === 2) {
  if (githubToken) localStorage.setItem("github_token", githubToken);
  if (githubRepo) localStorage.setItem("github_repo", githubRepo);
}

// JSX - githubToken input'unun altına ekle:
{currentStep.id === 2 && (
  <input
    className="onboarding-input"
    type="text"
    placeholder="kullanici/repo-adi (örn: dics/sovereign)"
    value={githubRepo}
    onChange={(e) => setGithubRepo(e.target.value)}
    style={{ marginTop: 8 }}
  />
)}
