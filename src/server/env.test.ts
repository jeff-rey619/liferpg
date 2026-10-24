import { describe, it, expect } from "vitest";
import { loadEnv } from "./env";

describe("loadEnv", () => {
  it("parses valid env", () => {
    const env = loadEnv({ NODE_ENV: "test" });
    expect(env.NODE_ENV).toBe("test");
  });

  it("defaults NODE_ENV to development", () => {
    const env = loadEnv({});
    expect(env.NODE_ENV).toBe("development");
  });

  it("rejects invalid NODE_ENV", () => {
    expect(() => loadEnv({ NODE_ENV: "nope" })).toThrow();
  });
});