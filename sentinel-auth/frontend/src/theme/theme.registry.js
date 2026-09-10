export const themes = [
    {
        id: "sentinel-default",
        name: "Sentinel Default",
        className: "theme-sentinel-default",
        appearance: "light",
        layout: "editorial",
        description:
            "Minimal monochrome Sentinel identity experience."
    },

    {
        id: "twilight-ocean",
        name: "Twilight Ocean",
        className: "theme-twilight-ocean",
        appearance: "dark",
        layout: "floating",
        description:
            "Immersive ocean-inspired dark interface."
    },

    {
        id: "windows-xp",
        name: "Windows XP",
        className: "theme-windows-xp",
        appearance: "light",
        layout: "desktop",
        description:
            "A nostalgic desktop-inspired Sentinel experience."
    }
];

export const defaultThemeId =
    "sentinel-default";

export const getThemeById = (
    themeId
) => {
    return (
        themes.find(
            theme =>
                theme.id ===
                themeId
        ) ||
        themes[0]
    );
};