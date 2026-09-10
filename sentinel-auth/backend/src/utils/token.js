import jwt from "jsonwebtoken";
import crypto from "node:crypto";

import config from "../config/config.js";

export const generateAccessToken = (
    payload
) => {
    const token = jwt.sign(
        payload,
        config.jwt.secret,
        {
            algorithm: "HS256",

            expiresIn:
                config.jwt.expiresIn,

            issuer:
                "sentinel-auth",

            audience:
                "sentinel-ecosystem"
        }
    );

    return token;
};

export const generateRefreshToken = () => {
    return crypto
        .randomBytes(64)
        .toString("hex");
};

export const hashRefreshToken = (
    refreshToken
) => {
    return crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");
};

export const verifyAccessToken = (
    token
) => {
    return jwt.verify(
        token,
        config.jwt.secret,
        {
            algorithms: [
                "HS256"
            ],

            issuer:
                "sentinel-auth",

            audience:
                "sentinel-ecosystem"
        }
    );
};