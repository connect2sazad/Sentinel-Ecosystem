import AppException from "./app-exception.js";

export const validateOrganizationInput = payload => {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new AppException("Organization details are required.", 422, "INVALID_ORGANIZATION_DETAILS");
    }

    const limits = { name: 150, legal_name: 200, business_identifier: 150,
        country: 100, email: 150, website: 255, domain: 255 };
    const result = {};
    for (const [field, limit] of Object.entries(limits)) {
        const value = payload[field];
        if (value != null && typeof value !== "string") {
            throw new AppException(`${field} must be text.`, 422, "INVALID_ORGANIZATION_DETAILS");
        }
        result[field] = value?.trim() || null;
        if (result[field]?.length > limit) {
            throw new AppException(`${field} must not exceed ${limit} characters.`, 422, "INVALID_ORGANIZATION_DETAILS");
        }
    }
    if (!result.name || result.name.length < 2) {
        throw new AppException("Organization name must contain between 2 and 150 characters.", 422, "INVALID_ORGANIZATION_NAME");
    }
    if (result.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email)) {
        throw new AppException("Enter a valid organization email.", 422, "INVALID_ORGANIZATION_EMAIL");
    }
    if (result.website) {
        let url;
        try { url = new URL(result.website); } catch { /* Rejected below. */ }
        if (!url || !["http:", "https:"].includes(url.protocol) || !url.hostname || url.username || url.password) {
            throw new AppException("Website must be an HTTP or HTTPS URL.", 422, "INVALID_ORGANIZATION_WEBSITE");
        }
    }
    if (result.domain && !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(result.domain)) {
        throw new AppException("Enter a domain such as example.com, without a URL or path.", 422, "INVALID_ORGANIZATION_DOMAIN");
    }
    result.email = result.email?.toLowerCase() || null;
    result.domain = result.domain?.toLowerCase() || null;
    return result;
};
