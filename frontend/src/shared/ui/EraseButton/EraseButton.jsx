import React from "react";
import "./EraseButton.css";

export default function EraseButton({ onClick }) {
  return (
    <button
      type="button"
      className="ui-erase-btn"
      onClick={onClick}
      aria-label="COMPROMISED"
    >
    <p>COMPROMISED</p>
    </button>
  );
}
