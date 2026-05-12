import React, { useCallback, useEffect, useState } from "react";
import { DollarSign, TrendingUp, Wallet, Clock } from "lucide-react";
import { AdminPage as DashboardPage, AdminPanel as Panel, ErrorState, LoadingState } from "../../Components/AdminShared";
import { useAuth } from "../../hooks/useAuth";
import { getMyPayments } from "../../services/api/paymentService";
import { isAbortError } from "../../services/api/client";
import { formatDate } from "../../utils/formatters";

const MyEarnings = () => {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const totalEarnings = payments.filter(p => p.status === "Completed").reduce((sum, p) => sum + p.netAmount, 0);
  const totalPending = payments.filter(p => p.status === "Pending").reduce((sum, p) => sum + p.netAmount, 0);

  if (loading) {
    return <DashboardPage><LoadingState label="Loading your earnings..." /></DashboardPage>;
  }

  return (
    <DashboardPage>
      <div className="mb-6">
        <h1 className="text-2xl font-bold ih-text-primary tracking-tight mb-2">My Earnings</h1>
        <p className="text-slate-400 text-sm">Track your campaign payments and earnings history.</p>
      </div>

      {error && <ErrorState message={error} onRetry={() => loadPayments()} />}

      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Wallet size={20} />
            </div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Earned</p>
          </div>
          <p className="text-3xl font-bold ih-text-primary">${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Clock size={20} />
            </div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending</p>
          </div>
          <p className="text-3xl font-bold ih-text-primary">${totalPending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      <Panel tone="brand">
        <h2 className="text-lg font-semibold ih-text-primary mb-4">Payment History</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No payments yet. Complete campaigns to start earning.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200">
                <tr>
                  <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Campaign</th>
                  <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Brand</th>
                  <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Gross</th>
                  <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Commission</th>
                  <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Net</th>
                  <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                  <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-4 text-slate-300 font-medium">{p.campaignTitle}</td>
                    <td className="py-4 text-slate-400">{p.brandName}</td>
                    <td className="py-4 ih-text-primary font-mono">${p.amount.toFixed(2)}</td>
                    <td className="py-4 text-red-400 font-mono">-${p.platformCommission.toFixed(2)}</td>
                    <td className="py-4 text-emerald-400 font-bold font-mono">${p.netAmount.toFixed(2)}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.status === "Completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 text-slate-500 text-xs">{p.paidAt ? formatDate(p.paidAt) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </DashboardPage>
  );
};

export default MyEarnings;
