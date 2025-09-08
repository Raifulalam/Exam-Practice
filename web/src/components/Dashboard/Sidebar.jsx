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
    Menu,
    X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HostSidebar() {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [isOpen, setIsOpen] = useState(false); // mobile toggle

    return (
        <>
            {/* Hamburger Button for Mobile */}
            <button
                className="fixed top-4 left-4 z-50 md:hidden bg-green-800 text-white p-2 rounded-lg shadow-lg"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-screen w-64 bg-green-800 text-white flex flex-col shadow-lg z-40
                transform transition-transform duration-300
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
                md:translate-x-0 md:static md:shadow-none`}
            >
                {/* User Profile */}
                <div className="p-6 border-b border-green-600 flex flex-col items-center">
                    <UserCircle className="w-20 h-20 mb-3 text-green-200" />
                    <h2 className="text-lg font-semibold">{user?.name || "Host"}</h2>
                    <p className="text-sm text-green-300">{user?.email}</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <SidebarButton
                        icon={<LayoutDashboard />}
                        label="Dashboard"
                        onClick={() => {
                            navigate("/dashboard/host");
                            setIsOpen(false);
                        }}
                    />
                    <SidebarButton
                        icon={<BookOpen />}
                        label="CEE Practice"
                        onClick={() => {
                            navigate("/cee-practice");
                            setIsOpen(false);
                        }}
                    />
                    <SidebarButton
                        icon={<Users />}
                        label="Leaderboard"
                        onClick={() => {
                            navigate("/players");
                            setIsOpen(false);
                        }}
                    />
                    <SidebarButton
                        icon={<BarChart3 />}
                        label="Analytics"
                        onClick={() => {
                            navigate("/analytics");
                            setIsOpen(false);
                        }}
                    />
                </nav>

                {/* Actions */}
                <div className="p-4 border-t border-green-600 space-y-2">
                    <SidebarButton
                        icon={<PlusCircle />}
                        label="Create Game"
                        onClick={() => {
                            setShowModal(true);
                            setIsOpen(false);
                        }}
                    />
                    <SidebarButton
                        icon={<LogOut />}
                        label="Logout"
                        onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/");
                            setIsOpen(false);
                        }}
                    />
                </div>

                {/* Modal */}
                <CreateGameModal showModal={showModal} setShowModal={setShowModal} />
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
