export type DecisionStatus = "pending" | "reviewed";

export type ActualOutcomeStatus = "happened" | "did_not_happen" | "partial";

export type DecisionRecord = {
  id: string;
  title: string;
  category: string;
  decisionDate: string;
  reviewDate: string;
  expectedOutcome: string;
  confidencePercentage: number;
  reasoning: string;
  status: DecisionStatus;
  actualOutcomeStatus: ActualOutcomeStatus | null;
  satisfactionScore: number | null;
  lessonLearned: string;
  createdAt: string;
  updatedAt: string;
};

export type DecisionInput = {
  title: string;
  category: string;
  decisionDate: string;
  reviewDate: string;
  expectedOutcome: string;
  confidencePercentage: number;
  reasoning: string;
};

export type ReviewInput = {
  actualOutcomeStatus: ActualOutcomeStatus;
  satisfactionScore: number;
  lessonLearned: string;
};

export type Result<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      errors: string[];
    };

export type ConfidenceBucket = {
  label: string;
  min: number;
  max: number;
  count: number;
  averageConfidence: number;
  observedAccuracy: number;
  calibrationGap: number;
};

export type CategoryAccuracy = {
  category: string;
  reviewedCount: number;
  averageConfidence: number;
  observedAccuracy: number;
};

export type DecisionAnalytics = {
  totalCount: number;
  reviewedCount: number;
  pendingCount: number;
  averageConfidence: number;
  observedAccuracy: number;
  brierScore: number;
  calibrationGap: number;
  overconfidenceIndex: number;
  decisionHealthScore: number;
  confidenceBuckets: ConfidenceBucket[];
  accuracyByCategory: CategoryAccuracy[];
};

export type DecisionWarning = {
  id: string;
  title: string;
  detail: string;
  severity: "info" | "warning";
};

export type DashboardModel = {
  totalDecisions: number;
  pendingReviewCount: number;
  overdueReviewCount: number;
  reviewedCount: number;
  recentDecisions: DecisionRecord[];
  pendingReviews: DecisionRecord[];
  recentLessons: string[];
  analytics: DecisionAnalytics;
  warnings: DecisionWarning[];
};

export type DecisionExportPayload = {
  app: "DecisionOS";
  version: number;
  exportedAt: string;
  decisions: DecisionRecord[];
};

export type DecisionRepository = {
  list: () => Promise<DecisionRecord[]>;
  save: (decision: DecisionRecord) => Promise<void>;
  remove: (id: string) => Promise<void>;
  replaceAll: (decisions: DecisionRecord[]) => Promise<void>;
  reset: () => Promise<void>;
};
