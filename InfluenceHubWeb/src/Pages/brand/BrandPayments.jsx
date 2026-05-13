import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DollarSign, Search, TrendingUp, X, UploadCloud, FileImage, FileText, CheckCircle, Clock, Check, AlertCircle, Receipt, ExternalLink, Download } from "lucide-react";
import {
  AdminPage as DashboardPage,
  AdminPanel as Panel,
  AdminPanelHeader as PanelHeader,
  ErrorState,
  FilterTabs,
  LoadingState,
  StatusBadge,
} from "../../Components/AdminShared";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { getBrandPayments, uploadPaymentProof, getPaymentDetails } from "../../services/api/paymentService";
import { isAbortError, resolveApiUrl } from "../../services/api/client";
import { formatCurrency, formatDate } from "../../utils/formatters";

const STATUS_TONES = {
  Completed: "success",
  Pending: "warning",
  Failed: "danger",
};

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Pending Payment", value: "Pending" },
  { label: "Completed", value: "Completed" },
];

const PAYMENT_METHODS = [
  "InstaPay",
  "Bank Transfer",
  "Vodafone Cash",
  "PayPal",
  "Credit/Debit Card",
  "Electronic Wallet",
  "Other",
];

const PaymentSubmissionModal = ({ payment, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [method, setMethod] = useState("");
  const [senderName, setSenderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      setFile(selectedFile);
      if (selectedFile.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(selectedFile));
      } else {
        setFilePreview(null);
      }
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!method) {
      setError("Please select a payment method.");
      return;
    }
    if (!file) {
      setError("Please upload a payment proof screenshot/receipt.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const mergedNotes = [
        senderName ? `Sender Name: ${senderName}` : "",
        accountNumber ? `Account/Wallet: ${accountNumber}` : "",
        notes ? `Notes: ${notes}` : ""
      ].filter(Boolean).join("\n");

      const formData = new FormData();
      formData.append("paymentMethod", method);
      if (transactionRef) formData.append("transactionReference", transactionRef);
      if (mergedNotes) formData.append("brandNotes", mergedNotes);
      formData.append("proofFile", file);

      await uploadPaymentProof(token, payment.id, formData);
      onSuccess();
    } catch (err) {
      setError(err.message || "Failed to submit payment proof.");
      setIsSubmitting(false);
    }
  };

  if (!payment) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl my-8 flex flex-col motion-safe:animate-[fadeIn_0.2s_ease-out]">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-10 rounded-t-[2rem]">
          <div>
            <h2 className="text-2xl font-bold ih-text-primary tracking-tight">Complete Payment</h2>
            <p className="text-sm ih-text-muted mt-1">Submit proof of transfer to finalize the transaction.</p>
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="p-3 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          <div className="flex items-center justify-between p-5 rounded-2xl bg-brand-50 border border-brand-100 mb-8">
            <div>
              <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-1">Total Amount Due</p>
              <p className="text-3xl font-black text-brand-700 tracking-tight">{formatCurrency(payment.amount)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold ih-text-primary">{payment.influencerName}</p>
              <p className="text-xs text-slate-500">{payment.campaignTitle}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold ih-text-primary flex items-center gap-2"><DollarSign size={18}/> Payment Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Payment Method *</label>
                  <select
                    className="ih-input w-full bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select Method...</option>
                    {PAYMENT_METHODS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Transaction Ref</label>
                  <input
                    type="text"
                    className="ih-input w-full bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    placeholder="e.g. TXN-123456"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Sender Name</label>
                  <input
                    type="text"
                    className="ih-input w-full bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    placeholder="Name on account"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Account/Wallet Number</label>
                  <input
                    type="text"
                    className="ih-input w-full bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    placeholder="Last 4 digits or full"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Additional Notes</label>
                <textarea
                  className="ih-input w-full bg-slate-50 border-slate-200 focus:bg-white transition-colors min-h-[80px]"
                  placeholder="Any additional information..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold ih-text-primary flex items-center gap-2"><UploadCloud size={18}/> Payment Proof *</h3>
              
              <div className="relative">
                <input
                  type="file"
                  id="proofFile"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                  required
                />
                <div className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-[1.5rem] transition-all ${file ? "border-emerald-400 bg-emerald-50/30" : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-brand-400"}`}>
                  {filePreview ? (
                    <div className="relative h-32 mb-4">
                      <img src={filePreview} alt="Preview" className="h-full object-contain rounded-lg shadow-sm" />
                    </div>
                  ) : file ? (
                    <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm mb-4">
                      <FileText size={32} />
                    </div>
                  ) : (
                    <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm mb-4">
                      <FileImage size={32} />
                    </div>
                  )}
                  
                  {file ? (
                    <div className="text-center">
                      <p className="text-sm font-bold text-emerald-700">{file.name}</p>
                      <p className="text-xs text-emerald-600/70 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB • Click to replace</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm font-bold ih-text-primary">Click to upload or drag and drop</p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG or PDF (max. 5MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            <div className="pt-6 flex gap-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-4 rounded-[1.5rem] font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !method || !file}
                className="flex-[2] py-4 rounded-[1.5rem] font-black text-white bg-[color:var(--ih-brand)] hover:bg-[color:var(--ih-brand-dark)] shadow-[0_10px_30px_rgba(99,102,241,0.3)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>Processing...</>
                ) : (
                  <><Check size={20} /> Submit Payment</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const CompletedPaymentModal = ({ paymentId, onClose }) => {
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
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col motion-safe:animate-[fadeIn_0.2s_ease-out]">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold ih-text-primary">Payment Receipt</h2>
              <p className="text-sm ih-text-muted">ID: {payment?.id || paymentId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <LoadingState label="Loading receipt details..." />
          ) : error ? (
            <ErrorState message={error} />
          ) : payment ? (
            <div className="space-y-8">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Amount Paid</p>
                <p className="text-4xl font-black text-emerald-600 tracking-tight mb-2">{formatCurrency(payment.amount)}</p>
                <p className="text-sm text-slate-500 font-medium">To {payment.influencerName} for {payment.campaignTitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Transfer Date</p>
                  <p className="text-sm font-bold ih-text-primary">{formatDate(payment.paidAt || payment.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Method</p>
                  <p className="text-sm font-bold ih-text-primary">{payment.paymentMethod || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Transaction Ref</p>
                  <p className="text-sm font-bold ih-text-primary font-mono">{payment.transactionReference || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <StatusBadge tone="success">Completed</StatusBadge>
                </div>
              </div>

              {payment.brandNotes && (
                 <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Your Notes</p>
                   <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">{payment.brandNotes}</p>
                 </div>
              )}

              {payment.proofUrl && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Uploaded Proof</p>
                  <div className="flex gap-4">
                    <div className="h-24 w-24 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                       <img src={resolveApiUrl(payment.proofUrl)} alt="Proof" className="max-w-full max-h-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-center gap-2">
                       <a href={resolveApiUrl(payment.proofUrl)} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                         <ExternalLink size={16} /> View Full Receipt
                       </a>
                       <a href={resolveApiUrl(payment.proofUrl)} download className="text-sm font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1">
                         <Download size={16} /> Download Copy
                       </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const BrandPayments = () => {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 250);
  const [statusFilter, setStatusFilter] = useState("");

  const [submittingPayment, setSubmittingPayment] = useState(null);
  const [viewingPaymentId, setViewingPaymentId] = useState(null);

  const loadPayments = useCallback(async (signal) => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await getBrandPayments(token, signal);
      if (!signal?.aborted) setPayments(data || []);
    } catch (err) {
      if (!isAbortError(err) && !signal?.aborted) setError(err.message || "Unable to load payments.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const controller = new AbortController();
    loadPayments(controller.signal);
    return () => controller.abort();
  }, [loadPayments]);

  const filteredPayments = useMemo(() => {
    let result = payments;
    if (statusFilter) {
      result = result.filter(p => statusFilter === "Pending" ? p.status === "Pending" : p.status === "Completed");
    }
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(p => 
        p.influencerName.toLowerCase().includes(q) || 
        p.campaignTitle.toLowerCase().includes(q)
      );
    }
    return result;
  }, [payments, statusFilter, debouncedSearch]);

  const pendingCount = payments.filter(p => p.status === "Pending").length;
  const completedCount = payments.filter(p => p.status === "Completed").length;

  return (
    <DashboardPage>
      {submittingPayment && (
        <PaymentSubmissionModal
          payment={submittingPayment}
          onClose={() => setSubmittingPayment(null)}
          onSuccess={() => {
            setSubmittingPayment(null);
            loadPayments(new AbortController().signal);
          }}
        />
      )}
      
      {viewingPaymentId && (
        <CompletedPaymentModal
          paymentId={viewingPaymentId}
          onClose={() => setViewingPaymentId(null)}
        />
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold ih-text-primary tracking-tight mb-2">Payments & Billing</h1>
        <p className="text-slate-500 text-sm">Manage pending payouts and view your transaction history securely.</p>
      </div>

      {error && <ErrorState message={error} onRetry={() => loadPayments()} />}

      <div className="grid gap-6 sm:grid-cols-2 mb-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm flex items-center justify-between group">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-sm">
                <Clock size={24} />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Action Required</p>
            </div>
            <p className="text-4xl font-black ih-text-primary tracking-tight">{pendingCount}</p>
            <p className="text-sm font-medium text-slate-500 mt-1">Pending Payments</p>
          </div>
          <div className="h-24 w-24 rounded-full bg-amber-50/50 flex items-center justify-center transition-transform group-hover:scale-110">
            <Receipt size={40} className="text-amber-200" />
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm flex items-center justify-between group">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-sm">
                <CheckCircle size={24} />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">History</p>
            </div>
            <p className="text-4xl font-black ih-text-primary tracking-tight">{completedCount}</p>
            <p className="text-sm font-medium text-slate-500 mt-1">Completed Payments</p>
          </div>
          <div className="h-24 w-24 rounded-full bg-emerald-50/50 flex items-center justify-center transition-transform group-hover:scale-110">
            <CheckCircle size={40} className="text-emerald-200" />
          </div>
        </div>
      </div>

      <Panel>
        <PanelHeader
          kicker="Billing Workspace"
          title="All Transactions"
        />

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
          <FilterTabs
            items={STATUS_OPTIONS}
            value={statusFilter}
            onSelect={setStatusFilter}
          />
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ih-input w-full pl-10 py-3 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors text-sm"
            />
          </div>
        </div>

        {loading ? (
          <LoadingState label="Synchronizing payments..." />
        ) : filteredPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
            <div className="h-16 w-16 bg-white shadow-sm text-slate-300 rounded-full flex items-center justify-center mb-4">
              <Receipt size={32} />
            </div>
            <p className="text-lg font-bold ih-text-primary mb-1">No payments found</p>
            <p className="text-sm text-slate-400">You don't have any payments matching this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[1.5rem] border border-slate-200 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Influencer & Campaign</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 text-right">Amount Due</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 text-right">Date</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold ih-text-primary">{p.influencerName}</p>
                      <p className="text-xs text-slate-500 font-medium">{p.campaignTitle}</p>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-lg ih-text-primary">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-slate-500">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge tone={STATUS_TONES[p.status] || "neutral"}>
                        {p.status === "Pending" ? "Pending Payment" : p.status}
                      </StatusBadge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.status === "Pending" ? (
                        <button 
                          onClick={() => setSubmittingPayment(p)}
                          className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#d65a00] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
                        >
                          Pay Now <ExternalLink size={16} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => setViewingPaymentId(p.id)}
                          className="inline-flex items-center gap-2 bg-green-300 hover:bg-green-200 text-green-900 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95"
                        >
                          Receipt
                        </button>
                      )}
                    </td>
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

export default BrandPayments;
