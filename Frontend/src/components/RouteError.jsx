import React from "react";

const RouteError = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-primary)] text-[var(--color-surface)]">
    <h1 className="text-4xl font-bold mb-4">Oops! Page Not Found</h1>
    <p className="mb-6 text-lg">The page you are looking for does not exist or an error occurred.</p>
    <a href="/" className="px-6 py-3 rounded-lg bg-[var(--color-accent)] text-[var(--color-surface)] font-bold shadow hover:opacity-90 transition">Go Home</a>
  </div>
);

export default RouteError;
