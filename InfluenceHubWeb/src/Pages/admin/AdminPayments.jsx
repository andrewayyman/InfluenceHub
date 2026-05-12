import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DollarSign, Search, TrendingUp, Users } from "lucide-react";
import {
  AdminPage,
  AdminPanel,
  AdminPanelHeader,
  AdminMetricCard,
  EmptyState,
  ErrorState,
  FilterTabs,
  LoadingState,
  StatusBadge,
} from "../../Components/AdminShared";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import {
  getPayments,
  getPaymentSummary,
} from "../../services/api/adminService";
import { isAbortError } from "../../services/api/client";
import { formatCurrency, formatDate } from "../../utils/formatters";

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Completed", value: "Completed" },
  { label: "Pending", value: "Pending" },
  { label: "Failed", value: "Failed" },
];

const STATUS_TONES = {
  Completed: "success",
  Pending: "warning",
  Failed: "danger",
};

const AdminPayments = () => {
  const { token } = useAuth();

  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [errorPayments, setErrorPayments] = useState("");
  const [errorSummary, setErrorSummary] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const debouncedSearch = useDebouncedValue(search, 250);

  const loadSummary = useCallback(async (signal) => {
    if (!token) {
      setLoadingSummary(false);
      return;
    }

    setLoadingSummary(true);
    setErrorSummary("");

    try {
      const data = await getPaymentSummary(token, signal);
      setSummary(data);
    } catch (err) {
      if (isAbortError(err) || signal?.aborted) return;
      setErrorSummary(err.message || "Unable to load payment summary.");
    } finally {
      if (!signal?.aborted) setLoadingSummary(false);
    }
  }, [token]);

  const loadPayments = useCallback(async (signal) => {
    if (!token) {
      setLoadingPayments(false);
      return;
    }

    setLoadingPayments(true);
    setErrorPayments("");

    try {
      const data = await getPayments(
        token,
        {
          status: statusFilter || undefined,
          search: debouncedSearch || undefined,
        },
        signal,
      );
      setPayments(data);
    } catch (err) {
      if (isAbortError(err) || signal?.aborted) return;
      setErrorPayments(err.message || "Unable to load payments.");
    } finally {
      if (!signal?.aborted) setLoadingPayments(false);
    }
  }, [token, debouncedSearch, statusFilter]);

  useEffect(() => {
    const controller = new AbortController();
    loadSummary(controller.signal);
    return () => controller.abort();
  }, [loadSummary]);

  useEffect(() => {
    const controller = new AbortController();
    loadPayments(controller.signal);
    return () => controller.abort();
  }, [loadPayments]);

  const metricCards = useMemo(() => {
    if (!summary) return [];
    return [
      {
        label: "Total Payments",
        value: summary.totalPayments ?? 0,
        icon: Users,
        tone: "info",
      },
      {
        label: "Platform Commission",
        value: formatCurrency(summary.totalCommission ?? 0),
        icon: TrendingUp,
        tone: "warning",
      },
      {
        label: "Total Net Paid",
        value: formatCurrency(summary.totalNetPaid ?? 0),
        icon: DollarSign,
        tone: "success",
      },
    ];
  }, [summary]);

  return (
    <AdminPage>
      {/* Summary */}
      <AdminPanel>
        <AdminPanelHeader
          kicker="Financial overview"
          title="Payments"
          description="Monitor all transactions, platform commissions, and net payouts to influencers."
        />

        {errorSummary ? (
          <ErrorState message={errorSummary} onRetry={() => loadSummary()} />
        ) : null}

        {loadingSummary ? <LoadingState label="Loading summary..." /> : null}

        {!loadingSummary && !errorSummary && summary ? (
          <div className="mt-2 grid gap-4 sm:grid-cols-3">
            {metricCards.map((card) => (
              <AdminMetricCard
                key={card.label}
                label={card.label}
                value={card.value}
                icon={card.icon}
                tone={card.tone}
              />
            ))}
          </div>
        ) : null}
      </AdminPanel>

      {/* Payments Table */}
      <AdminPanel>
        <AdminPanelHeader
          kicker="Transaction log"
          title="All Payments"
          description="Search and filter payments by influencer, brand, campaign name, or status."
        />

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ih-text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by influencer, brand, or campaign…"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-sm ih-text-primary placeholder:ih-text-muted focus:border-[color:var(--ih-border-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ih-ring)]"
            />
          </div>
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="ih-button-secondary ih-focus-ring px-4 py-3 text-sm"
            >
              Clear
            </button>
          ) : null}
        </div>

        <FilterTabs
          label="Filter by payment status"
          items={STATUS_OPTIONS}
          value={statusFilter}
          onSelect={setStatusFilter}
        />

        {errorPayments ? (
          <ErrorState message={errorPayments} onRetry={() => loadPayments()} />
        ) : null}

        {loadingPayments ? <LoadingState label="Loading payments..." /> : null}

        {!loadingPayments && !errorPayments && payments.length === 0 ? (
          <EmptyState
            title="No payments found"
            description="Try adjusting your search or status filter to find the transaction you're looking for."
          />
        ) : null}

        {!loadingPayments && !errorPayments && payments.length > 0 ? (
          <div className="mt-4 overflow-x-auto rounded-[1.35rem] border border-slate-200">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] ih-text-muted">Influencer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] ih-text-muted">Campaign</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.15em] ih-text-muted">Gross</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.15em] ih-text-muted">Comm %</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.15em] ih-text-muted">Platform Cut</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.15em] ih-text-muted">Net Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] ih-text-muted">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] ih-text-muted">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((payment) => (
                  <tr key={payment.id} className="bg-white hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium ih-text-primary whitespace-nowrap">
                      {payment.influencerName || "-"}
                    </td>
                    <td className="px-4 py-3 ih-text-secondary max-w-[200px] truncate" title={payment.campaignTitle}>
                      {payment.campaignTitle || "-"}
                    </td>
                    <td className="px-4 py-3 text-right ih-text-primary whitespace-nowrap">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-4 py-3 text-right ih-text-secondary whitespace-nowrap">
                      {payment.commissionPercentage != null ? `${payment.commissionPercentage}%` : "-"}
                    </td>
                    <td className="px-4 py-3 text-right ih-text-secondary whitespace-nowrap">
                      {formatCurrency(payment.platformCommission)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold ih-text-primary whitespace-nowrap">
                      {formatCurrency(payment.netAmount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge tone={STATUS_TONES[payment.status] ?? "info"}>
                        {payment.status}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 ih-text-muted whitespace-nowrap">
                      {formatDate(payment.paidAt || payment.createdAt)}
                    </td>
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

export default AdminPayments;
