// src/router/index.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuthLayout from "@/layouts/AuthLayout";
import MainLayout from "@/layouts/MainLayout";

// Importamos las pantallas desde features
import LoginScreen from "@/features/login-screen";
import DashboardScreen from "@/features/dashboard-screen";
import AdminScreen from "@/features/admin-screen";
import OrdersScreen from "@/features/orders-screen";
import ProfileScreen from "@/features/profile-screen";
import ReportsScreen from "@/features/reports-screen";
import CalendarScreen from "@/features/calendar-screen";
import WeatherScreen from "@/features/weather-screen";

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Login sin nav */}
                <Route element={<AuthLayout/>}>
                    <Route path="/" element={<LoginScreen/>}/>
                </Route>

                {/* Rutas internas (con mainLayout + BottomNav) */}

                <Route element={<MainLayout />}>
                    <Route path="/dashboard" element={<DashboardScreen />} />
                    <Route path="/orders" element={<OrdersScreen />} />
                    <Route path="/calendar" element={<CalendarScreen />} />
                    <Route path="/weather" element={<WeatherScreen />} />
                    <Route path="/reports" element={<ReportsScreen />} />
                    <Route path="/admin" element={<AdminScreen />} />
                    <Route path="/profile" element={<ProfileScreen />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
