import type { UserRepository } from "../repositories/user.repository.ts";

export interface JwtUtils {
  sign(userId: number): Promise<string>;
  verify(token: string): Promise<{ sub: string }>;
}

export interface PasswordUtils {
  compare(plain: string, hash: string): Promise<boolean>;
}

export class AuthService {
  constructor(
    private repo: UserRepository,
    private jwt: JwtUtils,
    private password: PasswordUtils,
  ) {}

  async login(
    username: string,
    plainPassword: string,
  ): Promise<string | Error> {
    const user = this.repo.findByUsername(username);
    if (!user) return new Error("invalid credentials");

    const valid = await this.password.compare(plainPassword, user.passwordHash);
    if (!valid) return new Error("invalid credentials");

    return this.jwt.sign(user.id);
  }

  async verifyToken(token: string): Promise<{ sub: string } | Error> {
    try {
      return await this.jwt.verify(token);
    } catch {
      return new Error("invalid token");
    }
  }
}
