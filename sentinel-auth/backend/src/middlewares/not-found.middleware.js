const notFoundMiddleware = (
    req,
    res,
    next
) => {
    return res.status(404).json({
        success: false,
        code: "ROUTE_NOT_FOUND",
        message: `Route ${req.method} ${req.originalUrl} was not found.`,
        timestamp: new Date().toISOString()
    });
};

export default notFoundMiddleware;