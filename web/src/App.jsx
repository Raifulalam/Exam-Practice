// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import DashboardHost from "./components/Dashboard/DashboardHost";
import DashboardPlayer from "./components/PlayerDashboard/DashboardPlayer";
import "./index.css";
import { UserProvider } from "./Auth/UserContext";
import PracticePlay from "./components/PlayerDashboard/PracticePlay";
import PracticeDemo from "./components/PlayerDashboard/Demo";
import QuizApp from "./components/PlayerDashboard/QuizApp";
import Players from "./components/Dashboard/Player";
import Analytics from "./components/Dashboard/Analytics";
import GamesList from "./components/PlayerDashboard/GamesList";
import AttemptGame from "./components/PlayerDashboard/Attemptgames";
import MyAttempts from "./components/PlayerDashboard/MyScore";
import CreatePracticeSetModal from "./components/PlayerDashboard/CreatePracticeSetModel";
import PlayerLeaderboard from "./components/PlayerDashboard/Leaderboard";

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
          <Route path="/players/leaderboard" element={<PlayerLeaderboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/gamelist" element={<GamesList />} />
          <Route path="/attempt/:gameCode" element={<AttemptGame />} />
          <Route path="/myattempt" element={<MyAttempts />} />
          <Route path="/create-practice" element={<CreatePracticeSetModal />} />

        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
