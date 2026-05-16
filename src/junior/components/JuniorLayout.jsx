import { Outlet } from "react-router-dom";
import JuniorNav from "./JuniorNav";
import JuniorStatusBar from "./JuniorStatusBar";
import { EngineOfflineBar } from "./ErrorStates";
import { useEngineStatus } from "../hooks/useEngineStatus";
import "./ekranlar.css";

export default function JuniorLayout() {
  const engineOnline = useEngineStatus();

  return (
    <div className="junior-layout">
      {!engineOnline && <EngineOfflineBar />}
      <JuniorNav />
      <div className="junior-content">
        <Outlet />
      </div>
      <JuniorStatusBar />
    </div>
  );
}
