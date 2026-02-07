import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { ADMIN_COOKIE } from "./constants";

const SESSION_TTL_HOURS = Number(process.env.ADMIN_SESSION_TTL_HOURS ?? 8);

export function getSessionExpiry() {
  return new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000);
}

export async function getAdminSession() {
  const cookieStore = cookies();
  const sessionId = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!sessionId) return null;

  const session = await prisma.adminSession.findUnique({
    where: { id: sessionId }
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session;
}

export async function requireAdminSession() {
  const cookieStore = cookies();
  const sessionId = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!sessionId) return null;

  const session = await prisma.adminSession.findUnique({
    where: { id: sessionId }
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session;
}
