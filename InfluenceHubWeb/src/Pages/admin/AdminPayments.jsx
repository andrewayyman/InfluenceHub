import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DollarSign, Search, TrendingUp, Users, X, ExternalLink, Download, FileText, CreditCard, Receipt, Banknote, ShieldCheck } from "lucide-react";
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
  getPaymentDetails
} from "../../services/api/adminService";
import { isAbortError, resolveApiUrl } from "../../services/api/client";
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

const PaymentDetailsModal = ({ paymentId, onClose }) => {
  const { token } = useAuth();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!paymentId || !token) return;
    const controller = new AbortController();
    setLoading(true);
    getPaymentDetails(token, paymentId, controller.signal)
      .then(data => {
        setPayment(data);
        setLoading(false);
      })
      .catch(err => {
        if (!isAbortError(err)) {
          setError(err.message || "Unable to load payment details.");
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [paymentId, token]);

  if (!paymentId) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col motion-safe:animate-[fadeIn_0.2s_ease-out]">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[color:var(--ih-brand-light)] flex items-center justify-center text-[color:var(--ih-brand)]">
              <Receipt size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold ih-text-primary">Payment Details</h2>
              <p className="text-sm ih-text-muted">ID: {payment?.id || paymentId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <LoadingState label="Loading payment details..." />
          ) : error ? (
            <ErrorState message={error} />
          ) : payment ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2"><FileText size={16}/> Basic Information</h3>
                  <div className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-100">
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-sm text-slate-500">Campaign</span>
                      <span className="text-sm font-medium ih-text-primary text-right">{payment.campaignTitle}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-sm text-slate-500">Brand</span>
                      <span className="text-sm font-medium ih-text-primary text-right">{payment.brandName}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-sm text-slate-500">Influencer</span>
                      <span className="text-sm font-medium ih-text-primary text-right">{payment.influencerName}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-sm text-slate-500">Date/Time</span>
                      <span className="text-sm font-medium ih-text-primary text-right">{formatDate(payment.paidAt || payment.createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-sm text-slate-500">Status</span>
                      <StatusBadge tone={STATUS_TONES[payment.status] || "neutral"}>{payment.status}</StatusBadge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2"><CreditCard size={16}/> Payment Breakdown</h3>
                  <div className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-100">
                     <div className="flex justify-between items-center gap-4">
                      <span className="text-sm text-slate-500">Gross Amount</span>
                      <span className="text-sm font-medium ih-text-primary text-right">{formatCurrency(payment.amount)}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-sm text-slate-500">Platform Commission ({payment.commissionPercentage}%)</span>
                      <span className="text-sm font-medium text-red-600 text-right">-{formatCurrency(payment.platformCommission)}</span>
                    </div>
                    <div className="pt-3 border-t border-slate-200 flex justify-between items-center gap-4">
                      <span className="text-sm font-semibold ih-text-primary">Net Influencer Earnings</span>
                      <span className="text-lg font-bold text-green-600 text-right">{formatCurrency(payment.netAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2"><Banknote size={16}/> Transfer Details</h3>
                  <div className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-100">
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-sm text-slate-500">Payment Method</span>
                      <span className="text-sm font-medium ih-text-primary text-right">{payment.paymentMethod || "N/A"}</span>
                    </div>
                    {payment.brandNotes && (
                      <div className="flex flex-col gap-1 mt-2">
                        <span className="text-sm text-slate-500">Notes/Memo</span>
                        <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200">{payment.brandNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2"><ShieldCheck size={16}/> Payment Proof</h3>
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    {payment.proofUrl ? (
                      <div className="flex flex-col gap-4">
                        <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center min-h-[160px]">
                          <img src={resolveApiUrl(payment.proofUrl)} alt="Payment Proof" className="max-w-full max-h-[250px] object-contain" />
                        </div>
                        <div className="flex gap-3">
                          <a href={resolveApiUrl(payment.proofUrl)} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 transition-colors rounded-xl text-sm font-bold text-slate-700 shadow-sm">
                            <ExternalLink size={16} /> Open
                          </a>
                          <a href={resolveApiUrl(payment.proofUrl)} download className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 transition-colors rounded-xl text-sm font-bold text-white shadow-sm">
                            <Download size={16} /> Download
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-3">
                        <FileText size={32} />
                        <p className="text-sm">No payment proof uploaded yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
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

  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

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
      {selectedPaymentId && (
        <PaymentDetailsModal paymentId={selectedPaymentId} onClose={() => setSelectedPaymentId(null)} />
      )}

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
          <div className="mt-4 overflow-x-auto rounded-[1.35rem] border border-slate-200 shadow-sm">
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
                  <tr key={payment.id} className="bg-white hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => setSelectedPaymentId(payment.id)}>
                    <td className="px-4 py-4 font-medium ih-text-primary whitespace-nowrap group-hover:text-[color:var(--ih-brand)] transition-colors">
                      {payment.influencerName || "-"}
                    </td>
                    <td className="px-4 py-4 ih-text-secondary max-w-[200px] truncate" title={payment.campaignTitle}>
                      {payment.campaignTitle || "-"}
                    </td>
                    <td className="px-4 py-4 text-right ih-text-primary whitespace-nowrap">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-4 py-4 text-right ih-text-secondary whitespace-nowrap">
                      {payment.commissionPercentage != null ? `${payment.commissionPercentage}%` : "-"}
                    </td>
                    <td className="px-4 py-4 text-right ih-text-secondary whitespace-nowrap">
                      {formatCurrency(payment.platformCommission)}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold ih-text-primary whitespace-nowrap">
                      {formatCurrency(payment.netAmount)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge tone={STATUS_TONES[payment.status] ?? "info"}>
                        {payment.status}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-4 ih-text-muted whitespace-nowrap">
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
