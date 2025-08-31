// src/components/Host/HostLayout.js
import React from "react";
import HostSidebar from "./Sidebar";

export default function HostLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar always visible */}
            <HostSidebar />

            {/* Page Content */}
            <div className="flex-1 p-6 overflow-y-auto">
                {children}
            </div>
        </div>
    );
}
