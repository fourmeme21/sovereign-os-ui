import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./AppRouter";
import { initAuthListener } from "./stores/authStore";
import { registerSession } from "./junior/hooks/useAuth";
import "./i18n";

initAuthListener(registerSession);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </React.StrictMode>
);

if (window.__TAURI_INTERNALS__) {
  import("./lib/updater").then(({ checkForUpdates }) => {
    checkForUpdates();
    setInterval(() => checkForUpdates(), 4 * 60 * 60 * 1000);
  });
}
