import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type { LoginInput } from "./auth.schema";

export async function login({ username, password }: LoginInput) {
  const admin = await prisma.adminUser.findUnique({ where: { username } });

  if (!admin) {
    throw AppError.unauthorized("Usuario o contraseña incorrectos");
  }

  const passwordMatches = await bcrypt.compare(password, admin.passwordHash);
  if (!passwordMatches) {
    throw AppError.unauthorized("Usuario o contraseña incorrectos");
  }

  const signOptions: jwt.SignOptions = { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] };
  const token = jwt.sign(
    { sub: admin.id, username: admin.username, role: admin.role },
    env.JWT_SECRET,
    signOptions
  );

  return {
    token,
    admin: { id: admin.id, username: admin.username, role: admin.role },
  };
}

export async function getAdminById(id: string) {
  const admin = await prisma.adminUser.findUnique({
    where: { id },
    select: { id: true, username: true, role: true, createdAt: true },
  });

  if (!admin) {
    throw AppError.notFound("Administrador no encontrado");
  }

  return admin;
}
