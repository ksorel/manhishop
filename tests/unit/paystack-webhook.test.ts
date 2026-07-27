import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { verifyPaystackSignature } from "@/lib/paystack/webhook";

const ORIGINAL_SECRET = process.env.PAYSTACK_SECRET_KEY;

describe("verifyPaystackSignature", () => {
  beforeEach(() => {
    process.env.PAYSTACK_SECRET_KEY = "test_secret_key";
  });

  afterEach(() => {
    process.env.PAYSTACK_SECRET_KEY = ORIGINAL_SECRET;
  });

  it("accepts a signature correctly computed from the raw body and secret", () => {
    const body = JSON.stringify({ event: "charge.success", data: { reference: "abc123" } });
    const signature = createHmac("sha512", "test_secret_key").update(body).digest("hex");

    expect(verifyPaystackSignature(body, signature)).toBe(true);
  });

  it("rejects a signature computed with the wrong secret", () => {
    const body = JSON.stringify({ event: "charge.success", data: { reference: "abc123" } });
    const forgedSignature = createHmac("sha512", "wrong_secret").update(body).digest("hex");

    expect(verifyPaystackSignature(body, forgedSignature)).toBe(false);
  });

  it("rejects a signature that doesn't match a tampered body", () => {
    const originalBody = JSON.stringify({ event: "charge.success", data: { reference: "abc123" } });
    const signature = createHmac("sha512", "test_secret_key").update(originalBody).digest("hex");
    const tamperedBody = JSON.stringify({ event: "charge.success", data: { reference: "hacked" } });

    expect(verifyPaystackSignature(tamperedBody, signature)).toBe(false);
  });

  it("rejects when no signature header is present", () => {
    expect(verifyPaystackSignature("{}", null)).toBe(false);
  });

  it("rejects when the secret key is not configured", () => {
    delete process.env.PAYSTACK_SECRET_KEY;
    expect(verifyPaystackSignature("{}", "any-signature")).toBe(false);
  });
});
