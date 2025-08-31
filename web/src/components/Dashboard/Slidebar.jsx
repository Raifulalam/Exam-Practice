import React, { useContext, useState } from "react";
import { UserContext } from "../../Auth/UserContext";
import CreateGameModal from "./Post"; // your modal component
import {
    PlusCircle,
    UserCircle,
} from "lucide-react";

export default function HostSidebar() {
    const { user } = useContext(UserContext);
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="w-64 bg-green-700 text-white p-6 flex flex-col items-center">
            {/* User Info */}
            <UserCircle className="w-20 h-20 mb-4" />
            <h2 className="text-lg font-bold">
                {user?.email?.split("@")[0] || "Player"}
            </h2>
            <p className="text-sm text-green-200">{user?.email}</p>

            {/* Navigation Buttons */}
            <button className="w-full text-left px-3 py-2 rounded bg-green-600 hover:bg-green-500">
                Dashboard
            </button>
            <br />
            <button
                onClick={() => (window.location.href = `/demo`)}
                className="w-full text-left px-3 py-2 rounded bg-green-600 hover:bg-green-500 flex items-center gap-2"
            >
                Demo test
            </button>
            <br />
            <button
                onClick={() => (window.location.href = `/cee-practice`)}
                className="w-full text-left px-3 py-2 rounded bg-green-600 hover:bg-green-500 flex items-center gap-2"
            >
                CEE Practice
            </button>

            {/* Game Creation */}
            <div className="mt-8 space-y-3 w-full">
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full text-left px-3 py-2 rounded bg-green-600 hover:bg-green-500 flex items-center gap-2"
                >
                    <PlusCircle className="w-4 h-4" /> Create a game
                </button>
            </div>

            {/* Modal */}
            <CreateGameModal showModal={showModal} setShowModal={setShowModal} />
        </div>
    );
}
