import { describe, it, expect } from "vitest";
import { client } from "./index";

describe("database connection", () => {
  it("can execute a query", async () => {
    const result = await client`select 1 as value`;
    expect(result[0]?.value).toBe(1);
  });
});