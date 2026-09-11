import {
    useState
} from "react";

import {
    themes
} from "../../theme/theme.registry.js";

import {
    useTheme
} from "../../theme/theme-context.js";

const SettingsMenu = () => {
    const [
        open,
        setOpen
    ] = useState(
        false
    );

    const {
        themeId,
        changeTheme
    } =
        useTheme();

    return (
        <div
            className="sentinel-settings"
        >
            <button
                type="button"
                className="sentinel-settings-trigger"
                onClick={() =>
                    setOpen(
                        value =>
                            !value
                    )
                }
                aria-label="Open settings"
            >
                <i className="bi bi-gear" />
            </button>

            {
                open && (
                    <>
                        <button
                            type="button"
                            className="sentinel-settings-backdrop"
                            onClick={() =>
                                setOpen(
                                    false
                                )
                            }
                            aria-label="Close settings"
                        />

                        <div
                            className="sentinel-settings-panel"
                        >
                            <div
                                className="d-flex align-items-center justify-content-between mb-4"
                            >
                                <div>
                                    <div
                                        className="sentinel-settings-title"
                                    >
                                        Settings
                                    </div>

                                    <div
                                        className="sentinel-settings-subtitle"
                                    >
                                        Personalize your experience
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="sentinel-icon-button"
                                    onClick={() =>
                                        setOpen(
                                            false
                                        )
                                    }
                                    aria-label="Close settings"
                                >
                                    <i className="bi bi-x-lg" />
                                </button>
                            </div>

                            <div
                                className="sentinel-settings-section"
                            >
                                <label
                                    className="sentinel-settings-label"
                                >
                                    Theme
                                </label>

                                <select
                                    className="form-select sentinel-select"
                                    value={
                                        themeId
                                    }
                                    onChange={
                                        event =>
                                            changeTheme(
                                                event
                                                    .target
                                                    .value
                                            )
                                    }
                                >
                                    {
                                        themes.map(
                                            theme => (
                                                <option
                                                    key={
                                                        theme.id
                                                    }
                                                    value={
                                                        theme.id
                                                    }
                                                >
                                                    {
                                                        theme.name
                                                    }
                                                </option>
                                            )
                                        )
                                    }
                                </select>

                                <div
                                    className="sentinel-settings-help"
                                >
                                    Themes can change colors, typography,
                                    spacing, controls and page layout.
                                </div>
                            </div>
                        </div>
                    </>
                )
            }
        </div>
    );
};

export default SettingsMenu;