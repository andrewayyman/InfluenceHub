import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, ShieldCheck, Trash2, UserMinus, X } from "lucide-react";
import {
  AdminHero,
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
  deleteUser,
  disableUser,
  enableUser,
  getUsers,
} from "../../services/api/adminService";
import {
  getActivityLabel,
  getStatusTone,
  USER_ROLE_OPTIONS,
  USER_STATE_OPTIONS,
} from "../../utils/admin";
import { isAbortError } from "../../services/api/client";
import { formatDateTime } from "../../utils/formatters";

const AdminUsers = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activityFilter, setActivityFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [actingId, setActingId] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const debouncedSearch = useDebouncedValue(search, 250);

  const loadUsers = useCallback(async (signal) => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getUsers(token, {
        search: debouncedSearch,
        role: roleFilter || undefined,
        isActive: activityFilter === "" ? undefined : activityFilter,
      }, signal);

      setUsers(response);
    } catch (requestError) {
      if (isAbortError(requestError) || signal?.aborted) {
        return;
      }

      setError(requestError.message || "Unable to load users.");
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [activityFilter, debouncedSearch, roleFilter, token]);

  useEffect(() => {
    const controller = new AbortController();

    loadUsers(controller.signal);

    return () => controller.abort();
  }, [loadUsers]);

  const summary = useMemo(() => users.reduce((result, user) => {
    result.total += 1;

    const roleKey = user.roleName?.toLowerCase();

    if (roleKey && Object.hasOwn(result, roleKey)) {
      result[roleKey] += 1;
    }

    if (user.isActive) {
      result.active += 1;
    } else {
      result.disabled += 1;
    }

    return result;
  }, {
    total: 0,
    brand: 0,
    influencer: 0,
    active: 0,
    disabled: 0,
  }), [users]);

  const handleEnableDisable = async (user) => {
    try {
      setActingId(user.id);
      setNotice("");

      if (user.isActive) {
        await disableUser(token, user.id);
        setNotice(`${user.displayName} has been disabled.`);
      } else {
        await enableUser(token, user.id);
        setNotice(`${user.displayName} has been enabled.`);
      }

      await loadUsers();
    } catch (requestError) {
      setError(requestError.message || "That account could not be updated.");
    } finally {
      setActingId("");
    }
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(`Delete ${user.displayName}? This only works when no dependent applications exist.`);

    if (!confirmed) {
      return;
    }

    try {
      setActingId(user.id);
      setNotice("");
      await deleteUser(token, user.id);
      setNotice(`${user.displayName} has been deleted.`);
      await loadUsers();
    } catch (requestError) {
      setError(requestError.message || "That account could not be deleted.");
    } finally {
      setActingId("");
    }
  };

  return (
    <AdminPage>


      {error ? <ErrorState message={error} onRetry={() => loadUsers()} /> : null}

      <AdminPanel tone="brand">
        <AdminPanelHeader
          kicker="Account oversight"
          title="Users"
          description="The table reflects the current filter set and updates live as you refine the list."
          actions={notice ? <span role="status" aria-live="polite"><StatusBadge tone="success">{notice}</StatusBadge></span> : null}
        />

        <div className="mb-5 flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <SearchField value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or email" />
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setRoleFilter("");
                setActivityFilter("");
              }}
              className="ih-button-secondary ih-focus-ring px-4 py-3 text-sm"
            >
              Reset filters
            </button>
          </div>
          <FilterTabs label="Filter users by role" items={USER_ROLE_OPTIONS} value={roleFilter} onSelect={setRoleFilter} />
          <FilterTabs label="Filter users by account status" items={USER_STATE_OPTIONS} value={activityFilter} onSelect={setActivityFilter} />
        </div>

        {loading ? <LoadingState label="Loading users..." /> : null}

        {!loading && users.length === 0 ? (
          <EmptyState title="No users match this filter" description="Try broadening the search or removing one of the active filters." />
        ) : null}

        {!loading && users.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {users.map((user) => {
              const displayName = user.displayName?.trim() || "Unnamed user";
              const email = user.email?.trim() || "No email provided";

              return (
                <div key={user.id} className="ih-panel-outline flex flex-col p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white border border-slate-200">
                  {/* Card Header */}
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="ih-icon-chip ih-icon-chip-brand flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold shadow-sm">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="ih-text-primary truncate text-lg font-bold leading-tight" title={displayName}>
                          {displayName}
                        </h3>
                        <p className="ih-text-muted mt-1 truncate text-sm font-medium">
                          {email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Account Details */}
                  <div className="mb-6 space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Role</span>
                      <StatusBadge tone={getStatusTone(user.roleName)}>{user.roleName}</StatusBadge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</span>
                      <StatusBadge tone={getStatusTone(user.isActive)}>{getActivityLabel(user.isActive)}</StatusBadge>
                    </div>
                    <div className="flex flex-col gap-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Joined Date</span>
                      <p className="ih-text-secondary text-sm font-medium">{formatDateTime(user.createdAt)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedUser(user)}
                      className="ih-button-secondary ih-focus-ring flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold shadow-sm hover:shadow-md"
                    >
                      <Eye size={18} aria-hidden="true" />
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEnableDisable(user)}
                      disabled={actingId === user.id}
                      className="ih-button-secondary ih-focus-ring flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold shadow-sm hover:shadow-md"
                    >
                      {user.isActive ? <UserMinus size={18} aria-hidden="true" /> : <ShieldCheck size={18} aria-hidden="true" />}
                      <span className="truncate">{actingId === user.id ? "..." : user.isActive ? "Disable" : "Enable"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(user)}
                      disabled={actingId === user.id}
                      className="ih-button-danger ih-focus-ring flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold shadow-md hover:shadow-lg disabled:shadow-none"
                    >
                      <Trash2 size={18} aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </AdminPanel>

      {selectedUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] ih-text-muted">User profile</p>
                <h3 className="mt-1 text-xl font-semibold ih-text-primary">{selectedUser.displayName || "Unnamed user"}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-lg border border-slate-900/20 p-2 ih-text-secondary hover:bg-slate-100"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs ih-text-muted">Email</p>
                <p className="mt-1 text-sm ih-text-primary break-all">{selectedUser.email || "-"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs ih-text-muted">Role</p>
                <p className="mt-1 text-sm ih-text-primary">{selectedUser.roleName || "-"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs ih-text-muted">Account status</p>
                <p className="mt-1 text-sm ih-text-primary">{getActivityLabel(selectedUser.isActive)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs ih-text-muted">Created</p>
                <p className="mt-1 text-sm ih-text-primary">{formatDateTime(selectedUser.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AdminPage>
  );
};

export default AdminUsers;

