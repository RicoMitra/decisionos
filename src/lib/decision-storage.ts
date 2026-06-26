import { isValidDecisionRecord } from "@/lib/decision-engine";
import type { DecisionExportPayload, DecisionRecord, DecisionRepository, Result } from "@/lib/types";

export const DECISIONOS_DB_NAME = "decisionos-local";
export const DECISIONOS_STORE_NAME = "decisions";
export const DECISIONOS_DB_VERSION = 1;
export const DECISIONOS_EXPORT_VERSION = 1;

let memoryRecords = new Map<string, DecisionRecord>();

export function createExportPayload(decisions: DecisionRecord[], exportedAt = new Date().toISOString()): DecisionExportPayload {
  return {
    app: "DecisionOS",
    version: DECISIONOS_EXPORT_VERSION,
    exportedAt,
    decisions,
  };
}

export function parseImportPayload(raw: string): Result<DecisionExportPayload> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, errors: ["Import file must be valid JSON."] };
  }

  if (!parsed || typeof parsed !== "object") {
    return { ok: false, errors: ["Import file must contain a DecisionOS backup object."] };
  }

  const payload = parsed as Partial<DecisionExportPayload>;

  if (payload.app !== "DecisionOS" || payload.version !== DECISIONOS_EXPORT_VERSION) {
    return { ok: false, errors: ["Unsupported DecisionOS export version."] };
  }

  if (typeof payload.exportedAt !== "string") {
    return { ok: false, errors: ["Export timestamp is missing."] };
  }

  if (!Array.isArray(payload.decisions)) {
    return { ok: false, errors: ["Import file must include a decisions array."] };
  }

  const errors: string[] = [];
  payload.decisions.forEach((decision, index) => {
    const recordErrors = validateDecisionForImport(decision);
    errors.push(...recordErrors.map((error) => `Decision ${index + 1}: ${error}`));
  });

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      app: "DecisionOS",
      version: DECISIONOS_EXPORT_VERSION,
      exportedAt: payload.exportedAt,
      decisions: payload.decisions,
    },
  };
}

export function createDecisionRepository(): DecisionRepository {
  if (typeof indexedDB === "undefined") {
    return createMemoryDecisionRepository();
  }

  return createIndexedDbDecisionRepository();
}

function createMemoryDecisionRepository(): DecisionRepository {
  return {
    async list() {
      return Array.from(memoryRecords.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async save(decision) {
      memoryRecords.set(decision.id, decision);
    },
    async remove(id) {
      memoryRecords.delete(id);
    },
    async replaceAll(decisions) {
      memoryRecords = new Map(decisions.map((decision) => [decision.id, decision]));
    },
    async reset() {
      memoryRecords.clear();
    },
  };
}

function createIndexedDbDecisionRepository(): DecisionRepository {
  return {
    async list() {
      const db = await openDatabase();
      const records = await requestToPromise<DecisionRecord[]>(db.transaction(DECISIONOS_STORE_NAME, "readonly").objectStore(DECISIONOS_STORE_NAME).getAll());
      db.close();
      return records.filter(isValidDecisionRecord).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async save(decision) {
      const db = await openDatabase();
      await requestToPromise(db.transaction(DECISIONOS_STORE_NAME, "readwrite").objectStore(DECISIONOS_STORE_NAME).put(decision));
      db.close();
    },
    async remove(id) {
      const db = await openDatabase();
      await requestToPromise(db.transaction(DECISIONOS_STORE_NAME, "readwrite").objectStore(DECISIONOS_STORE_NAME).delete(id));
      db.close();
    },
    async replaceAll(decisions) {
      const db = await openDatabase();
      const transaction = db.transaction(DECISIONOS_STORE_NAME, "readwrite");
      const store = transaction.objectStore(DECISIONOS_STORE_NAME);
      await requestToPromise(store.clear());
      await Promise.all(decisions.map((decision) => requestToPromise(store.put(decision))));
      await transactionToPromise(transaction);
      db.close();
    },
    async reset() {
      const db = await openDatabase();
      await requestToPromise(db.transaction(DECISIONOS_STORE_NAME, "readwrite").objectStore(DECISIONOS_STORE_NAME).clear());
      db.close();
    },
  };
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DECISIONOS_DB_NAME, DECISIONOS_DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DECISIONOS_STORE_NAME)) {
        db.createObjectStore(DECISIONOS_STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open DecisionOS storage."));
  });
}

function requestToPromise<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("DecisionOS storage request failed."));
  });
}

function transactionToPromise(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("DecisionOS storage transaction failed."));
    transaction.onabort = () => reject(transaction.error ?? new Error("DecisionOS storage transaction was aborted."));
  });
}

function validateDecisionForImport(value: unknown) {
  const errors: string[] = [];
  if (!value || typeof value !== "object") return ["Decision record must be an object."];
  const decision = value as Partial<DecisionRecord>;

  if (typeof decision.id !== "string" || !decision.id.trim()) errors.push("ID is required.");
  if (typeof decision.title !== "string" || !decision.title.trim()) errors.push("Title is required.");
  if (typeof decision.category !== "string" || !decision.category.trim()) errors.push("Category is required.");
  if (typeof decision.confidencePercentage !== "number" || decision.confidencePercentage < 0 || decision.confidencePercentage > 100) {
    errors.push("Confidence must be between 0 and 100.");
  }
  if (!isValidDecisionRecord(value) && errors.length === 0) errors.push("Decision record is incomplete or inconsistent.");

  return errors;
}
