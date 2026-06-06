import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./AppRouter";
import { initAuthListener } from "./stores/authStore";
import { registerSession }  from "./junior/hooks/useAuth";
import { checkForUpdates } from "./lib/updater";
import "./i18n";  // ← EKLE

initAuthListener(registerSession);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </React.StrictMode>
);

checkForUpdates();
setInterval(() => checkForUpdates(), 4 * 60 * 60 * 1000);
