import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchCurrentUser, fetchProjectDetail, fetchTaskDetail } from '../../projects/project-fetchers';
import { TaskDetailClient } from '../task-detail-client';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TaskDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [task, currentUser] = await Promise.all([fetchTaskDetail(id), fetchCurrentUser()]);

  if (!task) {
    notFound();
  }

  const project = await fetchProjectDetail(task.projectId);
  const members = project?.members ?? [];

  const viewerMember = currentUser
    ? members.find((member) => member.userId === currentUser.id)
    : undefined;

  const globalRole = currentUser?.role;
  const isOrgAdmin = globalRole === 'ADMIN' || globalRole === 'SUPER_ADMIN';
  const isProjectOwner = viewerMember?.role === 'OWNER';
  const isProjectAdmin = viewerMember?.role === 'ADMIN';
  const isTaskCreator = currentUser?.id && task.creator?.id === currentUser.id;

  const canManage = Boolean(isOrgAdmin || isProjectOwner || isProjectAdmin);
  const canUpdate = Boolean(canManage || isTaskCreator);
  const canDelete = Boolean(canManage || isTaskCreator);

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-6 py-10 text-slate-100">
      <header className="space-y-2">
        <Link
          href={`/projects/${task.projectId}`}
          className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 transition hover:text-white"
        >
          ← Back to project
        </Link>
        <h1 className="text-3xl font-semibold text-white">{task.title}</h1>
        <p className="text-sm text-slate-300/80">
          Manage status, ownership, and scheduling for this task.
        </p>
      </header>

      <TaskDetailClient
        task={task}
        members={members}
        canUpdate={canUpdate}
        canDelete={canDelete}
        projectHref={`/projects/${task.projectId}`}
      />
    </main>
  );
}
