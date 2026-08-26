import React, { useState, useEffect } from 'react';
import { FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import BackButton from '../../shared/ui/BackButton/BackButton';
import axios from 'axios';
import "./Invite.css";
const API_ENDPOINT = '/api/mail/invite';

export default function Invite() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  const [statuses, setStatuses] = useState({
    email: true,
  });

  const handleCheckboxChange = (event) => {
    setStatuses({
      ...statuses,
      [event.target.name]: event.target.checked,
    });
  };
  const onSubmit = async () => {
    setSuccess("")

    const selectedStatuses = [];
    for (const key in statuses) {
      if (statuses[key]) {
        selectedStatuses.push(key);
      }
    }
    if (email == "") {
      setError('Email is required. Please fill the fild');
      return;
    }

    const data = {
      email: email
    };

    try {
      const response = await axios.post(API_ENDPOINT, data);

      console.log("Invite", response.data);
      setSuccess('Invite successfully sent');

      setEmail("")
    } catch (error) {
      if (error.response) {
        setSuccess("")
        console.error("Server error:", error.response.status, error.response.data);
      } else {
        setSuccess("")
        console.error("Server not available:", error.message);
        setError('Server not available');
      }
    }
  };

  return (
    <div>
      <header className="mail-header">
        <div className="mail-header-row">
          <BackButton onClick={() => window.location.href = '/admin'} />
          <h1 className="mail-title">Invitation</h1>
        </div>
      </header>
      <div className="mail-container">
        {error ? (
          <div className="error-message" role="alert">
            <p>{error}</p>
          </div>
        ) : null}
        {success ? (
          <div className="success-message" role="alert">
            <p>{success}</p>
          </div>
        ) : null}
        <div className="form-fieldset">
          <div className="form-group">
            <div className="form-group">
              <label htmlFor="id_email">Email</label>
              <input
                id="id_email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        </div>


        <button
          type="button"
          className="post-form__submit"
          onClick={onSubmit}
        >
          Send
        </button>
      </div>
    </div>
  );
}
