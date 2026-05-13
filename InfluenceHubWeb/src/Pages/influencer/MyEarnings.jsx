import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DollarSign, TrendingUp, Wallet, Clock, CheckCircle, ExternalLink, Download, FileText, CreditCard, Receipt, Banknote, ShieldCheck, X, Activity, Award, ArrowUpRight } from "lucide-react";
import { AdminPage as DashboardPage, AdminPanel as Panel, ErrorState, LoadingState, StatusBadge } from "../../Components/AdminShared";
import { useAuth } from "../../hooks/useAuth";
import { getMyPayments, getPaymentDetails } from "../../services/api/paymentService";
import { isAbortError, resolveApiUrl } from "../../services/api/client";
import { formatCurrency, formatDate } from "../../utils/formatters";

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
                      <span className="text-sm font-medium ih-text-primary text-right">You ({payment.influencerName})</span>
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
                      <span className="text-sm font-semibold ih-text-primary">Net Earnings</span>
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
                      <span className="text-sm font-medium ih-text-primary text-right">{payment.paymentMethod || "Pending"}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-sm text-slate-500">Transaction Ref</span>
                      <span className="text-sm font-medium ih-text-primary font-mono text-right">{payment.transactionReference || "Pending"}</span>
                    </div>
                    {payment.influencerPaymentInfo && (
                      <div className="flex flex-col gap-1 mt-2">
                        <span className="text-sm text-slate-500">Your Receiving Account</span>
                        <div className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200 break-words">
                          {payment.influencerPaymentInfo.bankAccountNumber ? `Bank: ${payment.influencerPaymentInfo.bankName} - ${payment.influencerPaymentInfo.bankAccountNumber.slice(-4).padStart(payment.influencerPaymentInfo.bankAccountNumber.length, "*")}` : ""}
                          {payment.influencerPaymentInfo.walletNumber ? `Wallet: ${payment.influencerPaymentInfo.walletProvider} - ${payment.influencerPaymentInfo.walletNumber.slice(-4).padStart(payment.influencerPaymentInfo.walletNumber.length, "*")}` : ""}
                          {payment.influencerPaymentInfo.instapayPhone ? `Instapay: ${payment.influencerPaymentInfo.instapayPhone.slice(-4).padStart(payment.influencerPaymentInfo.instapayPhone.length, "*")}` : ""}
                          {!payment.influencerPaymentInfo.bankAccountNumber && !payment.influencerPaymentInfo.walletNumber && !payment.influencerPaymentInfo.instapayPhone && "Details not provided"}
                        </div>
                      </div>
                    )}
                    {payment.brandNotes && (
                      <div className="flex flex-col gap-1 mt-2">
                        <span className="text-sm text-slate-500">Note from Brand</span>
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
                          <a href={resolveApiUrl(payment.proofUrl)} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 transition-colors rounded-xl text-sm font-medium ih-text-primary shadow-sm">
                            <ExternalLink size={16} /> Open
                          </a>
                          <a href={resolveApiUrl(payment.proofUrl)} download className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[color:var(--ih-brand)] hover:bg-[color:var(--ih-brand-dark)] transition-colors rounded-xl text-sm font-medium text-white shadow-sm">
                            <Download size={16} /> Download
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-3">
                        <FileText size={32} />
                        <p className="text-sm text-center">Payment proof has not been<br/>uploaded by the brand yet.</p>
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

const MyEarnings = () => {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  const loadPayments = useCallback(async (signal) => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await getMyPayments(token, signal);
      if (!signal.aborted) setPayments(data || []);
    } catch (err) {
      if (!isAbortError(err) && !signal.aborted) setError(err.message || "Unable to load earnings.");
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const controller = new AbortController();
    loadPayments(controller.signal);
    return () => controller.abort();
  }, [loadPayments]);

  const metrics = useMemo(() => {
    const completedPayments = payments.filter(p => p.status === "Completed");
    const pendingPayments = payments.filter(p => p.status !== "Completed" && p.status !== "Failed");
    
    const totalEarnings = completedPayments.reduce((sum, p) => sum + p.netAmount, 0);
    const totalPending = pendingPayments.reduce((sum, p) => sum + p.netAmount, 0);
    const avgEarnings = completedPayments.length ? totalEarnings / completedPayments.length : 0;
    
    // Calculate Monthly Earnings
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyEarnings = completedPayments
      .filter(p => {
        const d = new Date(p.paidAt || p.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + p.netAmount, 0);

    return {
      totalEarnings,
      totalPending,
      avgEarnings,
      monthlyEarnings,
      completedCount: completedPayments.length
    };
  }, [payments]);

  const topCampaigns = useMemo(() => {
    return [...payments]
      .filter(p => p.status === "Completed")
      .sort((a, b) => b.netAmount - a.netAmount)
      .slice(0, 3);
  }, [payments]);

  if (loading && payments.length === 0) {
    return <DashboardPage><LoadingState label="Loading your earnings dashboard..." /></DashboardPage>;
  }

  return (
    <DashboardPage>
      {selectedPaymentId && (
        <PaymentDetailsModal paymentId={selectedPaymentId} onClose={() => setSelectedPaymentId(null)} />
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold ih-text-primary tracking-tight mb-2">My Earnings</h1>
        <p className="text-slate-500 text-sm">Track your campaign payments, performance analytics, and history.</p>
      </div>

      {error && <ErrorState message={error} onRetry={() => loadPayments()} />}

      {/* Analytics Dashboard */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="rounded-3xl border border-emerald-100 bg-gradient-to-b from-emerald-50/50 to-white p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm">
              <Wallet size={24} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">Net Earned</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Earnings</p>
          <p className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">{formatCurrency(metrics.totalEarnings)}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Activity size={24} />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">This Month</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Earned</p>
          <p className="text-3xl font-black ih-text-primary tracking-tight">{formatCurrency(metrics.monthlyEarnings)}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Clock size={24} />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider">Pending</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Expected Payouts</p>
          <p className="text-3xl font-black ih-text-primary tracking-tight">{formatCurrency(metrics.totalPending)}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase tracking-wider">Avg</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Avg Campaign Earnings</p>
          <p className="text-3xl font-black ih-text-primary tracking-tight">{formatCurrency(metrics.avgEarnings)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 mb-8">
        {/* Main Payment History Panel */}
        <div className="ih-panel rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold ih-text-primary flex items-center gap-2">
              <Receipt size={20} className="text-[color:var(--ih-brand)]" /> All Transactions
            </h2>
            <div className="text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
              {payments.length} Records
            </div>
          </div>
          
          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-100 rounded-[1.5rem]">
              <div className="h-16 w-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                <Receipt size={32} />
              </div>
              <p className="text-lg font-bold ih-text-primary mb-1">No payment history</p>
              <p className="text-sm text-slate-400 max-w-[250px]">Complete your campaigns to start earning and see transactions here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 pt-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Campaign & Brand</th>
                    <th className="pb-4 pt-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 text-right">Gross Amount</th>
                    <th className="pb-4 pt-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 text-right">Net Earnings</th>
                    <th className="pb-4 pt-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Status</th>
                    <th className="pb-4 pt-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {payments.map((p) => (
                    <tr 
                      key={p.id} 
                      onClick={() => setSelectedPaymentId(p.id)}
                      className="group hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-[color:var(--ih-brand-light)] group-hover:text-[color:var(--ih-brand)] transition-colors">
                            <ArrowUpRight size={18} />
                          </div>
                          <div>
                            <p className="font-bold ih-text-primary group-hover:text-[color:var(--ih-brand)] transition-colors">{p.campaignTitle}</p>
                            <p className="text-xs text-slate-400 font-medium">{p.brandName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-right font-medium text-slate-500">{formatCurrency(p.amount)}</td>
                      <td className="py-4 px-2 text-right font-bold text-emerald-600">{formatCurrency(p.netAmount)}</td>
                      <td className="py-4 px-2">
                        <StatusBadge tone={STATUS_TONES[p.status] || "neutral"}>
                          {p.status}
                        </StatusBadge>
                      </td>
                      <td className="py-4 px-2 text-right text-xs font-medium text-slate-500">
                        {p.paidAt ? formatDate(p.paidAt) : formatDate(p.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Aside Metrics Panel */}
        <div className="flex flex-col gap-6">
          <div className="ih-panel rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-6">
              <Award size={16} /> Top Paying Campaigns
            </h3>
            {topCampaigns.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No completed campaigns yet.</p>
            ) : (
              <div className="space-y-4">
                {topCampaigns.map((tc, idx) => (
                  <div key={tc.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                        #{idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold ih-text-primary truncate">{tc.campaignTitle}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">{tc.brandName}</p>
                      </div>
                    </div>
                    <div className="text-sm font-black text-emerald-600 shrink-0 ml-2">
                      {formatCurrency(tc.netAmount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ih-panel rounded-[2rem] border border-slate-200 bg-slate-900 p-8 shadow-sm text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[color:var(--ih-brand)] rounded-full blur-[60px] -mr-10 -mt-10 opacity-50" />
             <div className="relative z-10">
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Collaboration Stats</h3>
               <p className="text-4xl font-black tracking-tight text-white mb-2">{metrics.completedCount}</p>
               <p className="text-sm font-medium text-slate-300">Total successful campaigns completed & paid.</p>
             </div>
          </div>
        </div>
      </div>
    </DashboardPage>
  );
};

export default MyEarnings;
