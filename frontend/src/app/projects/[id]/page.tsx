import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DeleteProjectButton } from '../delete-project-button';
import { ProjectMembersSection } from '../members-section';
import { ProjectTasksSection } from '../project-tasks-section';
import { fetchCurrentUser, fetchProjectDetail } from '../project-fetchers';
import { formatDateTime } from '../project-utils';
import { UpdateProjectButton } from '../update-project-button';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [project, currentUser] = await Promise.all([
    fetchProjectDetail(id),
    fetchCurrentUser(),
  ]);

  if (!project) {
    notFound();
  }

  const viewerMember = currentUser
    ? project.members.find((member) => member.userId === currentUser.id)
    : undefined;

  const globalRole = currentUser?.role;
  const isOrgAdmin = globalRole === 'ADMIN' || globalRole === 'SUPER_ADMIN';
  const isProjectOwner = viewerMember?.role === 'OWNER';
  const isProjectAdmin = viewerMember?.role === 'ADMIN';

  const canManageProject = Boolean(isOrgAdmin || isProjectOwner);
  const canManageTasks = Boolean(isOrgAdmin || isProjectOwner || isProjectAdmin);
  const canManageMembers = Boolean(isOrgAdmin || isProjectOwner);

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-6 py-10 text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400">
            Project Detail
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{project.name}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300/80">
            {project.description ?? 'No description provided yet.'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <span className="inline-flex items-center rounded-full border border-sky-400/40 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
            {project.status}
          </span>
          <Link
            href="/projects"
            className="inline-flex items-center rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            ← Back to Projects
          </Link>
          {canManageProject ? (
            <UpdateProjectButton
              projectId={project.id}
              name={project.name}
              description={project.description ?? null}
              status={project.status}
            />
          ) : null}
          {canManageProject ? <DeleteProjectButton projectId={project.id} /> : null}
        </div>
      </div>

      <section className="grid gap-4 rounded-xl border border-white/10 bg-slate-950/60 p-6 md:grid-cols-3">
        <dl className="space-y-2 text-sm text-slate-300/80">
          <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Project ID</dt>
          <dd className="font-mono text-sm text-slate-200">{project.id}</dd>
        </dl>
        <dl className="space-y-2 text-sm text-slate-300/80">
          <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Created</dt>
          <dd className="text-slate-200">{formatDateTime(project.createdAt)}</dd>
        </dl>
        <dl className="space-y-2 text-sm text-slate-300/80">
          <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Last Updated</dt>
          <dd className="text-slate-200">{formatDateTime(project.updatedAt)}</dd>
        </dl>
      </section>

      <ProjectTasksSection
        projectId={project.id}
        tasks={project.tasks}
        members={project.members}
        canManageTasks={canManageTasks}
      />

      <ProjectMembersSection
        projectId={project.id}
        members={project.members}
        canManage={canManageMembers}
        viewerUserId={currentUser?.id}
      />

      {project.files && project.files.length > 0 ? (
        <section className="space-y-3 rounded-xl border border-white/10 bg-slate-950/60 p-6">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Files</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              {project.files.length} file{project.files.length === 1 ? '' : 's'}
            </span>
          </header>
          <ul className="space-y-2 text-sm text-slate-200">
            {project.files.map((file) => (
              <li
                key={file.id}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-2"
              >
                <div>
                  <div className="font-medium text-white">{file.filename}</div>
                  <div className="text-xs text-slate-400">
                    Uploaded {formatDateTime(file.createdAt)}
                    {file.uploader?.username ? ` by ${file.uploader.username}` : ''}
                  </div>
                </div>
                {typeof file.size === 'number' ? (
                  <span className="text-xs text-slate-400">{Math.round(file.size / 1024)} KB</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
