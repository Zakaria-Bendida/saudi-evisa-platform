import { useState } from "react";
import Login from "./Login.jsx";
import Formulaire from "./Formulaire.jsx";
import { LogOut } from "lucide-react";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("evisa_token"));

  const handleLogout = () => {
    localStorage.removeItem("evisa_token");
    localStorage.removeItem("evisa_email");
    setToken(null);
  };

  if (!token) {
    return <Login onLoginSuccess={(t) => setToken(t)} />;
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={handleLogout}
        title="Se deconnecter"
        style={{
          position: "fixed",
          top: 18,
          right: 18,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 14px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.4)",
          background: "rgba(0,0,0,0.35)",
          color: "#fff",
          cursor: "pointer",
          fontSize: "0.8rem",
          fontWeight: 600,
        }}
      >
        <LogOut size={14} />
        Déconnexion
      </button>
      <Formulaire token={token} onUnauthorized={handleLogout} />
    </div>
  );
}

export default App;
