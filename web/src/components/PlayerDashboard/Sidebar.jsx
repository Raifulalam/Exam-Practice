// src/components/Player/PlayerSidebar.jsx
import React, { useContext, useState } from "react";
import { UserContext } from "../../Auth/UserContext";
import {
    UserCircle,
    PlusCircle,
    LogOut,
    LayoutDashboard,
    BookOpen,
    Gamepad2,
    ListOrdered,
    History,
    Menu,
    X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PlayerSidebar({ onLogout }) {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Hamburger Button (Visible only on mobile) */}
            <button
                className="fixed top-4 left-4 z-50 md:hidden bg-green-800 text-white p-2 rounded-lg shadow-lg"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-green-800 text-white flex flex-col shadow-lg z-40 
                transform transition-transform duration-300 
                ${isOpen ? "translate-x-0" : "-translate-x-full"} 
                md:translate-x-0`}
            >
                {/* User Profile */}
                <div className="p-6 border-b border-green-600 flex flex-col items-center">
                    <UserCircle className="w-20 h-20 mb-3 text-green-200" />
                    <h2 className="text-lg font-semibold">
                        {user?.name || user?.email?.split("@")[0] || "Player"}
                    </h2>
                    <p className="text-sm text-green-300">{user?.email}</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    <SidebarButton
                        icon={<LayoutDashboard />}
                        label="Dashboard"
                        onClick={() => {
                            navigate("/dashboard/player");
                            setIsOpen(false);
                        }}
                    />
                    <SidebarButton
                        icon={<BookOpen />}
                        label="Demo Test"
                        onClick={() => {
                            navigate("/demo");
                            setIsOpen(false);
                        }}
                    />
                    <SidebarButton
                        icon={<Gamepad2 />}
                        label="CEE Practice"
                        onClick={() => {
                            navigate("/cee-practice");
                            setIsOpen(false);
                        }}
                    />
                    <SidebarButton
                        icon={<ListOrdered />}
                        label="Questions List"
                        onClick={() => {
                            navigate("/gamelist");
                            setIsOpen(false);
                        }}
                    />
                    <SidebarButton
                        icon={<History />}
                        label="My Attempts"
                        onClick={() => {
                            navigate("/myattempt");
                            setIsOpen(false);
                        }}
                    />
                    <SidebarButton
                        icon={<History />}
                        label="Leaderboard"
                        onClick={() => {
                            navigate("/players/leaderboard");
                            setIsOpen(false);
                        }}
                    />
                </nav>

                {/* Actions */}
                <div className="p-4 border-t border-green-600 space-y-2">
                    <SidebarButton
                        icon={<PlusCircle />}
                        label="Create Practice Set"
                        onClick={() => {
                            navigate("/create-practice");
                            setIsOpen(false);
                        }}
                    />
                    <SidebarButton
                        icon={<LogOut />}
                        label="Logout"
                        onClick={() => {
                            if (onLogout) onLogout();
                            localStorage.removeItem("token");
                            navigate("/");
                            setIsOpen(false);
                        }}
                    />
                </div>
            </div>
        </>
    );
}

function SidebarButton({ icon, label, onClick }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-3 w-full px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200"
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}
