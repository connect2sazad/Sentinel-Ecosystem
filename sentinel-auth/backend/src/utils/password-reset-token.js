import crypto from "node:crypto";

export const generatePasswordResetToken =
    () => {
        return crypto
            .randomBytes(48)
            .toString("hex");
    };

export const hashPasswordResetToken =
    (token) => {
        return crypto
            .createHash("sha256")
            .update(
                String(token)
            )
            .digest("hex");
    };