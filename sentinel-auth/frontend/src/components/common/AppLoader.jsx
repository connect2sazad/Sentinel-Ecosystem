const AppLoader = () => {
    return (
        <div
            className="sentinel-app-loader"
        >
            <div
                className="sentinel-app-loader-content"
            >
                <div
                    className="sentinel-brand-mark"
                >
                    S
                </div>

                <div
                    className="sentinel-loader-spinner"
                />

                <div
                    className="sentinel-loader-text"
                >
                    Opening Sentinel
                </div>
            </div>
        </div>
    );
};

export default AppLoader;