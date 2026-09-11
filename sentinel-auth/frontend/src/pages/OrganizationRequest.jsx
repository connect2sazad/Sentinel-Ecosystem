import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import organizationApi
    from "../api/organization.api.js";

import SettingsMenu
    from "../components/settings/SettingsMenu.jsx";

import CelebrationBanner
    from "../components/celebration/CelebrationBanner.jsx";

const EMPTY_FORM = {
    name: "",
    legal_name: "",
    business_identifier: "",
    country: "India",
    email: "",
    website: "",
    domain: ""
};

const getApiError = (error) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Something went wrong."
    );
};

const formatDate = (value) => {
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

const OrganizationRequest = () => {
    const navigate =
        useNavigate();

    const [
        form,
        setForm
    ] = useState(
        EMPTY_FORM
    );

    const [
        existingRequest,
        setExistingRequest
    ] = useState(null);

    const [
        checking,
        setChecking
    ] = useState(true);

    const [
        submitting,
        setSubmitting
    ] = useState(false);

    const [
        error,
        setError
    ] = useState("");

    const [
        success,
        setSuccess
    ] = useState("");
    const [history, setHistory] = useState([]);

    useEffect(() => {
        let active = true;

        const loadRequests =
            async () => {
                try {
                    const requests =
                        await organizationApi
                            .getMyRequests();

                    if (!active) {
                        return;
                    }

                    const list =
                        Array.isArray(requests)
                            ? requests
                            : [];
                    setHistory(list.filter(request => request.verification_status !== "pending"));

                    const pending =
                        list.find(
                            request =>
                                request
                                    ?.verification_status ===
                                "pending"
                        );

                    setExistingRequest(
                        pending || null
                    );
                } catch (
                requestError
                ) {
                    if (active) {
                        setError(
                            getApiError(
                                requestError
                            )
                        );
                    }
                } finally {
                    if (active) {
                        setChecking(false);
                    }
                }
            };

        loadRequests();

        return () => {
            active = false;
        };
    }, []);

    const handleChange = (
        event
    ) => {
        const {
            name,
            value
        } =
            event.target;

        setForm(
            previous => ({
                ...previous,
                [name]: value
            })
        );

        if (error) {
            setError("");
        }

        if (success) {
            setSuccess("");
        }
    };

    const handleSubmit =
        async (
            event
        ) => {
            event.preventDefault();

            setError("");
            setSuccess("");

            if (
                !form.name.trim()
            ) {
                setError(
                    "Organization name is required."
                );

                return;
            }

            setSubmitting(true);

            try {
                const request =
                    await organizationApi
                        .requestOrganization({
                            name:
                                form.name.trim(),

                            legal_name:
                                form.legal_name.trim() ||
                                null,

                            business_identifier:
                                form.business_identifier.trim() ||
                                null,

                            country:
                                form.country.trim() ||
                                null,

                            email:
                                form.email.trim() ||
                                null,

                            website:
                                form.website.trim() ||
                                null,

                            domain:
                                form.domain.trim() ||
                                null
                        });

                setExistingRequest(
                    request
                );

                setSuccess(
                    "Your organization request has been submitted for review."
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
                setSubmitting(false);
            }
        };

    if (checking) {
        return (
            <div
                className="sentinel-account-page"
            >
                <div
                    className="sentinel-organization-request-loading"
                >
                    <span
                        className="spinner-border spinner-border-sm"
                    />

                    Checking organization requests...
                </div>
            </div>
        );
    }

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
                            Organizations
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
                className="sentinel-organization-request-container"
            >
                <section
                    className="sentinel-organization-request-heading"
                >
                    <div
                        className="sentinel-eyebrow"
                    >
                        SENTINEL ORGANIZATIONS
                    </div>

                    <h1>
                        Request an organization
                    </h1>

                    <p>
                        Organizations are separate from personal
                        Sentinel accounts. Submit your organization
                        details for verification before it becomes
                        part of the Sentinel ecosystem.
                    </p>
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
                    existingRequest
                        ? (
                            <section
                                className="sentinel-organization-pending-card"
                            >
                                <div
                                    className="sentinel-organization-pending-icon"
                                >
                                    <i
                                        className="bi bi-hourglass-split"
                                    />
                                </div>

                                <div
                                    className="sentinel-organization-pending-content"
                                >
                                    <div
                                        className="sentinel-organization-pending-top"
                                    >
                                        <div>
                                            <span
                                                className="sentinel-eyebrow"
                                            >
                                                REQUEST SUBMITTED
                                            </span>

                                            <h2>
                                                {
                                                    existingRequest.name
                                                }
                                            </h2>
                                        </div>

                                        <span
                                            className="sentinel-request-status sentinel-request-status-pending"
                                        >
                                            Pending review
                                        </span>
                                    </div>

                                    <p>
                                        Sentinel has received this
                                        organization request. It must
                                        be reviewed before an
                                        organization or owner
                                        membership is created.
                                    </p>

                                    <div
                                        className="sentinel-request-details"
                                    >
                                        <div>
                                            <span>
                                                Legal name
                                            </span>

                                            <strong>
                                                {
                                                    existingRequest
                                                        .legal_name ||
                                                    "Not provided"
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Business identifier
                                            </span>

                                            <strong>
                                                {
                                                    existingRequest
                                                        .business_identifier ||
                                                    "Not provided"
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Country
                                            </span>

                                            <strong>
                                                {
                                                    existingRequest
                                                        .country ||
                                                    "Not provided"
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Verification
                                            </span>

                                            <strong>
                                                {
                                                    existingRequest
                                                        .verification_method ||
                                                    "manual"
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
                                                        existingRequest
                                                            .created_at
                                                    )
                                                }
                                            </strong>
                                        </div>
                                    </div>

                                    <div
                                        className="sentinel-request-info"
                                    >
                                        <i
                                            className="bi bi-shield-check"
                                        />

                                        <span>
                                            No organization has been
                                            created yet and no
                                            organization privileges
                                            have been granted.
                                        </span>
                                    </div>

                                    <Link
                                        to="/dashboard"
                                        className="btn sentinel-primary-button"
                                    >
                                        Return to account
                                    </Link>
                                </div>
                            </section>
                        )
                        : (
                            <section
                                className="sentinel-organization-request-layout"
                            >
                                <form
                                    className="sentinel-account-panel sentinel-organization-request-form"
                                    onSubmit={
                                        handleSubmit
                                    }
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
                                                    Organization details
                                                </h2>

                                                <p>
                                                    Tell us about the
                                                    organization you
                                                    represent.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className="row g-3"
                                    >
                                        <div
                                            className="col-12"
                                        >
                                            <label
                                                className="form-label sentinel-label"
                                                htmlFor="name"
                                            >
                                                Organization name *
                                            </label>

                                            <input
                                                id="name"
                                                name="name"
                                                className="form-control sentinel-input"
                                                value={
                                                    form.name
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Sentinel Technologies"
                                                disabled={
                                                    submitting
                                                }
                                            />
                                        </div>

                                        <div
                                            className="col-12"
                                        >
                                            <label
                                                className="form-label sentinel-label"
                                                htmlFor="legal_name"
                                            >
                                                Legal name
                                            </label>

                                            <input
                                                id="legal_name"
                                                name="legal_name"
                                                className="form-control sentinel-input"
                                                value={
                                                    form.legal_name
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Registered legal entity name"
                                                disabled={
                                                    submitting
                                                }
                                            />
                                        </div>

                                        <div
                                            className="col-md-6"
                                        >
                                            <label
                                                className="form-label sentinel-label"
                                                htmlFor="business_identifier"
                                            >
                                                Business identifier
                                            </label>

                                            <input
                                                id="business_identifier"
                                                name="business_identifier"
                                                className="form-control sentinel-input"
                                                value={
                                                    form.business_identifier
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="GSTIN / registration number"
                                                disabled={
                                                    submitting
                                                }
                                            />
                                        </div>

                                        <div
                                            className="col-md-6"
                                        >
                                            <label
                                                className="form-label sentinel-label"
                                                htmlFor="country"
                                            >
                                                Country
                                            </label>

                                            <input
                                                id="country"
                                                name="country"
                                                className="form-control sentinel-input"
                                                value={
                                                    form.country
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="India"
                                                disabled={
                                                    submitting
                                                }
                                            />
                                        </div>

                                        <div
                                            className="col-md-6"
                                        >
                                            <label
                                                className="form-label sentinel-label"
                                                htmlFor="email"
                                            >
                                                Organization email
                                            </label>

                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                className="form-control sentinel-input"
                                                value={
                                                    form.email
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="admin@example.com"
                                                disabled={
                                                    submitting
                                                }
                                            />
                                        </div>

                                        <div
                                            className="col-md-6"
                                        >
                                            <label
                                                className="form-label sentinel-label"
                                                htmlFor="domain"
                                            >
                                                Domain
                                            </label>

                                            <input
                                                id="domain"
                                                name="domain"
                                                className="form-control sentinel-input"
                                                value={
                                                    form.domain
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="example.com"
                                                disabled={
                                                    submitting
                                                }
                                            />
                                        </div>

                                        <div
                                            className="col-12"
                                        >
                                            <label
                                                className="form-label sentinel-label"
                                                htmlFor="website"
                                            >
                                                Website
                                            </label>

                                            <input
                                                id="website"
                                                name="website"
                                                type="url"
                                                className="form-control sentinel-input"
                                                value={
                                                    form.website
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="https://example.com"
                                                disabled={
                                                    submitting
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div
                                        className="sentinel-request-warning"
                                    >
                                        <i
                                            className="bi bi-info-circle"
                                        />

                                        <p>
                                            Submitting this form does
                                            <strong>
                                                {" "}not{" "}
                                            </strong>
                                            create an organization.
                                            Sentinel must verify and
                                            approve the request first.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn sentinel-primary-button"
                                        disabled={
                                            submitting
                                        }
                                    >
                                        {
                                            submitting
                                                ? (
                                                    <>
                                                        <span
                                                            className="spinner-border spinner-border-sm me-2"
                                                        />

                                                        Submitting...
                                                    </>
                                                )
                                                : (
                                                    <>
                                                        Submit for review

                                                        <i
                                                            className="bi bi-arrow-right ms-2"
                                                        />
                                                    </>
                                                )
                                        }
                                    </button>
                                </form>

                                <aside
                                    className="sentinel-organization-request-aside"
                                >
                                    <div
                                        className="sentinel-account-panel"
                                    >
                                        <div
                                            className="sentinel-account-panel-icon"
                                        >
                                            <i
                                                className="bi bi-shield-check"
                                            />
                                        </div>

                                        <h3>
                                            Why verification?
                                        </h3>

                                        <p>
                                            Organization identity can
                                            control paid subscriptions,
                                            employee access and business
                                            data across Sentinel apps.
                                        </p>

                                        <p>
                                            Verification helps prevent
                                            users from claiming an
                                            organization they do not
                                            represent.
                                        </p>
                                    </div>

                                    <div
                                        className="sentinel-account-panel"
                                    >
                                        <div
                                            className="sentinel-account-panel-icon"
                                        >
                                            <i
                                                className="bi bi-person-plus"
                                            />
                                        </div>

                                        <h3>
                                            Already invited?
                                        </h3>

                                        <p>
                                            You do not need to request
                                            another organization if an
                                            existing organization has
                                            invited you.
                                        </p>

                                        <button
                                            type="button"
                                            className="btn sentinel-secondary-button w-100"
                                            onClick={() => navigate("/invitations/accept")}
                                        >
                                            Join with invitation
                                        </button>
                                    </div>
                                </aside>
                            </section>
                        )
                }
                {history.length > 0 && (
                    <section className="sentinel-account-panel mt-4" aria-label="Previous requests">
                        <h2 className="h4">Previous requests</h2>
                        {history.map(request => (
                            <article key={request.id} className="border-top pt-3 mt-3">
                                <h3 className="h5">{request.name}</h3>
                                <p>Status: {request.verification_status} · Reviewed: {formatDate(request.reviewed_at)}</p>
                                {request.rejection_reason && (
                                    <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                                        {request.rejection_reason}
                                    </p>
                                )}
                                {request.organization_id && <p>Organization #{request.organization_id}</p>}
                            </article>
                        ))}
                    </section>
                )}
            </main>
        </div>
    );
};

export default OrganizationRequest;
