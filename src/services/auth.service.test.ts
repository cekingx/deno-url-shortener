import { expect } from "@std/expect";
import { AuthService } from "./auth.service.ts";
import type { JwtUtils, PasswordUtils } from "./auth.service.ts";
import type { UserRepository } from "../repositories/user.repository.ts";
import { User } from "../domain/user.ts";

const makeRepo = (user?: User): UserRepository => ({
  findByUsername: () => user,
});

const makeJwt = (overrides?: Partial<JwtUtils>): JwtUtils => ({
  sign: () => Promise.resolve("signed-token"),
  verify: () => Promise.resolve({ sub: "1" }),
  ...overrides,
});

const makePassword = (valid: boolean): PasswordUtils => ({
  compare: () => Promise.resolve(valid),
});

Deno.test("login - returns error when user not found", async () => {
  const service = new AuthService(makeRepo(), makeJwt(), makePassword(true));
  const result = await service.login("unknown", "pass");
  expect(result).toBeInstanceOf(Error);
});

Deno.test("login - returns error when password is wrong", async () => {
  const service = new AuthService(
    makeRepo(new User(1, "user", "hash")),
    makeJwt(),
    makePassword(false),
  );
  const result = await service.login("user", "wrong");
  expect(result).toBeInstanceOf(Error);
});

Deno.test("login - returns token on valid credentials", async () => {
  const service = new AuthService(
    makeRepo(new User(1, "user", "hash")),
    makeJwt(),
    makePassword(true),
  );
  const result = await service.login("user", "correct");
  expect(result).toBe("signed-token");
});

Deno.test("login - signs token with correct user id", async () => {
  let capturedId: number | undefined;
  const jwt = makeJwt({
    sign: (id) => {
      capturedId = id;
      return Promise.resolve("token");
    },
  });
  const service = new AuthService(
    makeRepo(new User(42, "user", "hash")),
    jwt,
    makePassword(true),
  );
  await service.login("user", "pass");
  expect(capturedId).toBe(42);
});

Deno.test("verifyToken - returns payload for valid token", async () => {
  const service = new AuthService(makeRepo(), makeJwt(), makePassword(false));
  const result = await service.verifyToken("valid-token");
  expect(result).toEqual({ sub: "1" });
});

Deno.test("verifyToken - returns error when jwt.verify throws", async () => {
  const jwt = makeJwt({ verify: () => Promise.reject(new Error("expired")) });
  const service = new AuthService(makeRepo(), jwt, makePassword(false));
  const result = await service.verifyToken("bad-token");
  expect(result).toBeInstanceOf(Error);
});
