import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "@tanstack/react-router";
import LoginPage from "@/features/auth/pages/LoginPage.tsx";
import RegisterPage from "@/features/auth/pages/RegisterPage.tsx";
import { DashboardPage } from "@/features/datasets/pages/DashboardPage.tsx";
import { DatasetDetailPage } from "@/features/datasets/pages/DatasetDetailPage.tsx";
import { HomePage } from "@/app/pages/HomePage.tsx";

// --- ROOT ROUTE ---
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Outlet />
    </div>
  ),
});


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
  component: () => (
    <ProtectedRoute>
      <DatasetDetailPage />
    </ProtectedRoute>
  ),
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
