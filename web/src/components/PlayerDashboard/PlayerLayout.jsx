// src/Layout/PlayerLayout.jsx
import React from "react";
import PlayerSidebar from "./Sidebar";

export default function PlayerLayout({ children }) {
    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    return (
        <div className="flex min-h-screen bg-green-50">
            <PlayerSidebar onLogout={handleLogout} />
            <main className="flex-1 lg:ml-64 p-6">{children}</main>
        </div>
    );
}
