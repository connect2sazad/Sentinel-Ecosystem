import { createContext, useContext } from "react";

export const CelebrationContext = createContext(null);

export const useCelebration = () => {
    const context =
        useContext(
            CelebrationContext
        );

    if (!context) {
        throw new Error(
            "useCelebration must be used inside CelebrationProvider."
        );
    }

    return context;
};