import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./AppRouter";
import { initAuthListener } from "./stores/authStore";
import { checkForUpdates } from "./lib/updater";

// Supabase session dinleyicisini başlat — render'dan önce
initAuthListener();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </React.StrictMode>
);

// Desktop: güncelleme kontrolü
checkForUpdates();
setInterval(() => checkForUpdates(), 4 * 60 * 60 * 1000);
