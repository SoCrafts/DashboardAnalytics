import { Link, useNavigate } from "@tanstack/react-router";

export function HomePage() {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("token") !== null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-white">
      <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
        Dashboard Analytics
      </h1>

      {isAuthenticated ? (
        <div className="space-y-4">
          <p className="text-lg text-slate-600">
            Welcome back,{" "}
            <span className="font-semibold text-indigo-600">
              {localStorage.getItem("email")}
            </span>
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/dashboard"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Go to Dashboard
            </Link>
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
          <p className="text-lg text-slate-600 font-medium">
            Please login to access your datasets
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/login"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
