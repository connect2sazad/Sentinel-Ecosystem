import crypto from "node:crypto";

export const createSlug = (value) => {
    const cleanValue = value
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const suffix = crypto
        .randomBytes(3)
        .toString("hex");

    return `${cleanValue}-${suffix}`;
};