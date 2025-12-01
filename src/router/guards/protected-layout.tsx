import {Navigate,  Outlet} from "react-router"

export default function ProtectedLayout() {
    const client = localStorage.getItem("at_biogeles")
    if (client) {
        return <Outlet/>
    } else {
        return <Navigate to="/" replace/>  
    }
}