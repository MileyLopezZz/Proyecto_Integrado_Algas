// src/layouts/MainLayout.tsx
import { Outlet } from "react-router-dom";
import BottomNav from "@/components/bottomnav";

export default function MainLayout() {
    return (
        <div className="flex h-screen bg-background flex-col">
            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>
            <BottomNav />
        </div>
    );
}
