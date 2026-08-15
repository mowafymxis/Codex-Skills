import express from "express";

const app = express();
app.post("/jobs", (_req, res) => res.status(202).end());
