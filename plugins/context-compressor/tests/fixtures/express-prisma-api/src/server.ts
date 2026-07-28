import express from "express";

const app = express();
const { DATABASE_URL, JWT_SECRET: tokenSecret } = process.env;

app.get("/health", (_req, res) => res.json({ ok: Boolean(DATABASE_URL) }));
app.delete("/users/:id", (_req, res) => res.status(tokenSecret ? 204 : 401).end());

export { app };
