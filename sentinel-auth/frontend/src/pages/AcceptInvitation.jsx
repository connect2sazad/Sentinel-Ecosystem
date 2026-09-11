import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/auth-context.js";
import organizationApi from "../api/organization.api.js";
import SettingsMenu from "../components/settings/SettingsMenu.jsx";

const AcceptInvitation = () => {
    const { user, refreshAccount } = useAuth();
    const [token, setToken] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [joined, setJoined] = useState(null);
    const [refreshWarning, setRefreshWarning] = useState("");
    const submitting = useRef(false);

    const handleSubmit = async event => {
        event.preventDefault();

        if (submitting.current || joined) return;

        const value = token.trim();

        if (!/^[a-f0-9]{64}$/.test(value)) {
            setError("Paste the complete 64-character invitation token.");
            return;
        }

        if (!user?.email_verified_at) {
            setError("Verify your account email before accepting an invitation.");
            return;
        }

        submitting.current = true;
        setBusy(true);
        setError("");

        try {
            const result = await organizationApi.acceptInvitation(value);

            // Acceptance succeeded even if the subsequent account refresh fails.
            setJoined({
                name: result?.organization?.name || "the organization"
            });
            setToken("");

            try {
                await refreshAccount();
            } catch {
                setRefreshWarning(
                    "You joined successfully, but account details could not refresh. Open your dashboard to try again."
                );
            }
        } catch (requestError) {
            const message = requestError?.response?.data?.message;
            setError(
                typeof message === "string"
                    ? message
                    : "Could not confirm acceptance. Check your dashboard before trying again."
            );
        } finally {
            submitting.current = false;
            setBusy(false);
        }
    };

    return (
        <div className="sentinel-account-page sentinel-invitation-page">
            <SettingsMenu />

            <main className="sentinel-invitation-container">
                <Link className="sentinel-invitation-back" to="/dashboard">← Back to dashboard</Link>

                <section className="sentinel-account-panel sentinel-invitation-card">
                    <div className="sentinel-invitation-icon" aria-hidden="true"><i className="bi bi-envelope-open" /></div>
                    <div className="sentinel-eyebrow">SENTINEL ORGANIZATIONS</div>
                    <h1>Join with invitation</h1>

                    {joined ? (
                        <div role="status">
                            <p>
                                You joined <strong>{joined.name}</strong> as a member.
                            </p>

                            {refreshWarning && (
                                <p className="alert alert-warning">
                                    {refreshWarning}
                                </p>
                            )}

                            <Link
                                to="/dashboard"
                                className="btn sentinel-secondary-button"
                            >
                                Open dashboard
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <p className="sentinel-invitation-identity">
                                Signed in as <strong>{user?.email}</strong>.
                                The invitation must be addressed to this email.
                            </p>

                            {!user?.email_verified_at && (
                                <p className="alert alert-warning">
                                    Your email must be verified before you can join.
                                </p>
                            )}

                            {error && (
                                <p className="alert alert-danger" role="alert">
                                    {error}
                                </p>
                            )}

                            <label htmlFor="invitation-token" className="form-label">
                                Invitation token
                            </label>

                            <input
                                id="invitation-token"
                                type="password"
                                className="form-control"
                                value={token}
                                onChange={event => {
                                    setToken(event.target.value);
                                    setError("");
                                }}
                                autoComplete="off"
                                spellCheck={false}
                                required
                                disabled={busy}
                                aria-describedby="invitation-help"
                            />

                            <p id="invitation-help" className="mt-2">
                                Paste the token supplied by your organization administrator.
                            </p>

                            <button
                                type="submit"
                                className="btn sentinel-invitation-submit"
                                disabled={busy || !user?.email_verified_at}
                            >
                                {busy ? "Joining…" : "Accept invitation"}
                            </button>
                        </form>
                    )}
                </section>
            </main>
        </div>
    );
};

export default AcceptInvitation;
