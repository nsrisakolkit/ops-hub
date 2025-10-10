import { redirect } from 'next/navigation';
import { fetchCurrentUser } from '../projects/project-fetchers';
import { ProfileForm } from './profile-form';
import { PasswordForm } from './password-form';

export default async function AccountSettingsPage() {
  const user = await fetchCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10 text-slate-100">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Account Settings</h1>
        <p className="text-sm text-slate-300/80">
          Update your profile information and keep your password secure.
        </p>
      </header>

      <ProfileForm
        initial={{
          email: user.email ?? '',
          firstName: user.firstName ?? '',
          lastName: user.lastName ?? '',
          avatar: user.avatar ?? '',
          username: user.username ?? '',
        }}
      />

      <PasswordForm />
    </main>
  );
}
