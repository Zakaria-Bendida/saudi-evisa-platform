import { useState } from "react";
import { Mail, Lock, LogIn, Landmark } from "lucide-react";
import "./Formulaire.css";

const AUTH_URL = `${import.meta.env.VITE_API_URL}/api/auth/login`;

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        localStorage.setItem("evisa_token", result.token);
        localStorage.setItem("evisa_email", result.email);
        onLoginSuccess(result.token);
      } else {
        setError(result.message || "Identifiants incorrects.");
      }
    } catch (err) {
      setError("Erreur reseau : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="omra-page"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <div className="omra-card" style={{ maxWidth: 420, width: "100%" }}>
        <div
          className="omra-card-head"
          style={{
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div className="icon-badge" style={{ marginBottom: 10 }}>
            <Landmark size={22} />
          </div>
          <h2>Accès réservé</h2>
          <p>Connectez-vous pour accéder au formulaire de demande de visa.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="omra-grid">
            <div className="field">
              <label>Adresse e-mail</label>
              <div className="control">
                <Mail size={17} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  required
                  autoFocus
                />
              </div>
            </div>
            <div className="field">
              <label>Mot de passe</label>
              <div className="control">
                <Lock size={17} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            style={{ marginTop: 20 }}
            disabled={loading}
          >
            <LogIn size={16} />
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
