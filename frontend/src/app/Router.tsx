import { createBrowserRouter, Link, RouterProvider, Navigate } from "react-router-dom";
import LoginPage from "@/features/auth/pages/LoginPage.tsx";
import RegisterPage from "@/features/auth/pages/RegisterPage.tsx";
import { DashboardPage } from "@/features/datasets/pages/DashboardPage.tsx";
import { useNavigate } from "react-router-dom";
function HomePage() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Dashboard Analytics</h1>

      {localStorage.getItem("email") && localStorage.getItem("token") ? (
        <>
          <p>You are logged in with {localStorage.getItem("email")}</p>
          <Link to="/dashboard">Dashboard</Link>
          <br />
          <button onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("email");
            navigate("/login");
          }}>Logout</button>
        </>
      ) : (
        <>
          <p>You are not logged in</p>
          <Link to="/login">Login</Link>
          <br />
          <Link to="/register">Register</Link>
        </>
      )}

    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = localStorage.getItem("token") !== null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { 
    path: "/dashboard", 
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ) 
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}