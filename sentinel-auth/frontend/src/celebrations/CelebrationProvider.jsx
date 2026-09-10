import {
    createContext,
    useContext,
    useMemo
} from "react";

import {
    getCelebrationById
} from "./celebration.registry.js";

const CelebrationContext =
    createContext(null);

/*
|--------------------------------------------------------------------------
| Internal Celebration Control
|--------------------------------------------------------------------------
|
| This is NOT a user preference.
|
| Later this value will come from the dedicated Sentinel
| Celebration / Experience service.
|
| For local development we can temporarily control it
| through the Vite environment.
|
*/

export const CelebrationProvider = ({
    children
}) => {
    const internalCelebrationId =
        import.meta.env
            .VITE_ACTIVE_CELEBRATION ||
        "none";

    const celebration =
        getCelebrationById(
            internalCelebrationId
        );

    const value =
        useMemo(
            () => ({
                celebration,

                celebrationId:
                    celebration.id
            }),
            [
                celebration
            ]
        );

    return (
        <CelebrationContext.Provider
            value={
                value
            }
        >
            {children}
        </CelebrationContext.Provider>
    );
};

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