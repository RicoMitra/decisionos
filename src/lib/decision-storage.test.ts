import { describe, expect, it } from "vitest";
import {
  DECISIONOS_EXPORT_VERSION,
  createDecisionRepository,
  createExportPayload,
  parseImportPayload,
} from "@/lib/decision-storage";
import type { DecisionRecord } from "@/lib/types";

const records: DecisionRecord[] = [
  {
    id: "decision-1",
    title: "Ship a portfolio MVP",
    category: "Project",
    decisionDate: "2026-06-01",
    reviewDate: "2026-06-15",
    expectedOutcome: "A reviewer can create and review one decision.",
    confidencePercentage: 70,
    reasoning: "The scope is small and testable.",
    status: "reviewed",
    actualOutcomeStatus: "happened",
    satisfactionScore: 8,
    lessonLearned: "The engine-first order reduced rework.",
    createdAt: "2026-06-01T08:00:00.000Z",
    updatedAt: "2026-06-15T08:00:00.000Z",
  },
];

describe("DecisionOS JSON backup", () => {
  it("exports versioned user-triggered JSON and imports it safely", () => {
    const payload = createExportPayload(records, "2026-06-26T09:00:00.000Z");
    const parsed = parseImportPayload(JSON.stringify(payload));

    expect(payload).toMatchObject({
      app: "DecisionOS",
      version: DECISIONOS_EXPORT_VERSION,
      exportedAt: "2026-06-26T09:00:00.000Z",
    });
    expect(parsed.ok).toBe(true);
    expect(parsed.ok && parsed.value.decisions).toEqual(records);
  });

  it("rejects malformed JSON, unsupported versions, and invalid records", () => {
    expect(parseImportPayload("not-json")).toEqual({
      ok: false,
      errors: ["Import file must be valid JSON."],
    });
    expect(parseImportPayload(JSON.stringify({ app: "DecisionOS", version: 99, decisions: [] }))).toEqual({
      ok: false,
      errors: ["Unsupported DecisionOS export version."],
    });
    expect(
      parseImportPayload(
        JSON.stringify({
          app: "DecisionOS",
          version: DECISIONOS_EXPORT_VERSION,
          exportedAt: "2026-06-26T09:00:00.000Z",
          decisions: [{ ...records[0], confidencePercentage: -1 }],
        }),
      ),
    ).toEqual({
      ok: false,
      errors: ["Decision 1: Confidence must be between 0 and 100."],
    });
  });
});

describe("Decision repository contract", () => {
  it("supports list, save, replace, delete, and reset without a backend", async () => {
    const repository = createDecisionRepository();

    await repository.reset();
    await repository.save(records[0]);

    expect(await repository.list()).toEqual(records);

    await repository.save({ ...records[0], title: "Ship a tested portfolio MVP" });
    expect((await repository.list())[0].title).toBe("Ship a tested portfolio MVP");

    await repository.replaceAll(records);
    expect(await repository.list()).toEqual(records);

    await repository.remove(records[0].id);
    expect(await repository.list()).toEqual([]);
  });
});
