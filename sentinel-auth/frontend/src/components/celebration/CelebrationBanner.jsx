import {
    useCelebration
} from "../../celebrations/celebration-context.js";

const CelebrationBanner = () => {
    const {
        celebrationId
    } =
        useCelebration();

    if (
        celebrationId ===
        "none"
    ) {
        return null;
    }

    if (
        celebrationId ===
        "fifa"
    ) {
        return (
            <div
                className="sentinel-celebration-banner"
            >
                <span
                    className="sentinel-celebration-icon"
                >
                    ⚽
                </span>

                <span>
                    Celebrating the beautiful game
                </span>
            </div>
        );
    }

    if (
        celebrationId ===
        "womens-day"
    ) {
        return (
            <div
                className="sentinel-celebration-banner"
            >
                <span
                    className="sentinel-celebration-icon"
                >
                    ✦
                </span>

                <span>
                    Celebrating International Women's Day
                </span>
            </div>
        );
    }

    return null;
};

export default CelebrationBanner;