import React, { useState, useEffect } from 'react';
import { FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import BackButton from '../../shared/ui/BackButton/BackButton';
import axios from 'axios';
import "./Mail.css";
const API_ENDPOINT = '/api/mail/mail';

export default function Mail() {
  const [headerText, setHeaderText] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [statuses, setStatuses] = useState({
      copper: true,
      gold: false,
      silver: false,
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

    if (selectedStatuses.length == 0) {
        setError('Please choose at least one status');
      return;
    }

    if (headerText == ""){
      setError('Headear is required. Please fill the fild');
    return;

    }
    if (bodyText == ""){
      setError('Text is required. Please fill the fild');
    return;

    }



    const data = {
      TargetStatus: selectedStatuses,
      Subject: headerText,
      BodyText: bodyText
    };

    try {
      const response = await axios.post(API_ENDPOINT, data);

      console.log("Mail", response.data);
      setSuccess('Mails successfully sended');

      setHeaderText("");
      setBodyText("");
      setError("")
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
              <BackButton onClick={() => window.location.href = '/admin'}/>
              <h1 className="mail-title">Mailing</h1>
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
              <FormGroup className="checkbox-group">
                                <FormControlLabel
                  control={
                    <Checkbox
                      checked={statuses.copper}
                      onChange={handleCheckboxChange}
                      name="copper"
                    />
                  }
                  label="Copper"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={statuses.silver}
                      onChange={handleCheckboxChange}
                      name="silver"
                    />
                  }
                  label="Silver"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={statuses.gold}
                      onChange={handleCheckboxChange}
                      name="gold"
                    />
                  }
                  label="Gold"
                />
              </FormGroup>

              <div className="form-group">
                <label htmlFor="id_user_alias">Subject</label>
                <input
                    type="text"
                    id="id_user_alias"
                    name="user_alias"
                    required
                    value={headerText}
                    onChange={(e) => setHeaderText(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="id_description">Text</label>
                <textarea
                    id="id_description"
                    name="description"
                    required
                    rows="6"
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
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
