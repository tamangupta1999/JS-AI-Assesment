import { createHash, randomBytes } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import type { EnvConfig, JwtPayload } from "../types.js";

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;
const REFRESH_COOKIE_NAME = "refreshToken";

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateRefreshToken(): string {
  return randomBytes(48).toString("hex");
}

export function signAccessToken(
  payload: JwtPayload,
  config: EnvConfig
): string {
  return jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

export function verifyAccessToken(
  token: string,
  config: EnvConfig
): JwtPayload {
  return jwt.verify(token, config.jwtAccessSecret) as JwtPayload;
}

export function getRefreshExpiry(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);
}

export function setRefreshCookie(
  reply: FastifyReply,
  token: string,
  config: EnvConfig
): void {
  reply.setCookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: "strict",
    path: "/",
    maxAge: REFRESH_TOKEN_EXPIRY_MS / 1000,
  });
}

export function clearRefreshCookie(
  reply: FastifyReply,
  config: EnvConfig
): void {
  reply.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: "strict",
    path: "/",
  });
}

export function getRefreshTokenFromRequest(
  request: FastifyRequest
): string | undefined {
  return request.cookies[REFRESH_COOKIE_NAME];
}

export { REFRESH_COOKIE_NAME, REFRESH_TOKEN_EXPIRY_MS };
