// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import DashboardHost from "./components/Dashboard/DashboardHost";
import DashboardPlayer from "./components/DashboardPlayer";
import "./index.css";
import { UserProvider } from "./Auth/UserContext";
import PracticePlay from "./components/PracticePlay";
import PracticeDemo from "./components/Demo";
import QuizApp from "./components/QuizApp";
import Players from "./components/Dashboard/Player";
import Analytics from "./components/Dashboard/Analytics";
import GamesList from "./components/GamesList";
import AttemptGame from "./components/Attemptgames";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Dashboards */}
          <Route path="/dashboard/host" element={<DashboardHost />} />
          <Route path="/dashboard/player" element={<DashboardPlayer />} />

          {/* Catch-all redirect */}
          <Route path="/practice/:id" element={<PracticePlay />} />
          <Route path="/demo" element={<PracticeDemo />} />
          <Route path="/cee-practice" element={<QuizApp />} />
          <Route path="/players" element={<Players />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/gamelist" element={<GamesList />} />
          <Route path="/attempt/:gameCode" element={<AttemptGame />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
