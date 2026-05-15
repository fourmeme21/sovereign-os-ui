import { Outlet } from "react-router-dom";
import { useFirstVisit } from "../hooks/useFirstVisit";
import OnboardingModal from "../components/OnboardingModal";
import { EngineOfflineBar } from "../components/ErrorStates";
import { useEngineStatus } from "../hooks/useEngineStatus"; // mevcut hook
import "../styles/polish.css";

export default function JuniorLayout() {
  const [isFirstVisit, completeOnboarding] = useFirstVisit();
  const engineOnline = useEngineStatus();

  return (
    <>
      {isFirstVisit && (
        <OnboardingModal onComplete={completeOnboarding} />
      )}

      <div className="junior-layout">
        {!engineOnline && <EngineOfflineBar />}
        <Outlet />
      </div>
    </>
  );
}
