import { Outlet } from "react-router-dom";
import JuniorNav from "./JuniorNav";
import JuniorStatusBar from "./JuniorStatusBar";
import "./ekranlar.css";

export default function JuniorLayout() {
  return (
    <div className="junior-layout">
      <JuniorNav />
      <div className="junior-content">
        <Outlet />
      </div>
      <JuniorStatusBar />
    </div>
  );
}
