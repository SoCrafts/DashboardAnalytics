import { useState } from "react";
import { Link } from "react-router-dom";
import { register } from "@/features/auth/authApi";
import type { AxiosError } from "axios";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
      await register({ username, email, password });
      setMessage({ type: "success", text: "User registered successfully. You can log in." });
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const text =
        axiosError.response?.data?.message ??
        axiosError.message ??
        "Registration failed.";
      setMessage({ type: "error", text });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            style={{ display: "block", width: "100%", padding: "0.5rem" }}
          />
        </div>
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
            autoComplete="new-password"
            style={{ display: "block", width: "100%", padding: "0.5rem" }}
          />
        </div>
        {message && (
          <p
            style={{
              color: message.type === "error" ? "#c00" : "#070",
              marginBottom: "1rem",
            }}
          >
            {message.text}
          </p>
        )}
        <button type="submit" disabled={submitting} style={{ padding: "0.5rem 1rem" }}>
          {submitting ? "Registering…" : "Register"}
        </button>
      </form>
      <p style={{ marginTop: "1rem" }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
