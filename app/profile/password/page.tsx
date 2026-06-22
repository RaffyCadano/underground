import { ProfileChangePasswordForm } from '@/app/components/profile-change-password-form';

export default function ChangePasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">Password</h1>
        <p className="mt-1 text-sm text-slate-400">
          Update how you sign in to UGNCBBX.
        </p>
      </div>

      <ProfileChangePasswordForm />
    </div>
  );
}
