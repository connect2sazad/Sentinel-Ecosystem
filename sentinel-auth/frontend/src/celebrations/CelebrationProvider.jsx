import {
    useMemo
} from "react";

import {
    getCelebrationById
} from "./celebration.registry.js";

import { CelebrationContext } from "./celebration-context.js";

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
