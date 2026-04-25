import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, ShieldCheck, UserMinus, X } from "lucide-react";
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
          <div className="overflow-x-auto">
            <table className="min-w-[54rem] w-full text-left">
              <thead className="ih-table-head border-b text-sm">
                <tr>
                  <th className="pb-3" scope="col">User</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">Created</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const displayName = user.displayName?.trim() || "Unnamed user";
                  const email = user.email?.trim() || "No email provided";

                  return (
                  <tr key={user.id} className="ih-table-row border-b last:border-none">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="ih-icon-chip ih-icon-chip-brand h-10 w-10 rounded-full font-semibold">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="ih-text-primary font-medium">{displayName}</p>
                          <p className="ih-text-muted mt-1 text-sm">{email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <StatusBadge tone={getStatusTone(user.roleName)}>{user.roleName}</StatusBadge>
                    </td>
                    <td>
                      <StatusBadge tone={getStatusTone(user.isActive)}>{getActivityLabel(user.isActive)}</StatusBadge>
                    </td>
                    <td className="ih-text-secondary text-sm">{formatDateTime(user.createdAt)}</td>
                    <td>
                      <div className="flex flex-wrap gap-2 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedUser(user)}
                          className="ih-button-secondary ih-focus-ring inline-flex items-center gap-2 px-3 py-2 text-sm"
                        >
                          <Eye size={16} aria-hidden="true" />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEnableDisable(user)}
                          disabled={actingId === user.id}
                          className="ih-button-secondary ih-focus-ring inline-flex items-center gap-2 px-3 py-2 text-sm"
                        >
                          {user.isActive ? <UserMinus size={16} aria-hidden="true" /> : <ShieldCheck size={16} aria-hidden="true" />}
                          {actingId === user.id ? "Updating..." : user.isActive ? "Disable" : "Enable"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
                          disabled={actingId === user.id}
                          className="ih-focus-ring rounded-lg border border-red-400/18 bg-red-500/8 px-3 py-2 text-sm font-medium text-red-100 transition hover:bg-red-500/12"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </AdminPanel>

      {selectedUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">User profile</p>
                <h3 className="mt-1 text-xl font-semibold text-white">{selectedUser.displayName || "Unnamed user"}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-lg border border-white/20 p-2 text-slate-300 hover:bg-white/10"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400">Email</p>
                <p className="mt-1 text-sm text-white break-all">{selectedUser.email || "-"}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400">Role</p>
                <p className="mt-1 text-sm text-white">{selectedUser.roleName || "-"}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400">Account status</p>
                <p className="mt-1 text-sm text-white">{getActivityLabel(selectedUser.isActive)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400">Created</p>
                <p className="mt-1 text-sm text-white">{formatDateTime(selectedUser.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AdminPage>
  );
};

export default AdminUsers;
