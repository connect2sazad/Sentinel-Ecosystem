import app from "./app.js";
import sequelize from "./config/database.js";
import config from "./config/config.js";

import "./models/index.js";

const startServer = async () => {
    try {
        await sequelize.authenticate();

        console.log("");
        console.log("✓ Database connected");
        console.log(`✓ Database: ${process.env.DB_NAME}`);

        app.listen(config.app.port, () => {
            console.log("");

            console.log(
                "────────────────────────────────────────"
            );

            console.log("   SENTINEL AUTH");

            console.log(
                "────────────────────────────────────────"
            );

            console.log(
                `   Environment : ${config.app.environment}`
            );

            console.log(
                `   API         : http://localhost:${config.app.port}`
            );

            console.log(
                `   Health      : http://localhost:${config.app.port}/api/health`
            );

            console.log(
                "────────────────────────────────────────"
            );

            console.log("");
        });
    } catch (error) {
        console.error("");
        console.error("✕ Sentinel Auth failed to start.");
        console.error("");

        console.error(error);

        process.exit(1);
    }
};

startServer();