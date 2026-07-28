import express from "express";

export const router = express.Router();

router.get("/users", (_req, res) => {
  res.json([]);
});

router.post("/users", (_req, res) => {
  res.status(201).json({ id: process.env.USER_ID_PREFIX });
});
