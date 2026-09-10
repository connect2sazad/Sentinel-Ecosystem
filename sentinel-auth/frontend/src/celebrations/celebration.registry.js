export const celebrations = [
    {
        id:
            "none",

        name:
            "None",

        enabled:
            true
    },

    {
        id:
            "fifa",

        name:
            "FIFA",

        enabled:
            true
    },

    {
        id:
            "womens-day",

        name:
            "Women's Day",

        enabled:
            true
    }
];

export const defaultCelebrationId =
    "none";

export const getCelebrationById = (
    celebrationId
) => {
    return (
        celebrations.find(
            celebration =>
                celebration.id ===
                celebrationId
        ) ||
        celebrations[0]
    );
};