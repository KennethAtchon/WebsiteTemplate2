import { createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '../../features/admin/components/dashboard/dashboard-layout';
import { AuthGuard } from '../../features/auth/components/auth-guard';

function AdminLayout() {
  return (
    <AuthGuard authType="admin">
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Select a section from the navigation to manage your application.
          </p>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

export const Route = createFileRoute()({
  component: AdminLayout,
});
