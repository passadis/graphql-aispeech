import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ThemeProvider, createTheme } from "@fluentui/react";
import Home from "./pages/Home";
import TranscriptionApp from "./components/TranscriptionApp";
import "./styles.css";
import logo from "./logo1.JPG";

const theme = createTheme({
    palette: {
        themePrimary: "#0078d4",
        themeLighterAlt: "#eff6fc",
        themeLighter: "#deecf9",
        themeLight: "#c7e0f4",
        themeTertiary: "#71afe5",
        themeSecondary: "#2b88d8",
        themeDarkAlt: "#106ebe",
        themeDark: "#005a9e",
        themeDarker: "#004578",
        neutralLighterAlt: "#f8f8f8",
        neutralLighter: "#f4f4f4",
        neutralLight: "#eaeaea",
        neutralQuaternaryAlt: "#dadada",
        neutralQuaternary: "#d0d0d0",
        neutralTertiaryAlt: "#c8c8c8",
        neutralTertiary: "#a6a6a6",
        neutralSecondary: "#8d8d8d",
        neutralPrimaryAlt: "#3b3b3b",
        neutralPrimary: "#333333",
        neutralDark: "#272727",
        black: "#1d1d1d",
        white: "#ffffff",
    },
});

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <Router>
                <header className="header-container">
                    <div className="logo">GraphQL Demo</div>
                    <div className="header-logo-container">
                        <img src={logo} alt="Company Logo" className="header-logo" />
                    </div>
                    <nav className="navigation">
                        <Link to="/" className="nav-link">
                            Home
                        </Link>
                        <Link to="/transcriptions" className="nav-link">
                            Transcriptions
                        </Link>
                    </nav>
                </header>
                <main style={{ padding: "2rem" }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/transcriptions" element={<TranscriptionApp />} />
                    </Routes>
                </main>
            </Router>
        </ThemeProvider>
    );
};

export default App;
