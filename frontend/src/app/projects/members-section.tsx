"use client";

import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState, useTransition } from 'react';
import {
  addProjectMember,
  lookupUserByUsername,
  removeProjectMember,
  updateProjectMemberRole,
} from './project-api';
import { formatDate } from './project-utils';
import type { ProjectMember, ProjectRole } from './types';
import { PROJECT_ROLES } from './types';

interface ProjectMembersSectionProps {
  projectId: string;
  members: ProjectMember[];
  canManage: boolean;
  viewerUserId?: string;
}

interface AddMemberFormState {
  username: string;
  role: ProjectRole;
}

const DEFAULT_ADD_FORM: AddMemberFormState = {
  username: '',
  role: 'MEMBER',
};

function memberLabel(member: ProjectMember): string {
  const fullName = [member.user.firstName, member.user.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  if (fullName) return fullName;
  if (member.user.username) return member.user.username;
  if (member.user.email) return member.user.email ?? member.userId;
  return member.userId;
}

const PROJECT_ROLE_LABELS: Record<ProjectRole, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MEMBER: 'Member',
  VIEWER: 'Viewer',
};

export function ProjectMembersSection({
  projectId,
  members,
  canManage,
  viewerUserId,
}: ProjectMembersSectionProps) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [addForm, setAddForm] = useState<AddMemberFormState>(DEFAULT_ADD_FORM);
  const [addPending, setAddPending] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [rowPending, setRowPending] = useState<Record<string, boolean>>({});
  const [rowError, setRowError] = useState<Record<string, string | null>>({});

  const sortedMembers = useMemo(
    () =>
      [...members].sort((a, b) => {
        if (a.role === b.role) {
          return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
        }
        // Keep owners first, then admins, then alphabetical
        const rank: Record<ProjectRole, number> = {
          OWNER: 1,
          ADMIN: 2,
          MEMBER: 3,
          VIEWER: 4,
        };
        return rank[a.role] - rank[b.role];
      }),
    [members],
  );

  const disableActions = addPending || refreshing;

  const handleAddMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (addPending) return;

    const trimmedUsername = addForm.username.trim();
    if (!trimmedUsername) {
      setAddError('Username is required.');
      return;
    }

    setAddPending(true);
    setAddError(null);

    const lookup = await lookupUserByUsername(trimmedUsername);

    if (!lookup.success) {
      setAddPending(false);

      if (lookup.status === 401) {
        router.replace('/login');
        router.refresh();
        return;
      }

      setAddError(lookup.message);
      return;
    }

    const existing = members.some((member) => member.userId === lookup.user.id);
    if (existing) {
      setAddPending(false);
      setAddError('That user is already part of this project.');
      return;
    }

    const result = await addProjectMember({
      projectId,
      userId: lookup.user.id,
      role: addForm.role,
    });

    setAddPending(false);

    if (!result.success) {
      if (result.status === 401) {
        router.replace('/login');
        router.refresh();
        return;
      }
      setAddError(result.message);
      return;
    }

    setAddForm(DEFAULT_ADD_FORM);
    startRefresh(() => router.refresh());
  };

  const updatePending = (userId: string, value: boolean) => {
    setRowPending((prev) => ({ ...prev, [userId]: value }));
  };

  const updateRowError = (userId: string, message: string | null) => {
    setRowError((prev) => ({ ...prev, [userId]: message }));
  };

  const handleRoleChange = async (member: ProjectMember, nextRole: ProjectRole) => {
    if (member.role === nextRole) {
      return;
    }

    if (rowPending[member.userId]) {
      return;
    }

    updatePending(member.userId, true);
    updateRowError(member.userId, null);

    const result = await updateProjectMemberRole({
      projectId,
      userId: member.userId,
      role: nextRole,
    });

    updatePending(member.userId, false);

    if (!result.success) {
      if (result.status === 401) {
        router.replace('/login');
        router.refresh();
        return;
      }
      updateRowError(member.userId, result.message);
      return;
    }

    startRefresh(() => router.refresh());
  };

  const handleRemoveMember = async (member: ProjectMember) => {
    if (rowPending[member.userId]) {
      return;
    }

    const label = memberLabel(member);
    const confirmed = window.confirm(`Remove ${label} from this project?`);
    if (!confirmed) return;

    updatePending(member.userId, true);
    updateRowError(member.userId, null);

    const result = await removeProjectMember({
      projectId,
      userId: member.userId,
    });

    updatePending(member.userId, false);

    if (!result.success) {
      if (result.status === 401) {
        router.replace('/login');
        router.refresh();
        return;
      }
      updateRowError(member.userId, result.message);
      return;
    }

    startRefresh(() => router.refresh());
  };

  return (
    <section className="space-y-4 rounded-xl border border-white/10 bg-slate-950/60 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Team members</h2>
        <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
          {members.length} member{members.length === 1 ? '' : 's'}
        </span>
      </header>

      {canManage ? (
    <form className="grid gap-3 rounded-lg border border-white/10 bg-white/5 p-4 text-sm" onSubmit={handleAddMember}>
          <div className="grid gap-2 md:grid-cols-[2fr,1fr] md:items-end">
            <label className="text-slate-200">
              <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Username</span>
              <input
                type="text"
                value={addForm.username}
                onChange={(event) => setAddForm((prev) => ({ ...prev, username: event.target.value }))}
                placeholder="jane.doe"
                className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
                disabled={disableActions}
                required
              />
            </label>

            <label className="text-slate-200">
              <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Role</span>
              <select
                value={addForm.role}
                onChange={(event) =>
                  setAddForm((prev) => ({ ...prev, role: event.target.value as ProjectRole }))
                }
                className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/40"
                disabled={disableActions}
              >
                {PROJECT_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {PROJECT_ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {addError ? (
            <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {addError}
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Invite teammates by their username. We’ll look up their account automatically.
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={disableActions}
              className="inline-flex items-center rounded-lg border border-sky-400/40 bg-sky-500/20 px-4 py-2 text-sm font-semibold text-white shadow shadow-sky-500/20 transition hover:bg-sky-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {addPending || refreshing ? 'Adding…' : 'Add member'}
            </button>
          </div>
        </form>
      ) : null}

      {sortedMembers.length === 0 ? (
        <p className="text-sm text-slate-300/70">No members have been added yet.</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {sortedMembers.map((member) => {
            const pending = Boolean(rowPending[member.userId]) || refreshing;
            const error = rowError[member.userId] ?? null;
            const isViewer = member.userId === viewerUserId;

            return (
              <li
                key={member.id}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-white">{memberLabel(member)}</div>
                    <div className="text-xs text-slate-400">
                      User ID:&nbsp;
                      <span className="font-mono text-slate-300">{member.userId}</span>
                    </div>
                    <div className="mt-2 text-xs text-slate-400">
                      Joined {formatDate(member.joinedAt)}
                    </div>
                  </div>

                  {canManage ? (
                    <div className="flex flex-col items-end gap-2 text-xs">
                      <label className="flex items-center gap-2 text-slate-200">
                        <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Role</span>
                        <select
                          value={member.role}
                          onChange={(event) =>
                            handleRoleChange(member, event.target.value as ProjectRole)
                          }
                          className="rounded-md border border-white/20 bg-slate-950/60 px-2 py-1 text-xs text-white outline-none focus:border-sky-400/60 focus:ring-1 focus:ring-sky-500/40"
                          disabled={pending}
                        >
                          {PROJECT_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {PROJECT_ROLE_LABELS[role]}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member)}
                        disabled={
                          pending || (member.role === 'OWNER' && member.userId === viewerUserId)
                        }
                        className="rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs font-medium text-red-200 transition hover:bg-red-500/20 hover:text-white focus:outline-none focus:ring-1 focus:ring-red-400/60 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {pending ? 'Removing…' : 'Remove'}
                      </button>
                      {isViewer ? (
                        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                          You
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
                      {PROJECT_ROLE_LABELS[member.role]}
                    </span>
                  )}
                </div>
                {error ? (
                  <p className="mt-2 text-xs text-red-300/90">{error}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
