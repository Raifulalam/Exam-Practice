// src/components/Host/HostSidebar.jsx
import React, { useContext, useState } from "react";
import { UserContext } from "../../Auth/UserContext";
import CreateGameModal from "./CreateGame";
import {
    PlusCircle,
    UserCircle,
    LayoutDashboard,
    BookOpen,
    Gamepad2,
    LogOut,
    BarChart3,
    Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HostSidebar() {
    const { user } = useContext(UserContext);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="w-64 min-h-screen bg-green-800 text-white flex flex-col shadow-lg">
            {/* User Profile */}
            <div className="p-6 border-b border-green-600 flex flex-col items-center">
                <UserCircle className="w-20 h-20 mb-3 text-green-200" />
                <h2 className="text-lg font-semibold">
                    {user?.email?.split("@")[0] || "Host"}
                </h2>
                <p className="text-sm text-green-300">{user?.email}</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                <SidebarButton
                    icon={<LayoutDashboard />}
                    label="Dashboard"
                    onClick={() => navigate("/dashboard/host")}
                />
                <SidebarButton
                    icon={<BookOpen />}
                    label="CEE Practice"
                    onClick={() => navigate("/cee-practice")}
                />
                <SidebarButton
                    icon={<Users />}
                    label="Leaderboard"
                    onClick={() => navigate("/players")}
                />
                <SidebarButton
                    icon={<BarChart3 />}
                    label="Analytics"
                    onClick={() => navigate("/analytics")}
                />
            </nav>

            {/* Actions */}
            <div className="p-4 border-t border-green-600 space-y-2">
                <SidebarButton
                    icon={<PlusCircle />}
                    label="Create Game"
                    onClick={() => setShowModal(true)}
                />
                <SidebarButton
                    icon={<LogOut />}
                    label="Logout"
                    onClick={() => {
                        localStorage.removeItem("token");
                        navigate("/");
                    }}
                />
            </div>

            {/* Modal */}
            <CreateGameModal showModal={showModal} setShowModal={setShowModal} />
        </div>
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
