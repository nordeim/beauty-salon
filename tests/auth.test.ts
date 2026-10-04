import { describe, expect, it } from "vitest";
import {
  createSessionToken,
  hashPassword,
  verifyPassword,
  verifySessionToken,
} from "@/lib/auth";

describe("password hashing", () => {
  it("round-trips a password", () => {
    const stored = hashPassword("$Abcd1234");
    expect(stored.startsWith("scrypt$")).toBe(true);
    expect(verifyPassword("$Abcd1234", stored)).toBe(true);
  });

  it("rejects a wrong password", () => {
    const stored = hashPassword("correct horse battery staple");
    expect(verifyPassword("wrong", stored)).toBe(false);
  });

  it("salts: two hashes of the same password differ", () => {
    expect(hashPassword("same")).not.toBe(hashPassword("same"));
  });

  it("refuses malformed stored hashes", () => {
    expect(verifyPassword("x", "not-a-hash")).toBe(false);
    expect(verifyPassword("x", "bcrypt$aa$bb")).toBe(false);
  });
});

describe("session tokens", () => {
  it("round-trips a valid session", () => {
    const { token } = createSessionToken("user-123");
    expect(verifySessionToken(token)).toEqual({ userId: "user-123" });
  });

  it("rejects tampered payloads (MAC must fail)", () => {
    const { token } = createSessionToken("user-123");
    const tampered = token.replace("user-123", "user-999");
    expect(verifySessionToken(tampered)).toBeNull();
  });

  it("rejects garbage and expired shapes", () => {
    expect(verifySessionToken("")).toBeNull();
    expect(verifySessionToken("a.b.c")).toBeNull();
    expect(verifySessionToken("1.0.deadbeef")).toBeNull(); // exp in the past
  });

  it("signs different ids differently", () => {
    expect(createSessionToken("a").token).not.toBe(createSessionToken("b").token);
  });
});
