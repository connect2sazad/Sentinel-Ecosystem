import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    defaultThemeId,
    getThemeById
} from "./theme.registry.js";

import "./themes/sentinel-default.css";
import "./themes/twilight-ocean.css";
import "./themes/windows-xp.css";

const ThemeContext =
    createContext(null);

const STORAGE_KEY =
    "sentinel_theme";

export const ThemeProvider = ({
    children
}) => {
    const [
        themeId,
        setThemeId
    ] = useState(() => {
        return (
            localStorage.getItem(
                STORAGE_KEY
            ) ||
            defaultThemeId
        );
    });

    const theme =
        getThemeById(
            themeId
        );

    useEffect(() => {
        const root =
            document.documentElement;

        const themeClasses =
            Array.from(
                root.classList
            ).filter(
                className =>
                    className.startsWith(
                        "theme-"
                    )
            );

        themeClasses.forEach(
            className =>
                root.classList.remove(
                    className
                )
        );

        root.classList.add(
            theme.className
        );

        root.dataset.theme =
            theme.id;

        root.dataset.appearance =
            theme.appearance;

        root.dataset.layout =
            theme.layout;

        localStorage.setItem(
            STORAGE_KEY,
            theme.id
        );
    }, [
        theme
    ]);

    const changeTheme = (
        newThemeId
    ) => {
        const selectedTheme =
            getThemeById(
                newThemeId
            );

        setThemeId(
            selectedTheme.id
        );
    };

    const value =
        useMemo(
            () => ({
                theme,
                themeId:
                    theme.id,

                changeTheme
            }),
            [
                theme
            ]
        );

    return (
        <ThemeContext.Provider
            value={
                value
            }
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context =
        useContext(
            ThemeContext
        );

    if (!context) {
        throw new Error(
            "useTheme must be used inside ThemeProvider."
        );
    }

    return context;
};