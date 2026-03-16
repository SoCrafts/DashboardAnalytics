import { createBrowserRouter, Link, RouterProvider } from "react-router-dom";
import LoginPage from "@/features/auth/pages/LoginPage.tsx";
import RegisterPage from "@/features/auth/pages/RegisterPage.tsx";
import { useNavigate } from "react-router-dom";
function HomePage() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Dashboard Analytics</h1>

      {localStorage.getItem("email") && localStorage.getItem("token") ? (
        <>
        <p>You are logged in with {localStorage.getItem("email")}</p>
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

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
]);

export function Router() {
  return <RouterProvider router={router} />;
}