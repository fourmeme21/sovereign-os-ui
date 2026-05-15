import { useState, useEffect } from "react";

export function useFirstVisit() {
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    const visited = localStorage.getItem("sovereign_onboarded");
    if (!visited) setIsFirstVisit(true);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem("sovereign_onboarded", "true");
    setIsFirstVisit(false);
  };

  return [isFirstVisit, completeOnboarding];
}
