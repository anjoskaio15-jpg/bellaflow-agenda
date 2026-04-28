import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { RequireAuth } from "@/components/shared/RequireAuth";
import { ClientePage } from "@/pages/ClientePage";
import { DevPage } from "@/pages/DevPage";
import { LoginPage } from "@/pages/LoginPage";
import { ProfissionalPage } from "@/pages/ProfissionalPage";
import "@/styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/cliente/bella-rosa" replace />} />
        <Route path="/cliente/:slug" element={<ClientePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/profissional"
          element={<Navigate to="/profissional/taina-melo" replace />}
        />
        <Route
          path="/profissional/:slug"
          element={
            <RequireAuth>
              <ProfissionalPage />
            </RequireAuth>
          }
        />
        <Route
          path="/dev"
          element={
            <RequireAuth requireDev>
              <DevPage />
            </RequireAuth>
          }
        />
      </Routes>
      <Toaster richColors position="top-center" />
    </BrowserRouter>
  </React.StrictMode>,
);
