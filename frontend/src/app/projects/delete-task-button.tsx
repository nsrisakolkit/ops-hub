"use client";

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { deleteTask } from './project-api';

interface DeleteTaskButtonProps {
  taskId: string;
}

export function DeleteTaskButton({ taskId }: DeleteTaskButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, startTransition] = useTransition();

  const handleDelete = async () => {
    if (pending) return;

    const confirmed = window.confirm('Delete this task? This action cannot be undone.');
    if (!confirmed) return;

    setPending(true);
    setError(null);

    const result = await deleteTask(taskId);

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

    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending || isRefreshing}
        className="rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs font-medium text-red-200 shadow shadow-red-500/20 transition hover:bg-red-500/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-400/60 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending || isRefreshing ? 'Deleting…' : 'Delete'}
      </button>
      {error ? (
        <span className="max-w-[12rem] text-right text-[10px] text-red-200/90">{error}</span>
      ) : null}
    </div>
  );
}
