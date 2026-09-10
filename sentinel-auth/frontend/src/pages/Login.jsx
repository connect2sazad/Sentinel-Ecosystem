import {
    Link
} from "react-router-dom";

import SettingsMenu from "../components/settings/SettingsMenu.jsx";

import CelebrationBanner from "../components/celebration/CelebrationBanner.jsx";

const Login = () => {
    return (
        <div
            className="sentinel-auth-page"
        >
            <CelebrationBanner />

            <SettingsMenu />

            {/* Windows XP desktop decoration */}
            <div
                className="sentinel-xp-desktop-icons"
            >
                <div
                    className="sentinel-xp-desktop-icon"
                >
                    <i className="bi bi-pc-display" />

                    <span>
                        My Sentinel
                    </span>
                </div>

                <div
                    className="sentinel-xp-desktop-icon"
                >
                    <i className="bi bi-globe2" />

                    <span>
                        Sentinel Network
                    </span>
                </div>
            </div>

            <main
                className="sentinel-auth-shell"
            >
                {/* Windows XP title bar */}
                <div
                    className="sentinel-window-titlebar"
                >
                    <div
                        className="sentinel-window-title"
                    >
                        <span
                            className="sentinel-window-icon"
                        >
                            S
                        </span>

                        Sentinel Identity
                    </div>

                    <div
                        className="sentinel-window-controls"
                    >
                        <button
                            type="button"
                            aria-label="Minimize"
                        >
                            _
                        </button>

                        <button
                            type="button"
                            aria-label="Maximize"
                        >
                            □
                        </button>

                        <button
                            type="button"
                            className="sentinel-window-close"
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div
                    className="sentinel-auth-layout"
                >
                    <section
                        className="sentinel-auth-visual"
                    >
                        <div
                            className="sentinel-brand-block"
                        >
                            <div
                                className="sentinel-brand-mark"
                            >
                                S
                            </div>

                            <div
                                className="sentinel-eyebrow"
                            >
                                SENTINEL IDENTITY
                            </div>

                            <h1
                                className="sentinel-hero-title"
                            >
                                One identity.
                                <br />

                                Every Sentinel app.
                            </h1>

                            <p
                                className="sentinel-hero-description"
                            >
                                A unified identity layer built
                                for the entire Sentinel ecosystem.
                            </p>

                            <div
                                className="sentinel-feature-row"
                            >
                                <span>
                                    Secure
                                </span>

                                <span>
                                    Private
                                </span>

                                <span>
                                    Connected
                                </span>
                            </div>
                        </div>

                        <div
                            className="sentinel-ocean-decoration"
                        >
                            <div
                                className="sentinel-orbit sentinel-orbit-one"
                            />

                            <div
                                className="sentinel-orbit sentinel-orbit-two"
                            />

                            <div
                                className="sentinel-orbit sentinel-orbit-three"
                            />
                        </div>
                    </section>

                    <section
                        className="sentinel-auth-form-column"
                    >
                        <div
                            className="sentinel-auth-card"
                        >
                            <div
                                className="sentinel-mobile-brand"
                            >
                                <div
                                    className="sentinel-brand-mark"
                                >
                                    S
                                </div>
                            </div>

                            <div
                                className="sentinel-eyebrow"
                            >
                                WELCOME BACK
                            </div>

                            <h2
                                className="sentinel-auth-title"
                            >
                                Sign in to Sentinel
                            </h2>

                            <p
                                className="sentinel-auth-description"
                            >
                                Continue to your account and
                                connected Sentinel applications.
                            </p>

                            <form>
                                <div
                                    className="mb-3"
                                >
                                    <label
                                        className="form-label sentinel-label"
                                    >
                                        Email or username
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control sentinel-input"
                                        placeholder="you@example.com"
                                    />
                                </div>

                                <div
                                    className="mb-2"
                                >
                                    <div
                                        className="d-flex justify-content-between align-items-center"
                                    >
                                        <label
                                            className="form-label sentinel-label"
                                        >
                                            Password
                                        </label>

                                        <Link
                                            to="/forgot-password"
                                            className="sentinel-text-link"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>

                                    <input
                                        type="password"
                                        className="form-control sentinel-input"
                                        placeholder="Enter your password"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn sentinel-primary-button w-100 mt-4"
                                >
                                    Continue
                                </button>
                            </form>

                            <div
                                className="sentinel-divider"
                            >
                                <span>
                                    New to Sentinel?
                                </span>
                            </div>

                            <button
                                type="button"
                                className="btn sentinel-secondary-button w-100"
                            >
                                Create account
                            </button>

                            <div
                                className="sentinel-auth-footer"
                            >
                                <span>
                                    Sentinel Identity
                                </span>

                                <span>
                                    ·
                                </span>

                                <span>
                                    Privacy
                                </span>

                                <span>
                                    ·
                                </span>

                                <span>
                                    Security
                                </span>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* Windows XP bottom bar */}
            <div
                className="sentinel-xp-taskbar"
            >
                <button
                    type="button"
                    className="sentinel-xp-start"
                >
                    <i className="bi bi-windows" />

                    <span>
                        start
                    </span>
                </button>

                <div
                    className="sentinel-xp-task"
                >
                    <span>
                        S
                    </span>

                    Sentinel Identity
                </div>

                <div
                    className="sentinel-xp-clock"
                >
                    Sentinel
                </div>
            </div>
        </div>
    );
};

export default Login;