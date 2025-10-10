"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deleteProject } from './project-api';

interface DeleteProjectButtonProps {
  projectId: string;
}

export function DeleteProjectButton({ projectId }: DeleteProjectButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (pending) return;
    const confirmed = window.confirm(
      'This will permanently remove the project and its related records. Continue?',
    );
    if (!confirmed) {
      return;
    }

    setPending(true);
    setError(null);

    const result = await deleteProject(projectId);

    setPending(false);

    if (!result.success) {
      if (result.status === 401) {
        router.replace('/login');
        router.refresh();
        return;
      }

      setError(result.message);
      return;
    }

    router.replace('/projects');
    router.refresh();
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="inline-flex items-center rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200 shadow shadow-red-500/20 transition hover:bg-red-500/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-400/60 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Deleting…' : 'Delete Project'}
      </button>
      {error ? (
        <p className="max-w-xs text-right text-xs text-red-300/90">{error}</p>
      ) : null}
    </div>
  );
}
