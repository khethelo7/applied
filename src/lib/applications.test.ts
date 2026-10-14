import { describe, it, expect } from "vitest";
import { needsNudge } from "./applications";
import type { Application } from "../types";

const job: Application = {
  id: "1",
  company: "Vodacom",
  role: "Junior Developer",
  dateSent: "2026-10-01",
  stage: "applied",
  createdAt: "2026-10-01T09:00:00Z",
};

describe("needsNudge", () => {
  it("is false at exactly fourteen days", () => {
    expect(needsNudge(job, new Date("2026-10-15"))).toBe(false);
  });

  it("is true at fifteen days", () => {
    expect(needsNudge(job, new Date("2026-10-16"))).toBe(true);
  });

  it("is false once there is an interview", () => {
    expect(
      needsNudge(
        { ...job, stage: "interview" },
        new Date("2026-12-01")
      )
    ).toBe(false);
  });
});