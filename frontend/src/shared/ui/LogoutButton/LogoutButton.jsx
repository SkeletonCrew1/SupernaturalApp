import "./LogoutButton.css";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../api/auth";

export default function LogoutButton({ setUser }) {
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    setUser(null);
    navigate("/login", { replace: true });
  }

  return (
    <button
      type="button"
      className="ui-logout-btn"
      onClick={handleLogout}
      aria-label="Log out"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="20"
        height="20"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    </button>
  );
}
