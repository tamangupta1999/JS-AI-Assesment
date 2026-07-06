import { describe, expect, it } from "vitest";
import { getValidNextStatuses, isValidTransition } from "../constants/index.js";

describe("ticket state machine", () => {
  it("allows valid transitions", () => {
    expect(isValidTransition("open", "in_progress")).toBe(true);
    expect(isValidTransition("open", "cancelled")).toBe(true);
    expect(isValidTransition("in_progress", "resolved")).toBe(true);
    expect(isValidTransition("in_progress", "cancelled")).toBe(true);
    expect(isValidTransition("resolved", "closed")).toBe(true);
  });

  it("rejects invalid transitions", () => {
    expect(isValidTransition("open", "resolved")).toBe(false);
    expect(isValidTransition("open", "closed")).toBe(false);
    expect(isValidTransition("resolved", "open")).toBe(false);
    expect(isValidTransition("closed", "open")).toBe(false);
    expect(isValidTransition("cancelled", "open")).toBe(false);
  });

  it("returns valid next statuses", () => {
    expect(getValidNextStatuses("open")).toEqual(["in_progress", "cancelled"]);
    expect(getValidNextStatuses("closed")).toEqual([]);
    expect(getValidNextStatuses("cancelled")).toEqual([]);
  });
});
