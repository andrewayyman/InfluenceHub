import React, { useCallback, useEffect, useState } from "react";
import { History, Percent, Save } from "lucide-react";
import {
  AdminPage,
  AdminPanel,
  AdminPanelHeader,
  EmptyState,
  ErrorState,
  LoadingState,
  StatusBadge,
} from "../../Components/AdminShared";
import { useAuth } from "../../hooks/useAuth";
import {
  getCommission,
  getCommissionHistory,
  setCommission,
} from "../../services/api/adminService";
import { isAbortError } from "../../services/api/client";
import { formatDate, formatDateTime } from "../../utils/formatters";

const AdminCommission = () => {
  const { token } = useAuth();

  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingCurrent, setLoadingCurrent] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [errorCurrent, setErrorCurrent] = useState("");
  const [errorHistory, setErrorHistory] = useState("");

  const [formPercentage, setFormPercentage] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const loadCurrent = useCallback(async (signal) => {
    if (!token) {
      setLoadingCurrent(false);
      return;
    }

    setLoadingCurrent(true);
    setErrorCurrent("");

    try {
      const data = await getCommission(token, signal);
      setCurrent(data);
    } catch (err) {
      if (isAbortError(err) || signal?.aborted) return;
      setErrorCurrent(err.message || "Unable to load current commission.");
    } finally {
      if (!signal?.aborted) setLoadingCurrent(false);
    }
  }, [token]);

  const loadHistory = useCallback(async (signal) => {
    if (!token) {
      setLoadingHistory(false);
      return;
    }

    setLoadingHistory(true);
    setErrorHistory("");

    try {
      const data = await getCommissionHistory(token, signal);
      setHistory(data);
    } catch (err) {
      if (isAbortError(err) || signal?.aborted) return;
      setErrorHistory(err.message || "Unable to load commission history.");
    } finally {
      if (!signal?.aborted) setLoadingHistory(false);
    }
  }, [token]);

  useEffect(() => {
    const controller = new AbortController();
    loadCurrent(controller.signal);
    return () => controller.abort();
  }, [loadCurrent]);

  useEffect(() => {
    const controller = new AbortController();
    loadHistory(controller.signal);
    return () => controller.abort();
  }, [loadHistory]);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaveError("");
    setSaveSuccess("");

    const pct = parseFloat(formPercentage);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      setSaveError("Percentage must be a number between 0 and 100.");
      return;
    }

    setSaving(true);
    try {
      await setCommission(token, {
        percentage: pct,
        description: formDescription.trim() || undefined,
      });
      setSaveSuccess("Commission updated successfully.");
      setFormPercentage("");
      setFormDescription("");
      const controller = new AbortController();
      await loadCurrent(controller.signal);
      await loadHistory(controller.signal);
    } catch (err) {
      setSaveError(err.message || "Failed to update commission.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPage>
      {/* Current Commission */}
      <AdminPanel>
        <AdminPanelHeader
          kicker="Platform rate"
          title="Current Commission"
          description="The active commission percentage applied to all payments processed on the platform."
        />

        {errorCurrent ? (
          <ErrorState message={errorCurrent} onRetry={() => loadCurrent()} />
        ) : null}

        {loadingCurrent ? <LoadingState label="Loading commission..." /> : null}

        {!loadingCurrent && !errorCurrent && current ? (
          <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="col-span-full lg:col-span-1 flex flex-col items-center justify-center rounded-[1.5rem] border border-slate-200 bg-slate-50 px-6 py-8">
              <div className="flex items-center gap-2">
                <Percent size={28} className="ih-text-muted" aria-hidden="true" />
                <span className="text-5xl font-bold ih-text-primary">{current.percentage}</span>
              </div>
              <p className="mt-2 text-sm ih-text-muted">Commission rate</p>
            </div>

            <div className="col-span-full lg:col-span-3 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-5">
                <p className="ih-text-subtle text-xs uppercase tracking-[0.18em]">Description</p>
                <p className="mt-2 text-sm font-medium ih-text-primary">{current.description || "-"}</p>
              </div>
              <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-5">
                <p className="ih-text-subtle text-xs uppercase tracking-[0.18em]">Effective from</p>
                <p className="mt-2 text-sm font-medium ih-text-primary">{formatDate(current.effectiveFrom)}</p>
              </div>
              <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-5">
                <p className="ih-text-subtle text-xs uppercase tracking-[0.18em]">Last updated by</p>
                <p className="mt-2 text-sm font-medium ih-text-primary break-all">{current.updatedByEmail || "-"}</p>
                <p className="mt-1 text-xs ih-text-muted">{formatDateTime(current.updatedAt)}</p>
              </div>
            </div>
          </div>
        ) : null}

        {!loadingCurrent && !errorCurrent && !current ? (
          <EmptyState title="No commission set" description="Use the form below to configure the platform commission rate." />
        ) : null}
      </AdminPanel>

      {/* Set Commission */}
      <AdminPanel>
        <AdminPanelHeader
          kicker="Configuration"
          title="Set Commission"
          description="Update the platform commission rate. Changes take effect immediately for all future payments."
        />

        <form onSubmit={handleSave} className="mt-4 max-w-lg space-y-4">
          <div>
            <label htmlFor="commission-percentage" className="block text-sm font-medium ih-text-primary mb-1.5">
              Percentage (0–100)
            </label>
            <div className="relative">
              <input
                id="commission-percentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formPercentage}
                onChange={(e) => setFormPercentage(e.target.value)}
                placeholder="e.g. 15"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm ih-text-primary placeholder:ih-text-muted focus:border-[color:var(--ih-border-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ih-ring)]"
              />
              <Percent size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ih-text-muted" aria-hidden="true" />
            </div>
          </div>

          <div>
            <label htmlFor="commission-description" className="block text-sm font-medium ih-text-primary mb-1.5">
              Description <span className="ih-text-muted font-normal">(optional)</span>
            </label>
            <input
              id="commission-description"
              type="text"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="e.g. Q3 2026 platform rate"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm ih-text-primary placeholder:ih-text-muted focus:border-[color:var(--ih-border-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ih-ring)]"
            />
          </div>

          {saveError ? (
            <p role="alert" className="text-sm text-red-600">{saveError}</p>
          ) : null}

          {saveSuccess ? (
            <span role="status" aria-live="polite">
              <StatusBadge tone="success">{saveSuccess}</StatusBadge>
            </span>
          ) : null}

          <button
            type="submit"
            disabled={saving}
            className="ih-button-primary ih-focus-ring inline-flex items-center gap-2 px-5 py-3 text-sm"
          >
            <Save size={16} aria-hidden="true" />
            {saving ? "Saving..." : "Save Commission"}
          </button>
        </form>
      </AdminPanel>

      {/* Commission History */}
      <AdminPanel>
        <AdminPanelHeader
          kicker="Audit trail"
          title="Commission History"
          description="A record of all past commission rate changes on this platform."
        />

        {errorHistory ? (
          <ErrorState message={errorHistory} onRetry={() => loadHistory()} />
        ) : null}

        {loadingHistory ? <LoadingState label="Loading history..." /> : null}

        {!loadingHistory && !errorHistory && history.length === 0 ? (
          <EmptyState
            title="No history yet"
            description="Commission changes will be logged here once the rate is updated."
          />
        ) : null}

        {!loadingHistory && !errorHistory && history.length > 0 ? (
          <div className="mt-2 overflow-x-auto rounded-[1.35rem] border border-slate-200">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] ih-text-muted">Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] ih-text-muted">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] ih-text-muted">Effective From</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] ih-text-muted">Updated By</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] ih-text-muted">Updated At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((entry) => (
                  <tr key={entry.id} className="bg-white hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold ih-text-primary">
                      <span className="inline-flex items-center gap-1">
                        <History size={14} className="ih-text-muted" aria-hidden="true" />
                        {entry.percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3 ih-text-secondary">{entry.description || "-"}</td>
                    <td className="px-4 py-3 ih-text-secondary">{formatDate(entry.effectiveFrom)}</td>
                    <td className="px-4 py-3 ih-text-secondary break-all">{entry.updatedByEmail || "-"}</td>
                    <td className="px-4 py-3 ih-text-muted">{formatDateTime(entry.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </AdminPanel>
    </AdminPage>
  );
};

export default AdminCommission;
