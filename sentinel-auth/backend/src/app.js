import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import config from "./config/config.js";

import apiRoutes from "./routes/index.js";

import notFoundMiddleware from "./middlewares/not-found.middleware.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

app.use(
    helmet()
);

app.use(
    cors({
        origin:
            config.app.frontendUrl,

        credentials: true
    })
);

app.use(
    express.json({
        limit: "1mb"
    })
);

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    cookieParser()
);

if (
    config.app.environment ===
    "development"
) {
    app.use(
        morgan("dev")
    );
}

app.get(
    "/",
    (req, res) => {
        res.status(200).json({
            success: true,

            message:
                "Sentinel Auth API is running.",

            service:
                "sentinel-auth",

            environment:
                config.app.environment
        });
    }
);

app.get(
    "/api/health",
    (req, res) => {
        res.status(200).json({
            success: true,

            message:
                "Sentinel Auth is healthy.",

            timestamp:
                new Date().toISOString()
        });
    }
);

app.use(
    "/api",
    apiRoutes
);

app.use(
    notFoundMiddleware
);

app.use(
    errorMiddleware
);

export default app;