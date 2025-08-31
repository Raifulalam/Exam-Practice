import React from "react";
import HostSidebar from "./Slidebar";

export default function DashboardHost() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50">
            <HostSidebar />
            <h1 className="text-3xl font-bold mb-4">🎯 Host Dashboard</h1>
            <p>Create games, manage players, and view analytics.</p>
        </div>
    );
}
