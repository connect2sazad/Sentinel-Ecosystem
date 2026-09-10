import dotenv from "dotenv";

dotenv.config();

const config = {
    app: {
        name: process.env.APP_NAME || "Sentinel Auth",
        environment: process.env.NODE_ENV || "development",
        port: Number(process.env.PORT || 5000),
        frontendUrl:
            process.env.FRONTEND_URL ||
            "http://localhost:5173",
    },

    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn:
            process.env.JWT_EXPIRES_IN || "15m",

        refreshSecret:
            process.env.JWT_REFRESH_SECRET,

        refreshExpiresIn:
            process.env.JWT_REFRESH_EXPIRES_IN ||
            "7d",
    },
};

export default config;