"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createDecisionRepository } from "@/lib/decision-storage";
import type { DecisionRecord } from "@/lib/types";

const repository = createDecisionRepository();

export function useDecisions() {
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      setDecisions(await repository.list());
    } catch {
      setError("Could not read local DecisionOS storage. Refresh the page and try again.");
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    let alive = true;

    repository
      .list()
      .then((records) => {
        if (alive) setDecisions(records);
      })
      .catch(() => {
        if (alive) setError("Could not read local DecisionOS storage. Refresh the page and try again.");
      })
      .finally(() => {
        if (alive) setIsReady(true);
      });

    return () => {
      alive = false;
    };
  }, []);

  const actions = useMemo(
    () => ({
      async save(decision: DecisionRecord) {
        await repository.save(decision);
        await load();
      },
      async remove(id: string) {
        await repository.remove(id);
        await load();
      },
      async replaceAll(nextDecisions: DecisionRecord[]) {
        await repository.replaceAll(nextDecisions);
        await load();
      },
      async reset() {
        await repository.reset();
        await load();
      },
    }),
    [load],
  );

  return {
    decisions,
    isReady,
    error,
    ...actions,
  };
}
