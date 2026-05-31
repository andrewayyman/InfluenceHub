import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MailCheck } from "lucide-react";
import {
  AdminPage,
  AdminPanel,
  AdminPanelHeader,
  EmptyState,
  ErrorState,
  FilterTabs,
  LoadingState,
  SearchField,
  StatusBadge,
} from "../../Components/AdminShared";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import {
  getContactMessages,
  markContactReplied,
} from "../../services/api/adminService";
import {
  getContactSourceLabel,
  getContactSourceTone,
  getMessageLabel,
  getMessagePreview,
  MESSAGE_STATUS_OPTIONS,
} from "../../utils/admin";
import { isAbortError } from "../../services/api/client";
import { formatDateTime } from "../../utils/formatters";

const AdminMessages = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [replyingId, setReplyingId] = useState("");
  const debouncedSearch = useDebouncedValue(search, 250);

  const loadMessages = useCallback(async (signal) => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getContactMessages(token, {
        isReplied: statusFilter === "" ? undefined : statusFilter,
        search: debouncedSearch,
      }, signal);

      setMessages(response);
      setSelectedId((current) => response.some((item) => item.id === current) ? current : response[0]?.id || "");
    } catch (requestError) {
      if (isAbortError(requestError) || signal?.aborted) {
        return;
      }

      setError(requestError.message || "Unable to load messages.");
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [debouncedSearch, statusFilter, token]);

  useEffect(() => {
    const controller = new AbortController();

    loadMessages(controller.signal);

    return () => controller.abort();
  }, [loadMessages]);

  const selectedMessage = useMemo(
    () => messages.find((message) => message.id === selectedId) || null,
    [messages, selectedId],
  );

  const handleMarkReplied = async (message) => {
    try {
      setReplyingId(message.id);
      setNotice("");
      await markContactReplied(token, message.id);
      setNotice(`${message.subject} has been marked as replied.`);
      setMessages((current) => current.map((item) => item.id === message.id ? {
        ...item,
        isReplied: true,
      } : item));
    } catch (requestError) {
      setError(requestError.message || "That message could not be updated.");
    } finally {
      setReplyingId("");
    }
  };

  return (
    <AdminPage>


      {error ? <ErrorState message={error} onRetry={() => loadMessages()} /> : null}

      <AdminPanel tone="brand">
        <AdminPanelHeader
          kicker="Support queue"
          title="Messages"
          description="Select a conversation from the left column to review it in full detail."
          actions={notice ? <span role="status" aria-live="polite"><StatusBadge tone="success">{notice}</StatusBadge></span> : null}
        />

        <div className="mb-5 flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <SearchField value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by sender, email, subject, or message" />
            <button
              type="button"
              onClick={() => setSearch("")}
              className="ih-button-secondary ih-focus-ring px-4 py-3 text-sm"
            >
              Clear search
            </button>
          </div>
          <FilterTabs label="Filter messages by reply status" items={MESSAGE_STATUS_OPTIONS} value={statusFilter} onSelect={setStatusFilter} />
        </div>

        {loading ? <LoadingState label="Loading contact messages..." /> : null}

        {!loading && messages.length === 0 ? (
          <EmptyState title="No messages in this view" description="Try another filter or search term to find a different conversation." />
        ) : null}

        {!loading && messages.length > 0 ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(300px,0.9fr)_minmax(0,1.1fr)]">
            <div className="space-y-3" role="listbox" aria-label="Message threads">
              {messages.map((message) => {
                const isSelected = message.id === selectedId;

                return (
                  <button
                    key={message.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    aria-controls="selected-message-panel"
                    onClick={() => setSelectedId(message.id)}
                    className={`ih-focus-ring block w-full rounded-[1.35rem] border p-4 text-left transition ${
                      isSelected
                        ? "border-[color:var(--ih-border-strong)] bg-slate-100"
                        : "border-slate-200 bg-slate-50/4 hover:bg-slate-50/7"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold ih-text-primary">{message.subject}</p>
                        <p className="ih-text-muted mt-1 text-sm">{message.name} - {message.email}</p>
                      </div>
                      <div className="flex flex-wrap justify-end gap-2">
                        <StatusBadge tone={getContactSourceTone(message.senderRole)}>{getContactSourceLabel(message.senderRole)}</StatusBadge>
                        <StatusBadge tone={message.isReplied ? "success" : "warning"}>{getMessageLabel(message.isReplied)}</StatusBadge>
                      </div>
                    </div>
                    <p className="ih-text-secondary mt-3 text-sm leading-6">{getMessagePreview(message)}</p>
                    <p className="ih-text-subtle mt-4 text-xs uppercase tracking-[0.18em]">{formatDateTime(message.createdAt)}</p>
                  </button>
                );
              })}
            </div>

            <div id="selected-message-panel" className="rounded-[1.5rem] border border-slate-200 bg-slate-50/4 p-5">
              {selectedMessage ? (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xl font-semibold ih-text-primary">{selectedMessage.subject}</p>
                      <p className="ih-text-muted mt-1 text-sm">From {selectedMessage.name} - {selectedMessage.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge tone={getContactSourceTone(selectedMessage.senderRole)}>{getContactSourceLabel(selectedMessage.senderRole)}</StatusBadge>
                      <StatusBadge tone={selectedMessage.isReplied ? "success" : "warning"}>{getMessageLabel(selectedMessage.isReplied)}</StatusBadge>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <p className="ih-text-subtle text-xs uppercase tracking-[0.18em]">Received</p>
                      <p className="mt-2 text-sm font-medium ih-text-primary">{formatDateTime(selectedMessage.createdAt)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <p className="ih-text-subtle text-xs uppercase tracking-[0.18em]">Source</p>
                      <p className="mt-2 text-sm font-medium ih-text-primary">{getContactSourceLabel(selectedMessage.senderRole)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <p className="ih-text-subtle text-xs uppercase tracking-[0.18em]">Status</p>
                      <p className="mt-2 text-sm font-medium ih-text-primary">{getMessageLabel(selectedMessage.isReplied)}</p>
                    </div>
                  </div>

                  <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="ih-text-subtle text-xs uppercase tracking-[0.18em]">Message</p>
                    <p className="ih-text-secondary mt-3 whitespace-pre-wrap text-sm leading-7">{selectedMessage.message}</p>
                  </div>

                  {!selectedMessage.isReplied ? (
                    <button
                      type="button"
                      onClick={() => handleMarkReplied(selectedMessage)}
                      disabled={replyingId === selectedMessage.id}
                      className="ih-button-primary ih-focus-ring inline-flex items-center gap-2 px-4 py-3 text-sm"
                    >
                      <MailCheck size={16} aria-hidden="true" />
                      {replyingId === selectedMessage.id ? "Updating..." : "Mark as replied"}
                    </button>
                  ) : null}
                </div>
              ) : (
                <EmptyState title="Choose a message" description="Select any message from the left side to see the full thread details here." />
              )}
            </div>
          </div>
        ) : null}
      </AdminPanel>
    </AdminPage>
  );
};

export default AdminMessages;

