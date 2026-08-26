import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../shared/ui/BackButton/BackButton';
import "./Admin.css";
import EraseButton from '../../shared/ui/EraseButton/EraseButton';
import { erase } from '../../api/erase';
import { report, grade } from '../../api/report';

export default function Admin({ user, setUser }) {
  const navigate = useNavigate();
  const [eraseMessage, setEraseMessage] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [ip_address, setip_address] = useState("");
  const [alias, setalias] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleReport = async () => {
    const response = await report(ip_address);
    const data = await response.json();
    setReportMessage(data.message);
    setip_address("");
  };

  const handleGrade = async (pregrade) => {
    try {
      const response = await grade(pregrade, alias);
      const data = await response.json();
      setalias("");
    } catch (error) {
      console.error("Failed to change status:", error);
    }
  };

  const handleEraseClick = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmErase = async () => {
    setIsConfirmOpen(false);
    try {
      const response = await erase();
      const data = await response.json();
      setUser(null);
      setEraseMessage(data.message);
      navigate('/login');
    } catch (error) {
      console.error("Failed to erase data:", error);
    }
  };

  return (
    <div>
      <header className="admin-header">
        <div className="admin-header-row">
          <BackButton onClick={() => window.location.href = '/'} style={{ margin: '60px' }} />
          <h1 className="admin-title">Admin</h1>
        </div>
      </header>
      <div className="admin-container" style={{ display: ["gold", "silver"].includes(user?.status) ? "flex" : "none" }}>
        <button
          type="button"
          className="post-form__submit"
          onClick={() => navigate('/mail')}>
          Create mails
        </button>

        <div className="report-row">
          <input type="text"
            placeholder="IPv4 address to report"
            style={{ display: ["gold", "silver"].includes(user?.status) ? "flex" : "none" }}
            value={ip_address}
            onChange={(e) => setip_address(e.target.value)}
          />
          <button
            type="button"
            style={{ display: ["gold", "silver"].includes(user?.status) ? "flex" : "none" }}
            className="post-form__submit report-submit-btn"
            onClick={handleReport}
          > Report </button>
        </div>

        {reportMessage && <p className="report-message">{reportMessage}</p>}

        <button
          style={{ display: user?.status === "gold" ? "inline-block" : "none" }}
          type="button"
          className="post-form__submit"
          onClick={() => navigate('/invite')}>
          Create invitation
        </button>

        <div className="report-row" style={{ display: user?.is_architect === true ? "flex" : "none" }}>
          <input type="text"
            placeholder="User to _grade"
            className="grade-input"
            value={alias}
            onChange={(e) => setalias(e.target.value)}
          />
          <button
            type="button"
            className="post-form__submit vote-up"
            onClick={() => handleGrade("up")}
          > up </button>
          <button
            type="button"
            className="post-form__submit vote-down"
            onClick={() => handleGrade("down")}
          > down </button>
        </div>

        <EraseButton onClick={handleEraseClick} style={{ display: user?.status === "gold" ? "flex" : "none" }} />
        {eraseMessage && <p>{eraseMessage}</p>}
      </div>

      {isConfirmOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <h3>Are you sure?</h3>
            <p>This will permanently erase all data.</p>
            <div className="custom-modal-actions">
              <button
                type="button"
                className="modal-btn modal-btn-cancel"
                onClick={() => setIsConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-btn modal-btn-danger"
                onClick={handleConfirmErase}
              >
                Erase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
