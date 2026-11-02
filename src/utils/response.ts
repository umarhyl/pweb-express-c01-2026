import type { Response } from "express";

export const sendSuccess = (
  res: Response,
  status: number,
  message: string,
  data?: unknown,
  metadata?: Record<string, unknown>,
): void => {
  const payload: Record<string, unknown> = {
    status: true,
    message,
    ...(data !== undefined ? { data } : {}),
    ...(metadata !== undefined ? { metadata } : {}),
  };
  res.status(status).json(payload);
};
