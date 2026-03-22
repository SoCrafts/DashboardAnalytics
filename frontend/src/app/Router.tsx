import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
  Link,
  Navigate,
  useNavigate,
} from "@tanstack/react-router";
import LoginPage from "@/features/auth/pages/LoginPage.tsx";
import RegisterPage from "@/features/auth/pages/RegisterPage.tsx";
import { DashboardPage } from "@/features/datasets/pages/DashboardPage.tsx";
import { DatasetDetailPage } from "@/features/datasets/pages/DatasetDetailPage.tsx";

// --- ROOT ROUTE ---
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Outlet />
    </div>
  ),
});

// --- COMPONENTS FOR ROUTES ---
function HomePage() {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("token") !== null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-white">
      <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-4">Dashboard Analytics</h1>

      {isAuthenticated ? (
        <div className="space-y-4">
          <p className="text-lg text-slate-600">Welcome back, <span className="font-semibold text-indigo-600">{localStorage.getItem("email")}</span></p>
          <div className="flex gap-4 justify-center">
            <Link to="/dashboard" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Go to Dashboard</Link>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("email");
                navigate({ to: "/login" });
              }}
              className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-lg text-slate-600 font-medium">Please login to access your datasets</p>
          <div className="flex gap-4 justify-center">
            <Link to="/login" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Login</Link>
            <Link to="/register" className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition">Register</Link>
          </div>
        </div>
      )}
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = localStorage.getItem("token") !== null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// --- ROUTE DEFINITIONS ---
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: () => (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  ),
});

const datasetDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/datasets/$id",
  component: () => {
    // Note: In a real app we'd use route params from TanStack Router
    return (
      <ProtectedRoute>
        <DatasetDetailPage />
      </ProtectedRoute>
    );
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  dashboardRoute,
  datasetDetailRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function Router() {
  return <RouterProvider router={router} />;
}
