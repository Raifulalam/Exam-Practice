import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AdminBulkEmail() {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [templates, setTemplates] = useState([
        { id: 1, name: "General Update", subject: "Quick update from ExamPrepHub", body: "Hello,\n\nWe hope you're doing well. Here's a short update..." },
        { id: 2, name: "New Course Launch", subject: "New course: Advanced Algorithms", body: "We're excited to announce our new course on Advanced Algorithms..." },
    ]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [recipientsCount, setRecipientsCount] = useState(null);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        if (selectedTemplate) {
            setSubject(selectedTemplate.subject);
            setMessage(selectedTemplate.body);
        }
    }, [selectedTemplate]);

    const handleSend = async () => {
        setErrorMsg("");
        setSuccessMsg("");

        if (!subject.trim() || !message.trim()) {
            setErrorMsg("Please provide both a subject and a message.");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post("/api/admin/send-bulk-email", { subject, message });

            if (res.data && res.data.success) {
                setSuccessMsg(res.data.msg || "Emails queued/sent successfully.");
            } else {
                setErrorMsg(res.data.msg || "Unexpected response from server.");
            }
        } catch (err) {
            console.error(err);
            setErrorMsg(err?.response?.data?.msg || "Failed to send bulk emails. Check server logs.");
        } finally {
            setLoading(false);
        }
    };

    const handleCheckRecipients = async () => {
        setRecipientsCount(null);
        try {
            const res = await axios.get("/api/admin/verified-users-count");
            if (res.data && typeof res.data.count === "number") {
                setRecipientsCount(res.data.count);
            } else if (res.data && Array.isArray(res.data.users)) {
                setRecipientsCount(res.data.users.length);
            } else {
                setRecipientsCount(null);
            }
        } catch (err) {
            setRecipientsCount(null);
        }
    };

    const handlePreview = () => {
        setShowPreview(true);
    };

    return (
        <div className="p-4 sm:p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl sm:text-3xl font-semibold">Bulk Email — Admin</h1>
                <div className="text-sm text-slate-500">Professional UI · Mobile responsive</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-5">
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleCheckRecipients}
                                className="px-3 py-1.5 rounded-lg border text-sm hover:bg-slate-50"
                            >
                                Check recipients
                            </button>
                            <div className="text-sm text-slate-600">Recipients: <span className="font-medium">{recipientsCount ?? "Unknown"}</span></div>
                        </div>

                        <div className="flex items-center gap-2">
                            <select
                                value={selectedTemplate ? selectedTemplate.id : ""}
                                onChange={(e) => {
                                    const id = Number(e.target.value);
                                    const tpl = templates.find((t) => t.id === id) || null;
                                    setSelectedTemplate(tpl);
                                }}
                                className="border rounded-lg px-3 py-1 text-sm"
                            >
                                <option value="">Select template</option>
                                {templates.map((tpl) => (
                                    <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                                ))}
                            </select>

                            <button
                                onClick={() => {
                                    setSelectedTemplate(null);
                                    setSubject("");
                                    setMessage("");
                                    setErrorMsg("");
                                    setSuccessMsg("");
                                }}
                                className="px-3 py-1.5 rounded-lg border text-sm hover:bg-slate-50"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    <label className="block text-sm font-medium text-slate-700">Subject</label>
                    <input
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Enter email subject"
                        className="mt-2 mb-4 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />

                    <label className="block text-sm font-medium text-slate-700">Message</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={`Hi there,\n\nWrite your message here...`}
                        rows={10}
                        className="mt-2 mb-4 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                    />

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSend}
                            disabled={loading}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-white font-medium shadow-sm transition ${loading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        >
                            {loading ? 'Sending...' : 'Send to verified users'}
                        </button>

                        <button
                            onClick={handlePreview}
                            className="px-3 py-2 rounded-lg border text-sm hover:bg-slate-50"
                        >
                            Preview
                        </button>

                        <div className="ml-auto text-sm text-slate-500">Recipients will receive the message as plain HTML/text.</div>
                    </div>

                    {errorMsg && (
                        <div className="mt-4 text-sm text-red-600">{errorMsg}</div>
                    )}
                    {successMsg && (
                        <div className="mt-4 text-sm text-green-600">{successMsg}</div>
                    )}
                </div>

                <aside className="bg-white rounded-2xl shadow-sm p-5 h-full">
                    <h3 className="text-lg font-medium mb-3">Templates & Tips</h3>
                    <div className="flex flex-col gap-3">
                        {templates.map((tpl) => (
                            <div key={tpl.id} className="border rounded-lg p-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <div className="font-medium">{tpl.name}</div>
                                        <div className="text-xs text-slate-500 mt-1">{tpl.subject}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedTemplate(tpl);
                                            }}
                                            className="px-2 py-1 text-sm rounded-md border hover:bg-slate-50"
                                        >
                                            Use
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="mt-3 text-sm text-slate-600">
                            Tips:
                            <ul className="list-disc ml-5 mt-2 text-slate-600">
                                <li>Keep subject short and descriptive.</li>
                                <li>Use a clear call-to-action in the message.</li>
                                <li>Avoid sending large attachments in bulk emails.</li>
                            </ul>
                        </div>

                        <div className="mt-4">
                            <div className="text-xs text-slate-500">Status</div>
                            <div className="mt-1 text-sm">Ready to send</div>
                        </div>
                    </div>
                </aside>
            </div>

            {showPreview && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Email Preview</h2>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="px-2 py-1 text-sm border rounded-lg hover:bg-slate-50"
                            >
                                Close
                            </button>
                        </div>
                        <h3 className="text-lg font-medium mb-2">{subject || "(No subject)"}</h3>
                        <div className="text-sm text-slate-700 whitespace-pre-line">{message || "(No message)"}</div>
                    </div>
                </div>
            )}

            <footer className="mt-6 text-center text-xs text-slate-400">Made with ❤️ ExamPrepHub • Ensure your mail server is configured and rate limits are respected.</footer>
        </div>
    );
}
