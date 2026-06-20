import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminSideNav } from '../admin-side-nav';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role !== 'admin') redirect('/dashboard');

  return (
    <section className="container">
      <div className="mb-8">
        <span className="badge">Admin dashboard</span>
        <h1 className="mt-3 text-4xl font-semibold text-white">Control center</h1>
        <p className="mt-2 text-slate-300">
          Manage Underground — welcome back, {session.user.name ?? 'Admin'}.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <AdminSideNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
}
