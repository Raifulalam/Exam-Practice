// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import DashboardHost from "./components/DashboardHost";
import DashboardPlayer from "./components/DashboardPlayer";
import "./index.css";
import { UserProvider } from "./Auth/UserContext";
import PracticePlay from "./components/PracticePlay";
import PracticeDemo from "./components/Demo";

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
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
