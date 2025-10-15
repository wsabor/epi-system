import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";

const AuthWrapper = () => {
  const [view, setView] = useState("login"); // 'login', 'register', 'forgot'

  return (
    <>
      {view === "login" && (
        <Login
          onToggleRegister={() => setView("register")}
          onToggleForgotPassword={() => setView("forgot")}
        />
      )}
      {view === "register" && (
        <Register onToggleLogin={() => setView("login")} />
      )}
      {view === "forgot" && (
        <ForgotPassword onToggleLogin={() => setView("login")} />
      )}
    </>
  );
};

export default AuthWrapper;
