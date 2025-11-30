// src/components/BottomNav.tsx
import { useLocation, useNavigate } from "react-router-dom";

type NavItem = {
    id: string;
    label: string;
    icon: string; // path del SVG
    to: string;
};

const baseItems: NavItem[] = [
    {
        id: "dashboard",
        label: "Inicio",
        to: "/dashboard",
        icon: "M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9M9 12l3-3m0 0l3 3m-3-3v6",
    },
    {
        id: "orders",
        label: "Pedidos",
        to: "/orders",
        icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
    {
        id: "calendar",
        label: "Calendario",
        to: "/calendar",
        icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    {
        id: "weather",
        label: "Clima",
        to: "/weather",
        icon: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z",
    },
    {
        id: "reports",
        label: "Reportes",
        to: "/reports",
        icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    },
];

const adminItem: NavItem = {
    id: "admin",
    label: "Admin",
    to: "/admin",
    icon:
        "M12 6V4m6 2a2 2 0 11-4 0 2 2 0 014 0zM7 11a4 4 0 01-4-4m12 0a4 4 0 01-4-4M7 11c0 1.657.895 3.1 2.225 3.9m5.55 0A4.002 4.002 0 0019 11c0-2.225-1.115-4.188-2.81-5.4",
};

const profileItem: NavItem = {
    id: "profile",
    label: "Perfil",
    to: "/profile",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
};

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

  // Por ahora dejamos el rol fijo como "admin" (igual que el valor inicial del useState en page.tsx)
    const userRole: "operator" | "admin" = "admin";

    const items: NavItem[] = [
        ...baseItems,
        ...(userRole === "admin" ? [adminItem] : []),
        profileItem,
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-white">
            <div className="flex justify-around items-center h-20 max-w-md mx-auto w-full">
                {items.map((item) => {
                const isActive = location.pathname === item.to;

                return (
                    <button
                        key={item.id}
                        onClick={() => navigate(item.to)}
                        className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        }`}
                        >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={item.icon}
                            />
                        </svg>
                        <span className="text-xs font-medium">{item.label}</span>
                    </button>
                );
                })}
            </div>
        </nav>
    );
}
