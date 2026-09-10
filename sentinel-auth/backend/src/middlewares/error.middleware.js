import {
    ValidationError,
    UniqueConstraintError
} from "sequelize";

import AppException from "../utils/app-exception.js";

const errorMiddleware = (
    error,
    req,
    res,
    next
) => {
    console.error("");

    console.error("──────── API ERROR ────────");
    console.error(error);
    console.error("───────────────────────────");

    if (error instanceof AppException) {
        return res
            .status(error.statusCode)
            .json({
                success: false,
                code: error.code,
                message: error.message,
                details: error.details,
                timestamp: new Date().toISOString()
            });
    }

    if (error instanceof UniqueConstraintError) {
        const field =
            error.errors?.[0]?.path ||
            "field";

        return res
            .status(409)
            .json({
                success: false,
                code: "DUPLICATE_RECORD",
                message: `${field} already exists.`,
                details:
                    error.errors?.map((item) => ({
                        field: item.path,
                        message: item.message
                    })) || null,
                timestamp: new Date().toISOString()
            });
    }

    if (error instanceof ValidationError) {
        return res
            .status(422)
            .json({
                success: false,
                code: "VALIDATION_ERROR",
                message:
                    "One or more fields are invalid.",
                details: error.errors.map(
                    (item) => ({
                        field: item.path,
                        message: item.message
                    })
                ),
                timestamp: new Date().toISOString()
            });
    }

    return res
        .status(500)
        .json({
            success: false,
            code: "INTERNAL_SERVER_ERROR",
            message:
                process.env.NODE_ENV ===
                "development"
                    ? error.message
                    : "Something went wrong.",
            timestamp: new Date().toISOString()
        });
};

export default errorMiddleware;