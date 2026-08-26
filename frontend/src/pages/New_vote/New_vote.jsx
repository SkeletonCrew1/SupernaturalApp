import React, { useEffect, useState } from 'react';
import { newVote } from '../../api/user';
import "./New_vote.css";
import BackButton from "../../shared/ui/BackButton/BackButton";
import { useLocation } from 'react-router-dom';

export default function NewVote({ user, setUser }) {
    const location = useLocation();
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        type: 'promotion',
        description: '',
        user_alias: '',
        agree: 0,
        disagree: 0,
    });

    const setField = (name, value) => {
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await newVote({
                type: form.type,
                description: form.description,
                user_alias: form.user_alias,
                agree: 0,
                disagree: 0,
            });
            window.location.href = '/votes';
        } catch (err) {
            setError(err.message || 'Couldn`t create vote');
        }
    };


    return (
        <main className="vote-catalog">
            <header className="vote-header">
                <div className="vote-header-row">
                    <BackButton onClick={() => window.location.href = '/votes'} />
                    <h1 className="vote-title">New vote</h1>
                    <div className="for-title"></div>
                </div>
            </header>


            <section className="form-section">
                {error ? (
                    <div className="error-message" role="alert">
                        <p>{error}</p>
                    </div>
                ) : null}

                <form className="create-form" onSubmit={onSubmit}>
                    <fieldset className="form-fieldset">

                        <div className="form-group">
                            <label htmlFor="id_type">Type</label>
                            <select
                                id="id_type"
                                name="type"
                                value={form.type}
                                onChange={(e) => setField('type', e.target.value)}
                            >
                                <option value="promotion">promotion</option>
                                <option style={{ display: user?.inquisitor === true ? "inline-flex" : "none" }} value="excommunication">
                                    excommunication
                                </option>
                                <option style={{ display: user?.is_architect === true ? "inline-flex" : "none" }} value="architect">
                                    architect
                                </option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="id_user_alias">User alias</label>
                            <input
                                type="text"
                                id="id_user_alias"
                                name="user_alias"
                                required
                                value={form.user_alias}
                                onChange={(e) => setField('user_alias', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="id_description">Description</label>
                            <input
                                type="text"
                                id="id_description"
                                name="description"
                                required
                                value={form.description}
                                onChange={(e) => setField('description', e.target.value)}
                            />
                        </div>

                    </fieldset>

                    <footer className="form-actions">
                        <button type="submit" className="btn-main">Create vote</button>
                    </footer>
                </form>

            </section>
        </main>
    );
}
