import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Dashboard } from "./pages/Dashboard.js";
import "./index.css";
const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")).render(_jsx(React.StrictMode, { children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(BrowserRouter, { children: _jsx("div", { className: "flex flex-col min-h-screen bg-[#030712] text-[#F9FAFB] selection:bg-[#8B5CF6]/30 selection:text-[#8B5CF6]", children: _jsx("main", { className: "flex-grow", children: _jsx(Routes, { children: _jsx(Route, { path: "/", element: _jsx(Dashboard, {}) }) }) }) }) }) }) }));
//# sourceMappingURL=main.js.map