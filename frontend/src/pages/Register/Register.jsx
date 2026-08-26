import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { register } from "../../api/auth";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();
  const [input_email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const {invite_token} = useParams();

  const is_invited = invite_token && invite_token !== "null";
  const email = is_invited ? "null" : input_email;

  async function handleRegister(e) {
    e.preventDefault();
    setMessage("");

    const res = await register(email, password, invite_token);
    const text = await res.text();

    setMessage(text);

    if (res.ok) {
      navigate("/login");
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Register</h1>
        <form onSubmit={handleRegister} style={{ display: "contents" }}>
          {message && <div className="register-error-msg">{message}</div>}
          <div>
            <label htmlFor="id_email">Email</label>
            <input
              style={{ display: is_invited ? "none" : "inline-flex" }}
              id="id_email"
              type="email"
              placeholder="Enter your email"
              value={input_email}
              onChange={(e) => setEmail(e.target.value)}
              required={!is_invited}
            />
            <p style={{ display: is_invited ? "inline-block" : "none" }}>Registering for email on which you have received an invitation</p>
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
          <button type="submit" className="btn-register-submit">
            Register
          </button>
          <button
            type="button"
            className="btn-register-back"
            onClick={() => navigate("/login")}
          >
            Back to login
          </button>
        </form>
      </div>
    </div>
  );
}
