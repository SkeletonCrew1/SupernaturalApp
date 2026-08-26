import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/auth";
import "./Login.css";

export default function Login({ setUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      const user = await login(email, password);
      setUser(user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Login</h1>
        <form onSubmit={handleLogin} style={{ display: "contents" }}>
          {error && <div className="error-msg">{error}</div>}
          <div>
            <label htmlFor="id_email">Email</label>
            <input
              id="id_email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="id_password">Password</label>
            <input
              id="id_password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-login">
            Login
          </button>
          <button
            type="button"
            className="btn-register"
            onClick={() => navigate("/register")}
          >
            Create account
          </button>
        </form>
      </div>
    </div>
  );
}
