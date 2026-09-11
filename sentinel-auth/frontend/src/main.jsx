import React from "react";
import ReactDOM from "react-dom/client";

import {
    BrowserRouter
} from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import "./styles/globals.css";
import "./styles/account.css";
import "./theme/tokens.css";

import App from "./App.jsx";

import {
    ThemeProvider
} from "./theme/ThemeProvider.jsx";

import {
    CelebrationProvider
} from "./celebrations/CelebrationProvider.jsx";

import {
    AuthProvider
} from "./context/AuthContext.jsx";

ReactDOM
    .createRoot(
        document.getElementById(
            "root"
        )
    )
    .render(
        <React.StrictMode>
            <BrowserRouter>
                <ThemeProvider>
                    <CelebrationProvider>
                        <AuthProvider>
                            <App />
                        </AuthProvider>
                    </CelebrationProvider>
                </ThemeProvider>
            </BrowserRouter>
        </React.StrictMode>
    );
