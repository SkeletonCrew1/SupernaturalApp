import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import NotFound from "./pages/NotFound/NotFound";
import Mail from "./pages/Mail/Mail";
import Invite from "./pages/Invite/Invite";
import VotingCourt from "./pages/Voting_court/Voting_court";
import NewVote from "./pages/New_vote/New_vote";
import Admin_page from "./pages/Admin_page/Admin";
import HallOfFame from "./pages/HallOfFame/HallOfFame";
import EnterPassword from "./pages/EnterPassword/EnterPassword";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { session } from "./api/auth";
import { checkIP } from "./api/user";

function ProtectedRoute({ user, children }) {
  if (user === undefined) {
    return <div>Loading...</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ user, children }) {
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  useEffect(() => {
    (async () => {
      const res = await checkIP();
      if (res.isBanned){
        window.location.href = 'https://birdwatch.org.ua/ukraine';
      }
    })();
  }, []);

  const [user, setUser] = useState(undefined);

  const [passwordVerified, setPasswordVerified] = useState(
    sessionStorage.getItem("passwordVerified") === "true"
  );

  useEffect(() => {
    (async () => {
      const res = await session();
      setUser(res.ok ? await res.json() : null);
    })();
  }, []);

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/enter-password"
          element={
            <EnterPassword
              setPasswordVerified={setPasswordVerified}
            />
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute user={user}>
              <Home user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/login"
          element={
            !passwordVerified ? (
              <Navigate to="/enter-password" replace />
            ) : (
              <GuestRoute user={user}>
                <Login setUser={setUser} />
              </GuestRoute>
            )
          }
        />

        <Route
          path="/register/:invite_token?"
          element={
            window.location.pathname.startsWith("/register/") || passwordVerified ? (
              <GuestRoute user={user}>
                <Register />
              </GuestRoute>
            ) : (
              <Navigate to="/enter-password" replace />
            )
          }
        />

        <Route
          path="/votes"
          element={
            <ProtectedRoute user={user}>
              <VotingCourt user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/votes/new"
          element={
            <ProtectedRoute user={user}>
              <NewVote user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user}>
              <Admin_page user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mail"
          element={
            <ProtectedRoute user={user}>
              <Mail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/invite"
          element={
            <ProtectedRoute user={user}>
              <Invite />
            </ProtectedRoute>
          }
        />

        <Route
          path="/architects"
          element={
            <ProtectedRoute user={user} >
              <HallOfFame />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <ProtectedRoute user={user}>
              <NotFound />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
