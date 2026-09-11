import { useEffect, useState } from "react";
import {
    useNavigate
} from "react-router-dom";

import SettingsMenu from "../components/settings/SettingsMenu.jsx";
import CelebrationBanner from "../components/celebration/CelebrationBanner.jsx";

import {
    useAuth
} from "../context/auth-context.js";

const getInitials = (
    name
) => {
    if (!name) {
        return "S";
    }

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
            part =>
                part[0]?.toUpperCase()
        )
        .join("");
};

const formatDate = (
    value
) => {
    if (!value) {
        return "Not available";
    }

    const date =
        new Date(
            value
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Not available";
    }

    return date.toLocaleString();
};

const getMemberships = (
    account,
    user
) => {
    if (Array.isArray(account?.organizations)) return account.organizations;
    if (Array.isArray(user?.organizations)) return user.organizations;
    if (
        Array.isArray(
            account?.memberships
        )
    ) {
        return account.memberships;
    }

    if (
        Array.isArray(
            user?.memberships
        )
    ) {
        return user.memberships;
    }

    if (
        Array.isArray(
            account?.organization_members
        )
    ) {
        return account.organization_members;
    }

    if (
        Array.isArray(
            user?.organization_members
        )
    ) {
        return user.organization_members;
    }

    return [];
};

const getOrganization = (
    membership
) => {
    return (
        membership?.organization ||
        membership?.Organization ||
        null
    );
};

const Dashboard = () => {
    const navigate =
        useNavigate();

    const {
        user,
        account,
        logout,
        refreshAccount
    } =
        useAuth();
    const [refreshError, setRefreshError] = useState("");
    useEffect(() => {
        let active = true;
        refreshAccount().catch(() => {
            if (active) setRefreshError("Could not refresh your organizations. Reload to try again.");
        });
        return () => { active = false; };
    }, [refreshAccount]);

    const memberships =
        getMemberships(
            account,
            user
        );

    const displayName =
        user?.name ||
        user?.username ||
        user?.email ||
        "Sentinel User";

    const initials =
        getInitials(
            displayName
        );

    const hasOrganizations =
        memberships.length >
        0;

    const handleLogout =
        async () => {
            await logout();

            navigate(
                "/login",
                {
                    replace:
                        true
                }
            );
        };

    return (
        <div
            className="sentinel-account-page"
        >
            <CelebrationBanner />

            <SettingsMenu />

            <header
                className="sentinel-account-topbar"
            >
                <div
                    className="sentinel-account-brand"
                >
                    <div
                        className="sentinel-account-logo"
                    >
                        S
                    </div>

                    <div>
                        <strong>
                            Sentinel
                        </strong>

                        <span>
                            Account
                        </span>
                    </div>
                </div>

                <div
                    className="sentinel-account-topbar-actions"
                >
                    <div
                        className="sentinel-account-user-chip"
                    >
                        <div
                            className="sentinel-account-avatar sentinel-account-avatar-small"
                        >
                            {initials}
                        </div>

                        <div>
                            <strong>
                                {displayName}
                            </strong>

                            <span>
                                {user?.email}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="btn sentinel-secondary-button"
                        onClick={
                            handleLogout
                        }
                    >
                        <i
                            className="bi bi-box-arrow-right me-2"
                        />

                        Sign out
                    </button>
                </div>
            </header>

            <main
                className="sentinel-account-container"
            >
                {refreshError && <p role="alert">{refreshError}</p>}

                <div className="sentinel-dashboard-toolbar">
                    <div className="sentinel-dashboard-toolbar-copy">
                        <span className="sentinel-dashboard-toolbar-label">
                            Account actions
                        </span>

                        <span className="sentinel-dashboard-toolbar-description">
                            Manage organization access connected to your Sentinel identity.
                        </span>
                    </div>

                    <div className="sentinel-dashboard-actions">
                        {user?.is_platform_admin === true && (
                            <button
                                type="button"
                                className="btn sentinel-admin-review-action"
                                onClick={() =>
                                    navigate(
                                        "/admin/organization-requests"
                                    )
                                }
                            >
                                <i className="bi bi-shield-check" />

                                <span>
                                    Review requests
                                </span>
                            </button>
                        )}

                        <button
                            type="button"
                            className="btn sentinel-invitation-action"
                            onClick={() =>
                                navigate(
                                    "/invitations/accept"
                                )
                            }
                        >
                            <span className="sentinel-invitation-action-icon">
                                <i className="bi bi-envelope-open" />
                            </span>

                            <span className="sentinel-invitation-action-copy">
                                <strong>
                                    Join with invitation
                                </strong>

                                <small>
                                    Enter an organization invite
                                </small>
                            </span>

                            <i className="bi bi-arrow-right sentinel-invitation-action-arrow" />
                        </button>
                    </div>
                </div>

                <section
                    className="sentinel-account-hero"
                >
                    <div
                        className="sentinel-account-avatar"
                    >
                        {initials}
                    </div>

                    <div
                        className="sentinel-account-hero-content"
                    >
                        <div
                            className="sentinel-eyebrow"
                        >
                            SENTINEL IDENTITY
                        </div>

                        <h1>
                            {displayName}
                        </h1>

                        <p>
                            Your personal identity across
                            the Sentinel ecosystem.
                        </p>

                        <div
                            className="sentinel-account-badges"
                        >
                            <span
                                className="sentinel-account-badge"
                            >
                                <i
                                    className="bi bi-person"
                                />

                                Personal account
                            </span>

                            {
                                user?.email_verified_at
                                    ? (
                                        <span
                                            className="sentinel-account-badge"
                                        >
                                            <i
                                                className="bi bi-patch-check"
                                            />

                                            Verified email
                                        </span>
                                    )
                                    : (
                                        <span
                                            className="sentinel-account-badge"
                                        >
                                            <i
                                                className="bi bi-exclamation-circle"
                                            />

                                            Email not verified
                                        </span>
                                    )
                            }

                            <span
                                className="sentinel-account-badge"
                            >
                                <i
                                    className="bi bi-shield-check"
                                />

                                Active
                            </span>
                        </div>
                    </div>
                </section>

                <section
                    className="sentinel-account-grid"
                >
                    <article
                        className="sentinel-account-panel sentinel-account-panel-large"
                    >
                        <div
                            className="sentinel-account-panel-header"
                        >
                            <div>
                                <div
                                    className="sentinel-account-panel-icon"
                                >
                                    <i
                                        className="bi bi-person"
                                    />
                                </div>

                                <div>
                                    <h2>
                                        Personal information
                                    </h2>

                                    <p>
                                        Your primary Sentinel identity.
                                    </p>
                                </div>
                            </div>

                            <span
                                className="sentinel-account-coming-soon"
                            >
                                Profile management coming soon
                            </span>
                        </div>

                        <div
                            className="sentinel-account-details"
                        >
                            <div>
                                <span>
                                    Full name
                                </span>

                                <strong>
                                    {
                                        user?.name ||
                                        "—"
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Username
                                </span>

                                <strong>
                                    {
                                        user?.username ||
                                        "—"
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Email
                                </span>

                                <strong>
                                    {
                                        user?.email ||
                                        "—"
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Last login
                                </span>

                                <strong>
                                    {
                                        formatDate(
                                            user?.last_login_at
                                        )
                                    }
                                </strong>
                            </div>
                        </div>
                    </article>

                    <article
                        className="sentinel-account-panel sentinel-account-panel-large"
                    >
                        <div
                            className="sentinel-account-panel-header"
                        >
                            <div>
                                <div
                                    className="sentinel-account-panel-icon"
                                >
                                    <i
                                        className="bi bi-buildings"
                                    />
                                </div>

                                <div>
                                    <h2>
                                        Organizations
                                    </h2>

                                    <p>
                                        Organizations connected to
                                        your Sentinel identity.
                                    </p>
                                </div>
                            </div>

                            {
                                hasOrganizations && (
                                    <span
                                        className="sentinel-account-count"
                                    >
                                        {
                                            memberships.length
                                        }

                                        {
                                            memberships.length ===
                                                1
                                                ? " organization"
                                                : " organizations"
                                        }
                                    </span>
                                )
                            }
                        </div>

                        {
                            !hasOrganizations
                                ? (
                                    <div
                                        className="sentinel-empty-organization"
                                    >
                                        <div
                                            className="sentinel-empty-organization-icon"
                                        >
                                            <i
                                                className="bi bi-building"
                                            />
                                        </div>

                                        <div>
                                            <h3>
                                                No organization connected
                                            </h3>

                                            <p>
                                                Your Sentinel account works
                                                independently. You do not
                                                need to belong to an
                                                organization to use Sentinel.
                                            </p>
                                        </div>

                                        <div
                                            className="sentinel-empty-organization-actions"
                                        >
                                            <button
                                                type="button"
                                                className="btn sentinel-primary-button"
                                                onClick={() =>
                                                    navigate(
                                                        "/organizations/request"
                                                    )
                                                }
                                            >
                                                <i className="bi bi-building-add me-2" />

                                                Request organization
                                            </button>

                                            <span>
                                                Already invited? Invitation joining
                                                will be available separately.
                                            </span>
                                        </div>
                                    </div>
                                )
                                : (
                                    <div
                                        className="sentinel-organization-list"
                                    >
                                        {
                                            memberships.map(
                                                membership => {
                                                    const organization =
                                                        getOrganization(
                                                            membership
                                                        );

                                                    const organizationName =
                                                        organization?.name ||
                                                        "Organization";

                                                    return (
                                                        <div
                                                            key={
                                                                membership.id
                                                            }
                                                            className="sentinel-organization-item"
                                                        >
                                                            <div
                                                                className="sentinel-organization-mark"
                                                            >
                                                                {
                                                                    getInitials(
                                                                        organizationName
                                                                    )
                                                                }
                                                            </div>

                                                            <div
                                                                className="sentinel-organization-item-content"
                                                            >
                                                                <strong>
                                                                    {
                                                                        organizationName
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        organization?.legal_name ||
                                                                        organization?.email ||
                                                                        "Sentinel organization"
                                                                    }
                                                                </span>
                                                            </div>

                                                            <div
                                                                className="sentinel-organization-role"
                                                            >
                                                                {
                                                                    membership?.role ||
                                                                    "member"
                                                                }
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )
                                        }
                                    </div>
                                )
                        }
                    </article>

                    <article
                        className="sentinel-account-panel"
                    >
                        <div
                            className="sentinel-account-panel-header"
                        >
                            <div>
                                <div
                                    className="sentinel-account-panel-icon"
                                >
                                    <i
                                        className="bi bi-credit-card"
                                    />
                                </div>

                                <div>
                                    <h2>
                                        Subscriptions
                                    </h2>

                                    <p>
                                        Individual and organization plans.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div
                            className="sentinel-account-placeholder"
                        >
                            <i
                                className="bi bi-receipt"
                            />

                            <div>
                                <strong>
                                    No subscription system yet
                                </strong>

                                <span>
                                    Individual and organization
                                    subscriptions will appear here.
                                </span>
                            </div>
                        </div>
                    </article>

                    <article
                        className="sentinel-account-panel"
                    >
                        <div
                            className="sentinel-account-panel-header"
                        >
                            <div>
                                <div
                                    className="sentinel-account-panel-icon"
                                >
                                    <i
                                        className="bi bi-shield-lock"
                                    />
                                </div>

                                <div>
                                    <h2>
                                        Security
                                    </h2>

                                    <p>
                                        Your identity protection.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div
                            className="sentinel-security-list"
                        >
                            <div>
                                <i
                                    className="bi bi-check-circle"
                                />

                                <span>
                                    Password protected
                                </span>
                            </div>

                            <div>
                                <i
                                    className="bi bi-check-circle"
                                />

                                <span>
                                    Email verification enabled
                                </span>
                            </div>

                            <div>
                                <i
                                    className="bi bi-check-circle"
                                />

                                <span>
                                    Session-based authentication
                                </span>
                            </div>
                        </div>
                    </article>
                </section>

                <section
                    className="sentinel-account-apps-section"
                >
                    <div
                        className="sentinel-account-section-heading"
                    >
                        <div>
                            <div
                                className="sentinel-eyebrow"
                            >
                                SENTINEL ECOSYSTEM
                            </div>

                            <h2>
                                Applications
                            </h2>
                        </div>

                        <span>
                            Access will depend on
                            subscriptions and entitlements.
                        </span>
                    </div>

                    <div
                        className="sentinel-app-grid"
                    >
                        <div
                            className="sentinel-app-card sentinel-app-card-active"
                        >
                            <div
                                className="sentinel-app-icon"
                            >
                                <i
                                    className="bi bi-person-badge"
                                />
                            </div>

                            <div>
                                <h3>
                                    Sentinel Identity
                                </h3>

                                <p>
                                    Authentication and identity management.
                                </p>
                            </div>

                            <span
                                className="sentinel-app-status"
                            >
                                Core
                            </span>
                        </div>

                        <div
                            className="sentinel-app-card"
                        >
                            <div
                                className="sentinel-app-icon"
                            >
                                <i
                                    className="bi bi-receipt"
                                />
                            </div>

                            <div>
                                <h3>
                                    Sentinel Books
                                </h3>

                                <p>
                                    Accounting and finance.
                                </p>
                            </div>

                            <span
                                className="sentinel-app-status"
                            >
                                Coming soon
                            </span>
                        </div>

                        <div
                            className="sentinel-app-card"
                        >
                            <div
                                className="sentinel-app-icon"
                            >
                                <i
                                    className="bi bi-people"
                                />
                            </div>

                            <div>
                                <h3>
                                    Sentinel HRMS
                                </h3>

                                <p>
                                    Workforce and people management.
                                </p>
                            </div>

                            <span
                                className="sentinel-app-status"
                            >
                                Coming soon
                            </span>
                        </div>

                        <div
                            className="sentinel-app-card"
                        >
                            <div
                                className="sentinel-app-icon"
                            >
                                <i
                                    className="bi bi-briefcase"
                                />
                            </div>

                            <div>
                                <h3>
                                    Sentinel CRM
                                </h3>

                                <p>
                                    Customer relationship management.
                                </p>
                            </div>

                            <span
                                className="sentinel-app-status"
                            >
                                Coming soon
                            </span>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
