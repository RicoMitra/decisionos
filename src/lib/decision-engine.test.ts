import { describe, expect, it } from "vitest";
import {
  buildAnalytics,
  buildDashboardModel,
  buildWarnings,
  normalizeDecisionInput,
} from "@/lib/decision-engine";
import type { DecisionRecord } from "@/lib/types";

const reviewed: DecisionRecord[] = [
  {
    id: "decision-1",
    title: "Ship the calibration prototype",
    category: "Project",
    decisionDate: "2026-06-01",
    reviewDate: "2026-06-12",
    expectedOutcome: "Prototype is usable in a portfolio demo.",
    confidencePercentage: 80,
    reasoning: "Scope is narrow and fixtures are ready.",
    status: "reviewed",
    actualOutcomeStatus: "happened",
    satisfactionScore: 8,
    lessonLearned: "Small review windows kept momentum visible.",
    createdAt: "2026-06-01T08:00:00.000Z",
    updatedAt: "2026-06-12T08:00:00.000Z",
  },
  {
    id: "decision-2",
    title: "Finish the statistics module in one evening",
    category: "Learning",
    decisionDate: "2026-06-02",
    reviewDate: "2026-06-09",
    expectedOutcome: "Complete notes and exercises.",
    confidencePercentage: 90,
    reasoning: "The chapter looked short.",
    status: "reviewed",
    actualOutcomeStatus: "did_not_happen",
    satisfactionScore: 4,
    lessonLearned: "I ignored the exercise difficulty.",
    createdAt: "2026-06-02T08:00:00.000Z",
    updatedAt: "2026-06-09T08:00:00.000Z",
  },
  {
    id: "decision-3",
    title: "Buy a used monitor after checking desk space",
    category: "Purchase",
    decisionDate: "2026-06-04",
    reviewDate: "2026-06-18",
    expectedOutcome: "Monitor improves study sessions.",
    confidencePercentage: 60,
    reasoning: "The price is fair but the desk is tight.",
    status: "reviewed",
    actualOutcomeStatus: "partial",
    satisfactionScore: 6,
    lessonLearned: "Measure the desk before comparing prices.",
    createdAt: "2026-06-04T08:00:00.000Z",
    updatedAt: "2026-06-18T08:00:00.000Z",
  },
];

describe("decision input normalization", () => {
  it("accepts complete pending decision input and trims text fields", () => {
    const result = normalizeDecisionInput({
      title: "  Choose capstone topic  ",
      category: "  Career  ",
      decisionDate: "2026-06-26",
      reviewDate: "2026-07-03",
      expectedOutcome: "  Pick one clear idea.  ",
      confidencePercentage: 70,
      reasoning: "  I have three viable options.  ",
    });

    expect(result.ok).toBe(true);
    expect(result.ok && result.value).toMatchObject({
      title: "Choose capstone topic",
      category: "Career",
      confidencePercentage: 70,
      status: "pending",
    });
  });

  it("rejects invalid confidence, date order, and missing explanation", () => {
    const result = normalizeDecisionInput({
      title: "",
      category: "Project",
      decisionDate: "2026-07-10",
      reviewDate: "2026-07-01",
      expectedOutcome: "Done",
      confidencePercentage: 121,
      reasoning: "",
    });

    expect(result.ok).toBe(false);
    expect(result.ok ? [] : result.errors).toEqual([
      "Title is required.",
      "Confidence must be between 0 and 100.",
      "Review date cannot be before the decision date.",
      "Reasoning is required.",
    ]);
  });
});

describe("DecisionOS scoring engine", () => {
  it("calculates deterministic calibration metrics without NaN or Infinity", () => {
    const analytics = buildAnalytics(reviewed);

    expect(analytics.reviewedCount).toBe(3);
    expect(analytics.averageConfidence).toBeCloseTo(76.67, 2);
    expect(analytics.observedAccuracy).toBeCloseTo(50, 2);
    expect(analytics.calibrationGap).toBeCloseTo(26.67, 2);
    expect(analytics.brierScore).toBeCloseTo(0.2867, 4);
    expect(analytics.overconfidenceIndex).toBeCloseTo(26.67, 2);
    expect(analytics.decisionHealthScore).toBeGreaterThanOrEqual(0);
    expect(analytics.decisionHealthScore).toBeLessThanOrEqual(100);
  });

  it("groups reviewed decisions into confidence buckets and category accuracy", () => {
    const analytics = buildAnalytics(reviewed);

    expect(analytics.confidenceBuckets.map((bucket) => bucket.label)).toEqual([
      "0-20%",
      "21-40%",
      "41-60%",
      "61-80%",
      "81-100%",
    ]);
    expect(analytics.confidenceBuckets.find((bucket) => bucket.label === "81-100%")).toMatchObject({
      count: 1,
      observedAccuracy: 0,
      averageConfidence: 90,
    });
    expect(analytics.accuracyByCategory).toEqual([
      {
        category: "Learning",
        reviewedCount: 1,
        observedAccuracy: 0,
        averageConfidence: 90,
      },
      {
        category: "Project",
        reviewedCount: 1,
        observedAccuracy: 100,
        averageConfidence: 80,
      },
      {
        category: "Purchase",
        reviewedCount: 1,
        observedAccuracy: 50,
        averageConfidence: 60,
      },
    ]);
  });

  it("returns safe empty analytics for no reviewed decisions", () => {
    const analytics = buildAnalytics([]);

    expect(analytics.reviewedCount).toBe(0);
    expect(analytics.brierScore).toBe(0);
    expect(analytics.calibrationGap).toBe(0);
    expect(analytics.decisionHealthScore).toBe(0);
    expect(analytics.confidenceBuckets.every((bucket) => bucket.count === 0)).toBe(true);
  });
});

describe("dashboard model and warnings", () => {
  it("counts due decisions, recent lessons, and reviewed decisions", () => {
    const pending: DecisionRecord = {
      id: "decision-4",
      title: "Apply to the data internship",
      category: "Career",
      decisionDate: "2026-06-10",
      reviewDate: "2026-06-20",
      expectedOutcome: "Application is submitted with a tailored portfolio note.",
      confidencePercentage: 75,
      reasoning: "Resume and project links are ready.",
      status: "pending",
      actualOutcomeStatus: null,
      satisfactionScore: null,
      lessonLearned: "",
      createdAt: "2026-06-10T08:00:00.000Z",
      updatedAt: "2026-06-10T08:00:00.000Z",
    };

    const dashboard = buildDashboardModel([...reviewed, pending], "2026-06-26");

    expect(dashboard.totalDecisions).toBe(4);
    expect(dashboard.pendingReviewCount).toBe(1);
    expect(dashboard.overdueReviewCount).toBe(1);
    expect(dashboard.recentLessons[0]).toContain("Measure the desk");
  });

  it("explains overconfidence and overdue review warnings with trigger values", () => {
    const dashboard = buildDashboardModel(reviewed, "2026-06-26");
    const warnings = buildWarnings(dashboard.analytics, {
      overdueReviewCount: 2,
      pendingReviewCount: 4,
    });

    expect(warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Possible overconfidence",
          detail: expect.stringContaining("26.7 percentage points"),
        }),
        expect.objectContaining({
          title: "Planning fallacy risk",
          detail: expect.stringContaining("2 overdue reviews"),
        }),
      ]),
    );
  });
});
