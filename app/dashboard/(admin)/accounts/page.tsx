import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { AccountActionsMenu } from '@/app/dashboard/account-actions-menu';
import { AccountRoleButton } from '@/app/dashboard/account-role-button';

export default async function DashboardAccountsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      rankPoints: true,
      wins: true,
      losses: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Account management</h2>
        <p className="mt-1 text-sm text-slate-400">All registered users on Underground.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900 text-slate-400">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">User</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">Role</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">Record</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">Points</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">Joined</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-800 transition hover:bg-slate-900/60">
                  <td className="px-5 py-4 font-medium text-white">{u.username}</td>
                  <td className="px-5 py-4 text-slate-300">{u.email}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
                        u.role === 'admin'
                          ? 'border-brand-500/40 bg-brand-500/10 text-brand-300'
                          : 'border-slate-700 bg-slate-800/60 text-slate-400'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 tabular-nums text-slate-300">
                    {u.wins}-{u.losses}
                  </td>
                  <td className="px-5 py-4 tabular-nums text-slate-300">{u.rankPoints}</td>
                  <td className="px-5 py-4 text-slate-400">
                    {u.createdAt.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <AccountRoleButton
                        userId={u.id}
                        username={u.username}
                        role={u.role}
                        currentUserId={session.user.id}
                      />
                      <AccountActionsMenu user={u} currentUserId={session.user.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
