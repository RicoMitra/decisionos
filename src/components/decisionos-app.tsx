"use client";

import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Database,
  Download,
  FileUp,
  Gauge,
  ListChecks,
  Plus,
  RotateCcw,
  Settings,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { buildDashboardModel, applyReview, normalizeDecisionInput, normalizeReviewInput } from "@/lib/decision-engine";
import { createExportPayload, parseImportPayload } from "@/lib/decision-storage";
import { demoDecisions } from "@/lib/demo-data";
import { formatDate, formatPercent, formatScore } from "@/lib/format";
import { useDecisions } from "@/lib/use-decisions";
import type { ActualOutcomeStatus, DecisionInput, DecisionRecord, ReviewInput } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type View = "dashboard" | "new" | "review" | "analytics" | "settings";

const today = new Date().toISOString().slice(0, 10);

const initialDecisionInput: DecisionInput = {
  title: "",
  category: "Project",
  decisionDate: today,
  reviewDate: today,
  expectedOutcome: "",
  confidencePercentage: 70,
  reasoning: "",
};

const initialReviewInput: ReviewInput = {
  actualOutcomeStatus: "happened",
  satisfactionScore: 7,
  lessonLearned: "",
};

const navItems: Array<{ view: View; label: string; icon: typeof Gauge }> = [
  { view: "dashboard", label: "Dashboard", icon: Gauge },
  { view: "new", label: "New Decision", icon: Plus },
  { view: "review", label: "Review Decision", icon: ListChecks },
  { view: "analytics", label: "Analytics", icon: BarChart3 },
  { view: "settings", label: "Settings", icon: Settings },
];

const statusColors: Record<string, string> = {
  happened: "var(--success)",
  partial: "var(--warning)",
  did_not_happen: "var(--danger)",
  pending: "var(--muted)",
};

export function DecisionOSApp() {
  const [view, setView] = useState<View>("dashboard");
  const [decisionInput, setDecisionInput] = useState<DecisionInput>(initialDecisionInput);
  const [reviewInput, setReviewInput] = useState<ReviewInput>(initialReviewInput);
  const [selectedReviewId, setSelectedReviewId] = useState("");
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const importInputRef = useRef<HTMLInputElement>(null);
  const { decisions, isReady, error, save, remove, replaceAll, reset } = useDecisions();
  const dashboard = useMemo(() => buildDashboardModel(decisions, today), [decisions]);
  const selectedReview = dashboard.pendingReviews.find((decision) => decision.id === selectedReviewId) ?? dashboard.pendingReviews[0];

  function updateDecisionField<K extends keyof DecisionInput>(field: K, value: DecisionInput[K]) {
    setDecisionInput((current) => ({ ...current, [field]: value }));
  }

  async function handleCreateDecision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeDecisionInput(decisionInput);

    if (!normalized.ok) {
      setFormErrors(normalized.errors);
      return;
    }

    await save(normalized.value);
    setDecisionInput({ ...initialDecisionInput, decisionDate: today, reviewDate: today });
    setFormErrors([]);
    setNotice("Decision saved locally.");
    setView("dashboard");
  }

  async function handleReviewDecision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedReview) {
      setFormErrors(["No due decision is selected for review."]);
      return;
    }

    const normalized = normalizeReviewInput(reviewInput);
    if (!normalized.ok) {
      setFormErrors(normalized.errors);
      return;
    }

    const reviewed = applyReview(selectedReview, normalized.value);
    if (!reviewed.ok) {
      setFormErrors(reviewed.errors);
      return;
    }

    await save(reviewed.value);
    setReviewInput(initialReviewInput);
    setSelectedReviewId("");
    setFormErrors([]);
    setNotice("Review saved locally.");
    setView("dashboard");
  }

  function handleExport() {
    const payload = createExportPayload(decisions);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `decisionos-backup-${today}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("JSON backup exported from this browser.");
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const parsed = parseImportPayload(await file.text());
    if (!parsed.ok) {
      setFormErrors(parsed.errors);
      return;
    }

    await replaceAll(parsed.value.decisions);
    setFormErrors([]);
    setNotice(`Imported ${parsed.value.decisions.length} decisions from JSON.`);
    event.target.value = "";
  }

  async function handleLoadDemo() {
    await replaceAll(demoDecisions);
    setNotice("Demo data loaded. It is stored only in this browser.");
  }

  async function handleReset() {
    await reset();
    setNotice("Local DecisionOS data cleared.");
  }

  return (
    <main className="min-h-[100dvh] bg-[var(--bg)] text-[var(--fg)]">
      <div className="mx-auto grid w-full max-w-[1400px] gap-6 px-4 py-5 md:grid-cols-[260px_1fr] md:px-8 md:py-8">
        <aside className="rounded-[28px] border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-soft)] md:sticky md:top-8 md:h-[calc(100dvh-4rem)]">
          <div className="flex items-center gap-3 border-b border-[var(--border)] pb-5">
            <div className="grid size-11 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <ShieldCheck aria-hidden="true" size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Local-first</p>
              <h1 className="text-xl font-semibold tracking-tight">DecisionOS</h1>
            </div>
          </div>

          <nav aria-label="DecisionOS sections" className="mt-5 grid gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.view}
                  type="button"
                  onClick={() => {
                    setView(item.view);
                    setFormErrors([]);
                  }}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-2xl px-3 text-left text-sm font-medium text-[var(--muted)] transition-[background,transform,color] duration-200 ease-out hover:-translate-y-0.5 hover:bg-[var(--surface)] hover:text-[var(--fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                    view === item.view && "bg-[var(--fg)] text-[var(--bg)] hover:bg-[var(--fg)] hover:text-[var(--bg)]",
                  )}
                >
                  <Icon aria-hidden="true" size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-6 rounded-2xl bg-[var(--surface)] p-4 text-sm leading-relaxed text-[var(--muted)]">
            <p className="font-medium text-[var(--fg)]">Private by default</p>
            <p className="mt-2">No API, login, backend, cloud database, or production AI call. Data stays in IndexedDB unless you export JSON.</p>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="mb-6 grid gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow-soft)] md:grid-cols-[1fr_auto] md:p-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Personal calibration workspace</p>
              <h2 className="mt-3 max-w-[12ch] text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
                Decisions with receipts.
              </h2>
              <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-[var(--muted)]">
                Record the prediction before hindsight arrives. Review the outcome later, then let deterministic scoring show calibration patterns.
              </p>
            </div>
            <div className="grid content-end gap-3 text-sm md:min-w-60">
              <MetricStrip label="Reviewed" value={dashboard.reviewedCount.toString()} />
              <MetricStrip label="Due now" value={dashboard.pendingReviewCount.toString()} />
              <MetricStrip label="Health" value={formatScore(dashboard.analytics.decisionHealthScore, 1)} />
            </div>
          </header>

          {notice && (
            <div role="status" className="mb-4 rounded-2xl border border-[var(--success-border)] bg-[var(--success-soft)] px-4 py-3 text-sm text-[var(--success-text)]">
              {notice}
            </div>
          )}
          {error && (
            <div role="alert" className="mb-4 rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger-text)]">
              {error}
            </div>
          )}
          {formErrors.length > 0 && <ErrorList errors={formErrors} />}

          {!isReady ? <SkeletonView /> : null}
          {isReady && view === "dashboard" && <DashboardView decisions={decisions} dashboard={dashboard} onNavigate={setView} onRemove={remove} />}
          {isReady && view === "new" && (
            <NewDecisionView input={decisionInput} onChange={updateDecisionField} onSave={handleCreateDecision} />
          )}
          {isReady && view === "review" && (
            <ReviewDecisionView
              pendingReviews={dashboard.pendingReviews}
              selectedReview={selectedReview}
              selectedReviewId={selectedReviewId}
              reviewInput={reviewInput}
              onSelect={setSelectedReviewId}
              onInput={setReviewInput}
              onSave={handleReviewDecision}
              onNavigate={setView}
            />
          )}
          {isReady && view === "analytics" && <AnalyticsView dashboard={dashboard} decisions={decisions} />}
          {isReady && view === "settings" && (
            <SettingsView
              count={decisions.length}
              importInputRef={importInputRef}
              onExport={handleExport}
              onImport={handleImport}
              onLoadDemo={handleLoadDemo}
              onReset={handleReset}
            />
          )}
        </section>
      </div>
    </main>
  );
}

function DashboardView({
  decisions,
  dashboard,
  onNavigate,
  onRemove,
}: {
  decisions: DecisionRecord[];
  dashboard: ReturnType<typeof buildDashboardModel>;
  onNavigate: (view: View) => void;
  onRemove: (id: string) => Promise<void>;
}) {
  const outcomeData = [
    { name: "Happened", value: decisions.filter((decision) => decision.actualOutcomeStatus === "happened").length, fill: statusColors.happened },
    { name: "Partial", value: decisions.filter((decision) => decision.actualOutcomeStatus === "partial").length, fill: statusColors.partial },
    { name: "Did not happen", value: decisions.filter((decision) => decision.actualOutcomeStatus === "did_not_happen").length, fill: statusColors.did_not_happen },
    { name: "Pending", value: decisions.filter((decision) => decision.status === "pending").length, fill: statusColors.pending },
  ].filter((item) => item.value > 0);

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Total decisions" value={dashboard.totalDecisions.toString()} detail="Recorded locally" />
        <SummaryCard label="Brier Score" value={formatScore(dashboard.analytics.brierScore, 3)} detail="Lower prediction error is better" />
        <SummaryCard label="Calibration Gap" value={formatPercent(dashboard.analytics.calibrationGap)} detail="Confidence minus observed accuracy" />
        <SummaryCard label="Overdue" value={dashboard.overdueReviewCount.toString()} detail="Needs review attention" />
      </div>

      {decisions.length === 0 ? (
        <EmptyState
          title="No decisions recorded yet."
          body="Create a decision or load demo data in Settings to see calibration metrics."
          actionLabel="Create decision"
          onAction={() => onNavigate("new")}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="p-5 md:p-6">
            <SectionTitle eyebrow="Review queue" title="Due decisions" />
            <div className="mt-4 divide-y divide-[var(--border)]">
              {dashboard.pendingReviews.length === 0 ? (
                <p className="py-6 text-sm text-[var(--muted)]">No due reviews. Future review dates will appear here.</p>
              ) : (
                dashboard.pendingReviews.map((decision) => (
                  <DecisionRow key={decision.id} decision={decision} actionLabel="Review" onAction={() => onNavigate("review")} onRemove={onRemove} />
                ))
              )}
            </div>
          </Card>

          <Card className="p-5 md:p-6">
            <SectionTitle eyebrow="Outcome mix" title="Reviewed status" />
            <div className="mt-4 h-64">
              {outcomeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={outcomeData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={3}>
                      {outcomeData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="grid h-full place-items-center text-sm text-[var(--muted)]">Review decisions to populate this chart.</p>
              )}
            </div>
            <TextLegend items={outcomeData.map((item) => `${item.name}: ${item.value}`)} />
          </Card>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5 md:p-6">
          <SectionTitle eyebrow="Signals" title="Rule-based warnings" />
          <div className="mt-4 grid gap-3">
            {dashboard.warnings.map((warning) => (
              <div key={warning.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="flex items-center gap-2 font-medium">
                  <AlertCircle aria-hidden="true" size={17} />
                  {warning.title}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{warning.detail}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 md:p-6">
          <SectionTitle eyebrow="Lessons" title="Recent reviews" />
          <div className="mt-4 divide-y divide-[var(--border)]">
            {dashboard.recentLessons.length === 0 ? (
              <p className="py-6 text-sm text-[var(--muted)]">Lessons appear after reviewed decisions.</p>
            ) : (
              dashboard.recentLessons.map((lesson) => (
                <p key={lesson} className="py-3 text-sm leading-relaxed text-[var(--muted)]">
                  {lesson}
                </p>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function NewDecisionView({
  input,
  onChange,
  onSave,
}: {
  input: DecisionInput;
  onChange: <K extends keyof DecisionInput>(field: K, value: DecisionInput[K]) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Card className="p-5 md:p-7">
      <SectionTitle eyebrow="Capture" title="New Decision" />
      <form onSubmit={onSave} className="mt-6 grid gap-5">
        <Field label="Decision title" helper="Use a concrete action you can review later.">
          <Input value={input.title} onChange={(event) => onChange("title", event.target.value)} placeholder="Publish the DecisionOS case study" />
        </Field>
        <div className="grid gap-5 md:grid-cols-3">
          <Field label="Category">
            <Input value={input.category} onChange={(event) => onChange("category", event.target.value)} placeholder="Project" />
          </Field>
          <Field label="Decision date">
            <Input type="date" value={input.decisionDate} onChange={(event) => onChange("decisionDate", event.target.value)} />
          </Field>
          <Field label="Review date">
            <Input type="date" value={input.reviewDate} onChange={(event) => onChange("reviewDate", event.target.value)} />
          </Field>
        </div>
        <Field label="Expected outcome" helper="Write the result that would make this decision count as happened.">
          <textarea
            aria-label="Expected outcome"
            className="min-h-28 w-full rounded-2xl border border-[var(--border)] bg-[var(--input-bg)] px-4 py-3 text-sm leading-relaxed text-[var(--fg)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
            value={input.expectedOutcome}
            onChange={(event) => onChange("expectedOutcome", event.target.value)}
            placeholder="A reviewer can create, review, and export one decision without a backend."
          />
        </Field>
        <Field label={`Confidence: ${input.confidencePercentage}%`} helper="Probability that the expected outcome will happen.">
          <input
            aria-label={`Confidence: ${input.confidencePercentage}%`}
            type="range"
            min="0"
            max="100"
            step="1"
            value={input.confidencePercentage}
            onChange={(event) => onChange("confidencePercentage", Number(event.target.value))}
            className="h-11 w-full accent-[var(--accent)]"
          />
        </Field>
        <Field label="Reasoning" helper="Capture the evidence and assumptions before hindsight changes the story.">
          <textarea
            aria-label="Reasoning"
            className="min-h-28 w-full rounded-2xl border border-[var(--border)] bg-[var(--input-bg)] px-4 py-3 text-sm leading-relaxed text-[var(--fg)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
            value={input.reasoning}
            onChange={(event) => onChange("reasoning", event.target.value)}
            placeholder="Scope is narrow, fixtures are ready, and the scoring engine has tests."
          />
        </Field>
        <Button type="submit" className="min-h-11 w-full md:w-fit">
          <Plus aria-hidden="true" size={17} />
          Save decision
        </Button>
      </form>
    </Card>
  );
}

function ReviewDecisionView({
  pendingReviews,
  selectedReview,
  selectedReviewId,
  reviewInput,
  onSelect,
  onInput,
  onSave,
  onNavigate,
}: {
  pendingReviews: DecisionRecord[];
  selectedReview?: DecisionRecord;
  selectedReviewId: string;
  reviewInput: ReviewInput;
  onSelect: (id: string) => void;
  onInput: (input: ReviewInput) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onNavigate: (view: View) => void;
}) {
  if (pendingReviews.length === 0) {
    return (
      <EmptyState
        title="No decisions are due for review."
        body="Create a decision with a review date, then return here when the date arrives."
        actionLabel="Create decision"
        onAction={() => onNavigate("new")}
      />
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="p-5 md:p-6">
        <SectionTitle eyebrow="Queue" title="Select a decision" />
        <div className="mt-4 divide-y divide-[var(--border)]">
          {pendingReviews.map((decision) => (
            <button
              key={decision.id}
              type="button"
              onClick={() => onSelect(decision.id)}
              className={cn(
                "block w-full py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                (selectedReviewId || pendingReviews[0]?.id) === decision.id && "text-[var(--accent)]",
              )}
            >
              <p className="font-medium">{decision.title}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Review date: {formatDate(decision.reviewDate)}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-5 md:p-7">
        <SectionTitle eyebrow="Outcome" title="Review Decision" />
        {selectedReview ? (
          <>
            <div className="mt-4 rounded-2xl bg-[var(--surface)] p-4">
              <p className="font-medium">{selectedReview.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{selectedReview.expectedOutcome}</p>
              <p className="mt-3 text-sm text-[var(--muted)]">Original confidence: {selectedReview.confidencePercentage}%</p>
            </div>
            <form onSubmit={onSave} className="mt-5 grid gap-5">
              <Field label="Actual outcome">
                <select
                  aria-label="Actual outcome"
                  value={reviewInput.actualOutcomeStatus}
                  onChange={(event) =>
                    onInput({ ...reviewInput, actualOutcomeStatus: event.target.value as ActualOutcomeStatus })
                  }
                  className="min-h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--input-bg)] px-4 text-sm text-[var(--fg)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
                >
                  <option value="happened">Happened</option>
                  <option value="partial">Partial</option>
                  <option value="did_not_happen">Did not happen</option>
                </select>
              </Field>
              <Field label={`Satisfaction: ${reviewInput.satisfactionScore}/10`}>
                <input
                  aria-label={`Satisfaction: ${reviewInput.satisfactionScore}/10`}
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={reviewInput.satisfactionScore}
                  onChange={(event) => onInput({ ...reviewInput, satisfactionScore: Number(event.target.value) })}
                  className="h-11 w-full accent-[var(--accent)]"
                />
              </Field>
              <Field label="Lesson learned">
                <textarea
                  aria-label="Lesson learned"
                  className="min-h-28 w-full rounded-2xl border border-[var(--border)] bg-[var(--input-bg)] px-4 py-3 text-sm leading-relaxed text-[var(--fg)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
                  value={reviewInput.lessonLearned}
                  onChange={(event) => onInput({ ...reviewInput, lessonLearned: event.target.value })}
                  placeholder="What changed between the prediction and the outcome?"
                />
              </Field>
              <Button type="submit" className="min-h-11 w-full md:w-fit">
                <CheckCircle2 aria-hidden="true" size={17} />
                Save review
              </Button>
            </form>
          </>
        ) : null}
      </Card>
    </div>
  );
}

function AnalyticsView({ dashboard, decisions }: { dashboard: ReturnType<typeof buildDashboardModel>; decisions: DecisionRecord[] }) {
  const analytics = dashboard.analytics;

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Observed accuracy" value={formatPercent(analytics.observedAccuracy)} detail="Outcome average from reviewed decisions" />
        <SummaryCard label="Average confidence" value={formatPercent(analytics.averageConfidence)} detail="Mean predicted probability" />
        <SummaryCard label="Brier Score" value={formatScore(analytics.brierScore, 3)} detail="Mean squared prediction error" />
        <SummaryCard label="Health score" value={formatScore(analytics.decisionHealthScore, 1)} detail="Calibration, reviews, lessons, category spread" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5 md:p-6">
          <SectionTitle eyebrow="Calibration" title="Confidence buckets" />
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.confidenceBuckets}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="averageConfidence" name="Average confidence" fill="var(--accent)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="observedAccuracy" name="Observed accuracy" fill="var(--success)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <TextLegend items={analytics.confidenceBuckets.map((bucket) => `${bucket.label}: ${bucket.count} reviewed`)} />
        </Card>

        <Card className="p-5 md:p-6">
          <SectionTitle eyebrow="Categories" title="Accuracy by category" />
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.accuracyByCategory}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="category" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="observedAccuracy" name="Observed accuracy" fill="var(--success)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <TextLegend items={analytics.accuracyByCategory.map((item) => `${item.category}: ${formatPercent(item.observedAccuracy)}`)} />
        </Card>
      </div>

      <Card className="p-5 md:p-6">
        <SectionTitle eyebrow="Methodology" title="How scoring works" />
        <div className="mt-4 grid gap-3 text-sm leading-relaxed text-[var(--muted)] md:grid-cols-2">
          <p>Brier Score is the average squared difference between confidence probability and reviewed outcome value. Happened is 1, partial is 0.5, and did not happen is 0.</p>
          <p>Decision health is a 0-100 composite from calibration quality, review completion, useful lessons, and category spread. It is an educational signal, not advice.</p>
        </div>
        <p className="mt-4 text-sm text-[var(--muted)]">Reviewed decisions in this browser: {decisions.filter((decision) => decision.status === "reviewed").length}</p>
      </Card>
    </div>
  );
}

function SettingsView({
  count,
  importInputRef,
  onExport,
  onImport,
  onLoadDemo,
  onReset,
}: {
  count: number;
  importInputRef: React.RefObject<HTMLInputElement | null>;
  onExport: () => void;
  onImport: (event: ChangeEvent<HTMLInputElement>) => void;
  onLoadDemo: () => Promise<void>;
  onReset: () => Promise<void>;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
      <Card className="p-5 md:p-6">
        <SectionTitle eyebrow="Backup" title="Export and import JSON" />
        <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-[var(--muted)]">
          Backups are generated in this browser. Import replaces the local dataset with the selected DecisionOS JSON file.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button type="button" onClick={onExport} disabled={count === 0} className="min-h-11">
            <Download aria-hidden="true" size={17} />
            Export JSON
          </Button>
          <Button type="button" variant="secondary" onClick={() => importInputRef.current?.click()} className="min-h-11">
            <FileUp aria-hidden="true" size={17} />
            Import JSON
          </Button>
          <input ref={importInputRef} className="hidden" type="file" accept="application/json,.json" onChange={onImport} />
        </div>
      </Card>

      <Card className="p-5 md:p-6">
        <SectionTitle eyebrow="Local data" title="Demo and reset" />
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          Demo data is clearly labeled in code and stored only after you load it. Reset clears local DecisionOS records in this browser.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Button type="button" variant="secondary" onClick={onLoadDemo} className="min-h-11">
            <Database aria-hidden="true" size={17} />
            Load demo data
          </Button>
          <Button type="button" variant="danger" onClick={onReset} className="min-h-11">
            <RotateCcw aria-hidden="true" size={17} />
            Reset local data
          </Button>
        </div>
      </Card>

      <Card className="p-5 md:col-span-2 md:p-6">
        <SectionTitle eyebrow="Limits" title="Privacy model and boundaries" />
        <div className="mt-4 grid gap-3 text-sm leading-relaxed text-[var(--muted)] md:grid-cols-3">
          <p>No API, backend, authentication, Supabase, Firebase, cloud database, paid API, analytics tracking, or OpenAI API is used in production.</p>
          <p>Data is stored in IndexedDB on the current browser and device. Clearing site data or switching browsers removes access unless you exported JSON.</p>
          <p>Scores describe calibration patterns from reviewed decisions. They are not instructions, predictions, or professional advice.</p>
        </div>
      </Card>
    </div>
  );
}

function SummaryCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
      <p className="mt-3 font-mono text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{detail}</p>
    </Card>
  );
}

function MetricStrip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-[var(--surface)] px-4 py-3">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <span className="font-mono text-lg font-semibold">{value}</span>
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{eyebrow}</p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h3>
    </div>
  );
}

function Field({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {helper ? <span className="text-xs leading-relaxed text-[var(--muted)]">{helper}</span> : null}
    </label>
  );
}

function ErrorList({ errors }: { errors: string[] }) {
  return (
    <div role="alert" className="mb-4 rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger-text)]">
      <p className="font-medium">Check these fields:</p>
      <ul className="mt-2 list-disc pl-5">
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  );
}

function EmptyState({ title, body, actionLabel, onAction }: { title: string; body: string; actionLabel: string; onAction: () => void }) {
  return (
    <Card className="p-8 md:p-10">
      <div className="max-w-[65ch]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Empty state</p>
        <h3 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{body}</p>
        <Button type="button" onClick={onAction} className="mt-5 min-h-11">
          {actionLabel}
        </Button>
      </div>
    </Card>
  );
}

function SkeletonView() {
  return (
    <div aria-busy="true" aria-live="polite" className="grid gap-4 md:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-36 animate-pulse rounded-[24px] bg-[var(--surface)]" />
      ))}
      <span className="sr-only">Preparing local dashboard data.</span>
    </div>
  );
}

function DecisionRow({
  decision,
  actionLabel,
  onAction,
  onRemove,
}: {
  decision: DecisionRecord;
  actionLabel: string;
  onAction: () => void;
  onRemove: (id: string) => Promise<void>;
}) {
  return (
    <div className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <p className="font-medium">{decision.title}</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {decision.category} / {formatPercent(decision.confidencePercentage, 0)} confidence / review {formatDate(decision.reviewDate)}
        </p>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
        <Button type="button" variant="danger" size="icon" aria-label={`Delete ${decision.title}`} onClick={() => onRemove(decision.id)}>
          <Trash2 aria-hidden="true" size={17} />
        </Button>
      </div>
    </div>
  );
}

function TextLegend({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="mt-3 grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-2">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
