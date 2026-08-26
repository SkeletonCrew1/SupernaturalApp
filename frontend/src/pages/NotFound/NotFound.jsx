import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-card">
        <h1>404</h1>
        <Link to="/" className="not-found-link">
          <button type="button">Go Home</button>
        </Link>
      </div>
    </div>
  );
}
