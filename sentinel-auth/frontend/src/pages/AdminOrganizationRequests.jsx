import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import adminOrganizationApi
    from "../api/admin-organization.api.js";

import CelebrationBanner
    from "../components/celebration/CelebrationBanner.jsx";

import SettingsMenu
    from "../components/settings/SettingsMenu.jsx";

const getApiError = (
    error
) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Something went wrong."
    );
};

const formatDate = (
    value
) => {
    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "—";
    }

    return date.toLocaleString();
};

const AdminOrganizationRequests = () => {
    const navigate =
        useNavigate();

    const [
        requests,
        setRequests
    ] = useState([]);

    const [
        statusFilter,
        setStatusFilter
    ] = useState(
        "pending"
    );

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        actionLoadingId,
        setActionLoadingId
    ] = useState(null);

    const [
        error,
        setError
    ] = useState("");

    const [
        success,
        setSuccess
    ] = useState("");

    const [
        rejectTarget,
        setRejectTarget
    ] = useState(null);

    const [
        rejectionReason,
        setRejectionReason
    ] = useState("");

    const loadRequests =
        async (
            status =
                statusFilter
        ) => {
            setLoading(true);
            setError("");

            try {
                const result =
                    await adminOrganizationApi
                        .getRequests(
                            status
                        );

                setRequests(
                    Array.isArray(
                        result
                    )
                        ? result
                        : []
                );
            } catch (
                requestError
            ) {
                setError(
                    getApiError(
                        requestError
                    )
                );
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        loadRequests(
            statusFilter
        );
    }, [
        statusFilter
    ]);

    const counts =
        useMemo(
            () => {
                return {
                    total:
                        requests.length,

                    pending:
                        requests.filter(
                            request =>
                                request
                                    ?.verification_status ===
                                "pending"
                        ).length,

                    approved:
                        requests.filter(
                            request =>
                                request
                                    ?.verification_status ===
                                "approved"
                        ).length,

                    rejected:
                        requests.filter(
                            request =>
                                request
                                    ?.verification_status ===
                                "rejected"
                        ).length
                };
            },
            [
                requests
            ]
        );

    const handleApprove =
        async (
            request
        ) => {
            const confirmed =
                window.confirm(
                    `Approve "${request.name}" and create the organization?`
                );

            if (!confirmed) {
                return;
            }

            setActionLoadingId(
                request.id
            );

            setError("");
            setSuccess("");

            try {
                await adminOrganizationApi
                    .approveRequest(
                        request.id
                    );

                setSuccess(
                    `${request.name} was approved successfully.`
                );

                await loadRequests(
                    statusFilter
                );
            } catch (
                requestError
            ) {
                setError(
                    getApiError(
                        requestError
                    )
                );
            } finally {
                setActionLoadingId(
                    null
                );
            }
        };

    const openReject =
        (
            request
        ) => {
            setRejectTarget(
                request
            );

            setRejectionReason(
                ""
            );

            setError("");
            setSuccess("");
        };

    const closeReject =
        () => {
            if (
                actionLoadingId
            ) {
                return;
            }

            setRejectTarget(
                null
            );

            setRejectionReason(
                ""
            );
        };

    const handleReject =
        async () => {
            if (
                !rejectTarget
            ) {
                return;
            }

            const reason =
                rejectionReason
                    .trim();

            if (!reason) {
                setError(
                    "Enter a rejection reason."
                );

                return;
            }

            setActionLoadingId(
                rejectTarget.id
            );

            setError("");
            setSuccess("");

            try {
                await adminOrganizationApi
                    .rejectRequest(
                        rejectTarget.id,
                        reason
                    );

                setSuccess(
                    `${rejectTarget.name} was rejected.`
                );

                setRejectTarget(
                    null
                );

                setRejectionReason(
                    ""
                );

                await loadRequests(
                    statusFilter
                );
            } catch (
                requestError
            ) {
                setError(
                    getApiError(
                        requestError
                    )
                );
            } finally {
                setActionLoadingId(
                    null
                );
            }
        };

    return (
        <div
            className="sentinel-admin-org-page"
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
                            Platform Administration
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    className="btn sentinel-secondary-button"
                    onClick={() =>
                        navigate(
                            "/dashboard"
                        )
                    }
                >
                    <i
                        className="bi bi-arrow-left me-2"
                    />

                    Account
                </button>
            </header>

            <main
                className="sentinel-admin-org-container"
            >
                <section
                    className="sentinel-admin-org-heading"
                >
                    <div>
                        <div
                            className="sentinel-eyebrow"
                        >
                            SENTINEL PLATFORM
                        </div>

                        <h1>
                            Organization requests
                        </h1>

                        <p>
                            Review organization ownership
                            requests before they become
                            active Sentinel organizations.
                        </p>
                    </div>

                    <div
                        className="sentinel-admin-org-filter"
                    >
                        <label
                            htmlFor="request-status"
                        >
                            Status
                        </label>

                        <select
                            id="request-status"
                            value={
                                statusFilter
                            }
                            onChange={
                                event =>
                                    setStatusFilter(
                                        event.target
                                            .value
                                    )
                            }
                        >
                            <option
                                value="pending"
                            >
                                Pending
                            </option>

                            <option
                                value="approved"
                            >
                                Approved
                            </option>

                            <option
                                value="rejected"
                            >
                                Rejected
                            </option>

                            <option
                                value="all"
                            >
                                All
                            </option>
                        </select>
                    </div>
                </section>

                <section
                    className="sentinel-admin-org-stats"
                >
                    <div>
                        <span>
                            Displayed
                        </span>

                        <strong>
                            {counts.total}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Pending
                        </span>

                        <strong>
                            {counts.pending}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Approved
                        </span>

                        <strong>
                            {counts.approved}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Rejected
                        </span>

                        <strong>
                            {counts.rejected}
                        </strong>
                    </div>
                </section>

                {
                    error && (
                        <div
                            className="sentinel-alert sentinel-alert-danger"
                        >
                            <i
                                className="bi bi-exclamation-circle"
                            />

                            <span>
                                {error}
                            </span>
                        </div>
                    )
                }

                {
                    success && (
                        <div
                            className="sentinel-alert sentinel-alert-success"
                        >
                            <i
                                className="bi bi-check-circle"
                            />

                            <span>
                                {success}
                            </span>
                        </div>
                    )
                }

                {
                    loading
                        ? (
                            <div
                                className="sentinel-admin-org-loading"
                            >
                                <span
                                    className="spinner-border spinner-border-sm"
                                />

                                Loading requests...
                            </div>
                        )
                        : requests.length ===
                            0
                            ? (
                                <div
                                    className="sentinel-admin-org-empty"
                                >
                                    <i
                                        className="bi bi-inbox"
                                    />

                                    <h2>
                                        No requests found
                                    </h2>

                                    <p>
                                        There are no organization
                                        requests matching this
                                        filter.
                                    </p>
                                </div>
                            )
                            : (
                                <section
                                    className="sentinel-admin-org-list"
                                >
                                    {
                                        requests.map(
                                            request => {
                                                const isPending =
                                                    request
                                                        ?.verification_status ===
                                                    "pending";

                                                const busy =
                                                    actionLoadingId ===
                                                    request.id;

                                                return (
                                                    <article
                                                        key={
                                                            request.id
                                                        }
                                                        className="sentinel-admin-org-card"
                                                    >
                                                        <div
                                                            className="sentinel-admin-org-card-top"
                                                        >
                                                            <div
                                                                className="sentinel-admin-org-card-heading"
                                                            >
                                                                <div
                                                                    className="sentinel-admin-org-mark"
                                                                >
                                                                    <i
                                                                        className="bi bi-buildings"
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <span
                                                                        className="sentinel-eyebrow"
                                                                    >
                                                                        REQUEST #{request.id}
                                                                    </span>

                                                                    <h2>
                                                                        {
                                                                            request.name
                                                                        }
                                                                    </h2>

                                                                    <p>
                                                                        {
                                                                            request.legal_name ||
                                                                            "No legal name supplied"
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <span
                                                                className={
                                                                    `sentinel-admin-org-status sentinel-admin-org-status-${request.verification_status}`
                                                                }
                                                            >
                                                                {
                                                                    request.verification_status
                                                                }
                                                            </span>
                                                        </div>

                                                        <div
                                                            className="sentinel-admin-org-details"
                                                        >
                                                            <div>
                                                                <span>
                                                                    Requested by
                                                                </span>

                                                                <strong>
                                                                    {
                                                                        request
                                                                            ?.requester
                                                                            ?.name ||
                                                                        "Unknown user"
                                                                    }
                                                                </strong>

                                                                <small>
                                                                    {
                                                                        request
                                                                            ?.requester
                                                                            ?.email ||
                                                                        "—"
                                                                    }
                                                                </small>
                                                            </div>

                                                            <div>
                                                                <span>
                                                                    Business identifier
                                                                </span>

                                                                <strong>
                                                                    {
                                                                        request
                                                                            .business_identifier ||
                                                                        "Not supplied"
                                                                    }
                                                                </strong>
                                                            </div>

                                                            <div>
                                                                <span>
                                                                    Country
                                                                </span>

                                                                <strong>
                                                                    {
                                                                        request
                                                                            .country ||
                                                                        "Not supplied"
                                                                    }
                                                                </strong>
                                                            </div>

                                                            <div>
                                                                <span>
                                                                    Organization email
                                                                </span>

                                                                <strong>
                                                                    {
                                                                        request
                                                                            .email ||
                                                                        "Not supplied"
                                                                    }
                                                                </strong>
                                                            </div>

                                                            <div>
                                                                <span>
                                                                    Domain
                                                                </span>

                                                                <strong>
                                                                    {
                                                                        request
                                                                            .domain ||
                                                                        "Not supplied"
                                                                    }
                                                                </strong>
                                                            </div>

                                                            <div>
                                                                <span>
                                                                    Submitted
                                                                </span>

                                                                <strong>
                                                                    {
                                                                        formatDate(
                                                                            request
                                                                                .created_at
                                                                        )
                                                                    }
                                                                </strong>
                                                            </div>
                                                        </div>

                                                        {
                                                            request.website && (
                                                                <div
                                                                    className="sentinel-admin-org-website"
                                                                >
                                                                    <span>
                                                                        Website
                                                                    </span>

                                                                    <a
                                                                        href={
                                                                            request.website
                                                                        }
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                    >
                                                                        {
                                                                            request.website
                                                                        }

                                                                        <i
                                                                            className="bi bi-box-arrow-up-right"
                                                                        />
                                                                    </a>
                                                                </div>
                                                            )
                                                        }

                                                        {
                                                            request.rejection_reason && (
                                                                <div
                                                                    className="sentinel-admin-org-rejection"
                                                                >
                                                                    <strong>
                                                                        Rejection reason
                                                                    </strong>

                                                                    <p>
                                                                        {
                                                                            request
                                                                                .rejection_reason
                                                                        }
                                                                    </p>
                                                                </div>
                                                            )
                                                        }

                                                        {
                                                            isPending && (
                                                                <div
                                                                    className="sentinel-admin-org-actions"
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        className="btn sentinel-admin-reject-button"
                                                                        disabled={
                                                                            busy
                                                                        }
                                                                        onClick={() =>
                                                                            openReject(
                                                                                request
                                                                            )
                                                                        }
                                                                    >
                                                                        <i
                                                                            className="bi bi-x-circle"
                                                                        />

                                                                        Reject
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        className="btn sentinel-admin-approve-button"
                                                                        disabled={
                                                                            busy
                                                                        }
                                                                        onClick={() =>
                                                                            handleApprove(
                                                                                request
                                                                            )
                                                                        }
                                                                    >
                                                                        {
                                                                            busy
                                                                                ? (
                                                                                    <span
                                                                                        className="spinner-border spinner-border-sm"
                                                                                    />
                                                                                )
                                                                                : (
                                                                                    <i
                                                                                        className="bi bi-check-circle"
                                                                                    />
                                                                                )
                                                                        }

                                                                        Approve
                                                                    </button>
                                                                </div>
                                                            )
                                                        }
                                                    </article>
                                                );
                                            }
                                        )
                                    }
                                </section>
                            )
                }
            </main>

            {
                rejectTarget && (
                    <div
                        className="sentinel-admin-org-modal-backdrop"
                        role="presentation"
                        onMouseDown={
                            event => {
                                if (
                                    event.target ===
                                    event.currentTarget
                                ) {
                                    closeReject();
                                }
                            }
                        }
                    >
                        <div
                            className="sentinel-admin-org-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="reject-request-title"
                        >
                            <div
                                className="sentinel-admin-org-modal-header"
                            >
                                <div>
                                    <span
                                        className="sentinel-eyebrow"
                                    >
                                        REJECT REQUEST
                                    </span>

                                    <h2
                                        id="reject-request-title"
                                    >
                                        {
                                            rejectTarget.name
                                        }
                                    </h2>
                                </div>

                                <button
                                    type="button"
                                    className="sentinel-admin-org-modal-close"
                                    onClick={
                                        closeReject
                                    }
                                    disabled={
                                        Boolean(
                                            actionLoadingId
                                        )
                                    }
                                >
                                    <i
                                        className="bi bi-x-lg"
                                    />
                                </button>
                            </div>

                            <p>
                                Explain why this organization
                                request cannot be approved.
                                This reason is stored with the
                                request.
                            </p>

                            <label
                                htmlFor="rejection-reason"
                                className="form-label sentinel-label"
                            >
                                Rejection reason
                            </label>

                            <textarea
                                id="rejection-reason"
                                className="form-control sentinel-input"
                                rows="5"
                                value={
                                    rejectionReason
                                }
                                onChange={
                                    event =>
                                        setRejectionReason(
                                            event.target
                                                .value
                                        )
                                }
                                placeholder="Unable to verify the supplied organization details."
                                disabled={
                                    Boolean(
                                        actionLoadingId
                                    )
                                }
                            />

                            <div
                                className="sentinel-admin-org-modal-actions"
                            >
                                <button
                                    type="button"
                                    className="btn sentinel-secondary-button"
                                    onClick={
                                        closeReject
                                    }
                                    disabled={
                                        Boolean(
                                            actionLoadingId
                                        )
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="btn sentinel-admin-reject-button"
                                    onClick={
                                        handleReject
                                    }
                                    disabled={
                                        Boolean(
                                            actionLoadingId
                                        )
                                    }
                                >
                                    {
                                        actionLoadingId
                                            ? (
                                                <span
                                                    className="spinner-border spinner-border-sm"
                                                />
                                            )
                                            : (
                                                <i
                                                    className="bi bi-x-circle"
                                                />
                                            )
                                    }

                                    Reject request
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default AdminOrganizationRequests;