import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyPassword } from "../../api/auth";
import "./EnterPassword.css";

export default function EnterPassword({ setPasswordVerified }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    try {
      const res = await verifyPassword(password);

      if (res.ok) {
        sessionStorage.setItem("passwordVerified", "true");
        setPasswordVerified(true);

        navigate("/login", { replace: true });
      } else {
        setError("Incorrect password.");
      }
    } catch (err) {
      setError("Server error.");
    }
  }

  return (
    <div className="password-container">
      <div className="password-card">
        <h1>Supernatural</h1>

        <form onSubmit={handleSubmit}>
          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="btn-password-submit"
            style={{ marginTop: "20px" }}
          >
            Continue
          </button>
        </form>

        {error && <p className="password-error-msg">{error}</p>}
      </div>
    </div>
  );
}
