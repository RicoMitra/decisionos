import type {
  ActualOutcomeStatus,
  CategoryAccuracy,
  ConfidenceBucket,
  DashboardModel,
  DecisionAnalytics,
  DecisionInput,
  DecisionRecord,
  DecisionWarning,
  Result,
  ReviewInput,
} from "@/lib/types";

const BUCKETS = [
  { label: "0-20%", min: 0, max: 20 },
  { label: "21-40%", min: 21, max: 40 },
  { label: "41-60%", min: 41, max: 60 },
  { label: "61-80%", min: 61, max: 80 },
  { label: "81-100%", min: 81, max: 100 },
];

export const DEMO_TODAY = "2026-06-26";

export function createDecisionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `decision-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function normalizeDecisionInput(
  input: DecisionInput,
  now = new Date().toISOString(),
  id = createDecisionId(),
): Result<DecisionRecord> {
  const title = input.title.trim();
  const category = input.category.trim();
  const expectedOutcome = input.expectedOutcome.trim();
  const reasoning = input.reasoning.trim();
  const errors: string[] = [];

  if (!title) errors.push("Title is required.");
  if (!category) errors.push("Category is required.");
  if (!isIsoDate(input.decisionDate)) errors.push("Decision date must use YYYY-MM-DD.");
  if (!isIsoDate(input.reviewDate)) errors.push("Review date must use YYYY-MM-DD.");
  if (!expectedOutcome) errors.push("Expected outcome is required.");
  if (!isFiniteNumber(input.confidencePercentage) || input.confidencePercentage < 0 || input.confidencePercentage > 100) {
    errors.push("Confidence must be between 0 and 100.");
  }
  if (isIsoDate(input.decisionDate) && isIsoDate(input.reviewDate) && input.reviewDate < input.decisionDate) {
    errors.push("Review date cannot be before the decision date.");
  }
  if (!reasoning) errors.push("Reasoning is required.");

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      id,
      title,
      category,
      decisionDate: input.decisionDate,
      reviewDate: input.reviewDate,
      expectedOutcome,
      confidencePercentage: input.confidencePercentage,
      reasoning,
      status: "pending",
      actualOutcomeStatus: null,
      satisfactionScore: null,
      lessonLearned: "",
      createdAt: now,
      updatedAt: now,
    },
  };
}

export function normalizeReviewInput(input: ReviewInput): Result<ReviewInput> {
  const lessonLearned = input.lessonLearned.trim();
  const errors: string[] = [];

  if (!["happened", "did_not_happen", "partial"].includes(input.actualOutcomeStatus)) {
    errors.push("Outcome status is required.");
  }
  if (!isFiniteNumber(input.satisfactionScore) || input.satisfactionScore < 1 || input.satisfactionScore > 10) {
    errors.push("Satisfaction score must be between 1 and 10.");
  }
  if (!lessonLearned) errors.push("Lesson learned is required.");

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      actualOutcomeStatus: input.actualOutcomeStatus,
      satisfactionScore: input.satisfactionScore,
      lessonLearned,
    },
  };
}

export function applyReview(decision: DecisionRecord, input: ReviewInput, now = new Date().toISOString()): Result<DecisionRecord> {
  const normalized = normalizeReviewInput(input);
  if (!normalized.ok) return normalized;

  return {
    ok: true,
    value: {
      ...decision,
      status: "reviewed",
      actualOutcomeStatus: normalized.value.actualOutcomeStatus,
      satisfactionScore: normalized.value.satisfactionScore,
      lessonLearned: normalized.value.lessonLearned,
      updatedAt: now,
    },
  };
}

export function buildAnalytics(decisions: DecisionRecord[]): DecisionAnalytics {
  const reviewed = decisions.filter((decision) => decision.status === "reviewed" && decision.actualOutcomeStatus);
  const confidenceValues = reviewed.map((decision) => decision.confidencePercentage);
  const outcomes = reviewed.map((decision) => outcomeToValue(decision.actualOutcomeStatus));
  const averageConfidence = average(confidenceValues);
  const observedAccuracy = average(outcomes.map((value) => value * 100));
  const brierScore = average(
    reviewed.map((decision) => {
      const probability = decision.confidencePercentage / 100;
      const outcome = outcomeToValue(decision.actualOutcomeStatus);
      return (probability - outcome) ** 2;
    }),
  );
  const calibrationGap = averageConfidence - observedAccuracy;
  const overconfidenceIndex = Math.max(0, calibrationGap);
  const reviewCompletion = decisions.length === 0 ? 0 : (reviewed.length / decisions.length) * 100;
  const lessonQuality = reviewed.length === 0 ? 0 : (reviewed.filter((decision) => decision.lessonLearned.trim().length >= 20).length / reviewed.length) * 100;
  const categorySpread = Math.min(100, new Set(decisions.map((decision) => decision.category)).size * 25);
  const calibrationQuality = Math.max(0, 100 - Math.abs(calibrationGap));
  const decisionHealthScore =
    reviewed.length === 0
      ? 0
      : roundNumber(calibrationQuality * 0.4 + reviewCompletion * 0.25 + lessonQuality * 0.2 + categorySpread * 0.15, 1);

  return {
    totalCount: decisions.length,
    reviewedCount: reviewed.length,
    pendingCount: decisions.length - reviewed.length,
    averageConfidence: roundNumber(averageConfidence, 2),
    observedAccuracy: roundNumber(observedAccuracy, 2),
    brierScore: roundNumber(brierScore, 4),
    calibrationGap: roundNumber(calibrationGap, 2),
    overconfidenceIndex: roundNumber(overconfidenceIndex, 2),
    decisionHealthScore,
    confidenceBuckets: buildConfidenceBuckets(reviewed),
    accuracyByCategory: buildAccuracyByCategory(reviewed),
  };
}

export function buildDashboardModel(decisions: DecisionRecord[], today = todayString()): DashboardModel {
  const sorted = [...decisions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const pendingReviews = decisions
    .filter((decision) => decision.status === "pending" && decision.reviewDate <= today)
    .sort((a, b) => a.reviewDate.localeCompare(b.reviewDate));
  const overdueReviewCount = pendingReviews.filter((decision) => decision.reviewDate < today).length;
  const analytics = buildAnalytics(decisions);

  const modelBase = {
    totalDecisions: decisions.length,
    pendingReviewCount: pendingReviews.length,
    overdueReviewCount,
    reviewedCount: analytics.reviewedCount,
    recentDecisions: sorted.slice(0, 5),
    pendingReviews,
    recentLessons: sorted
      .filter((decision) => decision.status === "reviewed" && decision.lessonLearned.trim())
      .map((decision) => decision.lessonLearned)
      .slice(0, 5),
    analytics,
  };

  return {
    ...modelBase,
    warnings: buildWarnings(analytics, {
      overdueReviewCount: modelBase.overdueReviewCount,
      pendingReviewCount: modelBase.pendingReviewCount,
    }),
  };
}

export function buildWarnings(
  analytics: DecisionAnalytics,
  reviewState: { overdueReviewCount: number; pendingReviewCount: number },
): DecisionWarning[] {
  const warnings: DecisionWarning[] = [];

  if (analytics.reviewedCount >= 3 && analytics.overconfidenceIndex >= 15) {
    warnings.push({
      id: "possible-overconfidence",
      title: "Possible overconfidence",
      detail: `Average confidence is ${analytics.overconfidenceIndex.toFixed(1)} percentage points above observed accuracy across ${analytics.reviewedCount} reviewed decisions.`,
      severity: "warning",
    });
  }

  if (reviewState.overdueReviewCount >= 2 || (reviewState.pendingReviewCount >= 4 && reviewState.overdueReviewCount / reviewState.pendingReviewCount >= 0.25)) {
    warnings.push({
      id: "planning-fallacy-risk",
      title: "Planning fallacy risk",
      detail: `${reviewState.overdueReviewCount} overdue reviews suggest review dates may be too optimistic or not revisited often enough.`,
      severity: "warning",
    });
  }

  if (analytics.reviewedCount === 0) {
    warnings.push({
      id: "needs-reviewed-data",
      title: "Calibration needs reviews",
      detail: "Scores appear after at least one decision has an actual outcome.",
      severity: "info",
    });
  }

  return warnings;
}

export function isValidDecisionRecord(value: unknown): value is DecisionRecord {
  if (!value || typeof value !== "object") return false;
  const decision = value as Partial<DecisionRecord>;

  return (
    typeof decision.id === "string" &&
    decision.id.trim().length > 0 &&
    typeof decision.title === "string" &&
    decision.title.trim().length > 0 &&
    typeof decision.category === "string" &&
    decision.category.trim().length > 0 &&
    typeof decision.decisionDate === "string" &&
    isIsoDate(decision.decisionDate) &&
    typeof decision.reviewDate === "string" &&
    isIsoDate(decision.reviewDate) &&
    decision.reviewDate >= decision.decisionDate &&
    typeof decision.expectedOutcome === "string" &&
    decision.expectedOutcome.trim().length > 0 &&
    typeof decision.confidencePercentage === "number" &&
    decision.confidencePercentage >= 0 &&
    decision.confidencePercentage <= 100 &&
    typeof decision.reasoning === "string" &&
    decision.reasoning.trim().length > 0 &&
    (decision.status === "pending" || decision.status === "reviewed") &&
    isReviewStateConsistent(decision) &&
    typeof decision.createdAt === "string" &&
    typeof decision.updatedAt === "string"
  );
}

export function outcomeToValue(outcome: ActualOutcomeStatus | null | undefined) {
  if (outcome === "happened") return 1;
  if (outcome === "partial") return 0.5;
  return 0;
}

function buildConfidenceBuckets(reviewed: DecisionRecord[]): ConfidenceBucket[] {
  return BUCKETS.map((bucket) => {
    const records = reviewed.filter(
      (decision) => decision.confidencePercentage >= bucket.min && decision.confidencePercentage <= bucket.max,
    );
    const averageConfidence = average(records.map((decision) => decision.confidencePercentage));
    const observedAccuracy = average(records.map((decision) => outcomeToValue(decision.actualOutcomeStatus) * 100));

    return {
      ...bucket,
      count: records.length,
      averageConfidence: roundNumber(averageConfidence, 2),
      observedAccuracy: roundNumber(observedAccuracy, 2),
      calibrationGap: roundNumber(averageConfidence - observedAccuracy, 2),
    };
  });
}

function buildAccuracyByCategory(reviewed: DecisionRecord[]): CategoryAccuracy[] {
  const categories = Array.from(new Set(reviewed.map((decision) => decision.category))).sort((a, b) => a.localeCompare(b));

  return categories.map((category) => {
    const records = reviewed.filter((decision) => decision.category === category);
    return {
      category,
      reviewedCount: records.length,
      observedAccuracy: roundNumber(average(records.map((decision) => outcomeToValue(decision.actualOutcomeStatus) * 100)), 2),
      averageConfidence: roundNumber(average(records.map((decision) => decision.confidencePercentage)), 2),
    };
  });
}

function isReviewStateConsistent(decision: Partial<DecisionRecord>) {
  if (decision.status === "pending") {
    return decision.actualOutcomeStatus === null && decision.satisfactionScore === null && typeof decision.lessonLearned === "string";
  }

  return (
    (decision.actualOutcomeStatus === "happened" ||
      decision.actualOutcomeStatus === "did_not_happen" ||
      decision.actualOutcomeStatus === "partial") &&
    typeof decision.satisfactionScore === "number" &&
    decision.satisfactionScore >= 1 &&
    decision.satisfactionScore <= 10 &&
    typeof decision.lessonLearned === "string" &&
    decision.lessonLearned.trim().length > 0
  );
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`));
}

function isFiniteNumber(value: number) {
  return typeof value === "number" && Number.isFinite(value);
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function roundNumber(value: number, digits: number) {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}
