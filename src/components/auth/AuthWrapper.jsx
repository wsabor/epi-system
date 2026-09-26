import React, { useState } from "react";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";

const AuthWrapper = () => {
  const [view, setView] = useState("login"); // 'login' | 'forgot'

  return view === "login" ? (
    <Login onToggleForgotPassword={() => setView("forgot")} />
  ) : (
    <ForgotPassword onToggleLogin={() => setView("login")} />
  );
};

export default AuthWrapper;
