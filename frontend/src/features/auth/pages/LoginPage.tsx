import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "@/features/auth/authApi";
import type { AxiosError } from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { data } = await login({ email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", email);
      navigate("/");
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(
        axiosError.response?.data?.message ??
          axiosError.message ??
          "Login failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Log in</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{ display: "block", width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={{ display: "block", width: "100%", padding: "0.5rem" }}
          />
        </div>
        {error && (
          <p style={{ color: "#c00", marginBottom: "1rem" }}>{error}</p>
        )}
        <button type="submit" disabled={submitting} style={{ padding: "0.5rem 1rem" }}>
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p style={{ marginTop: "1rem" }}>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
