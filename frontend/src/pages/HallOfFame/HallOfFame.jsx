import React, { useEffect, useState } from "react";
import { getArchitects } from "../../api/report";
import "./HallOfFame.css";
import BackButton from "../../shared/ui/BackButton/BackButton";

export default function HallOfFame() {
  const [architects, setArchitects] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const res = await getArchitects();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setArchitects(Array.isArray(data?.users) ? data.users : []);
    } catch (err) {
      setError(err?.message || "Couldn't get amy architects");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="vote-catalog">
      <header className="vote-header">
        <div className="vote-header-row">
          <BackButton onClick={() => window.location.href = '/'}/>
          <h1 className="vote-title">Hall of Fame</h1>
          <div className="for-title"></div>
        </div>
      </header>

      {error && <div className="vote-error">
                        <p>{error}</p>
                    </div>}

      <section className="archs">
        {architects.map((arch) => {
          const { alias, id } = arch;

          return (
            <article className="arch-card">
              <div className="arch-content">
                <p className="arch-meta-alias">{alias}</p>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
