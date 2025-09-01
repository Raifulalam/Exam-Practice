// src/components/Player/PlayerSidebar.jsx
import React, { useState, useContext } from "react";
import { UserContext } from "../../Auth/UserContext";
import { UserCircle, PlusCircle, LogOut, Menu, X } from "lucide-react";

export default function PlayerSidebar({ onLogout }) {
    const { user } = useContext(UserContext);
    const [isOpen, setIsOpen] = useState(true);

    const menuItems = [
        { label: "Dashboard", href: "/player/dashboard" },
        { label: "Demo Test", href: "/demo" },
        { label: "CEE Practice", href: "/cee-practice" },
        { label: "Questions List", href: "/gamelist" },
        { label: "My Attempts", href: "/myattempt" },
    ];

    return (
        <>
            {/* Toggle Button (for mobile) */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 bg-green-700 text-white p-2 rounded"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full bg-green-700 text-white p-6 flex flex-col items-center transition-transform duration-300 z-40
                ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:w-64`}
            >
                <UserCircle className="w-20 h-20 mb-4" />
                <h2 className="text-lg font-bold">{user?.name || "Player"}</h2>
                <p className="text-sm text-green-200 mb-6">{user?.email}</p>

                <nav className="w-full space-y-2">
                    {menuItems.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => (window.location.href = item.href)}
                            className="w-full text-left px-3 py-2 rounded bg-green-600 hover:bg-green-500"
                        >
                            {item.label}
                        </button>
                    ))}

                    <button
                        onClick={() => (window.location.href = "/create-practice")}
                        className="w-full text-left px-3 py-2 rounded bg-green-600 hover:bg-green-500 flex items-center gap-2 mt-4"
                    >
                        <PlusCircle className="w-4 h-4" /> Create Practice Set
                    </button>

                    <button
                        onClick={onLogout}
                        className="w-full text-left px-3 py-2 rounded bg-red-500 hover:bg-red-400 flex items-center gap-2 mt-4"
                    >
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </nav>
            </aside>
        </>
    );
}
