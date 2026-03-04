import { createFileRoute } from '@tanstack/react-router';
import { CustomersView } from '@/features/admin/components/customers/customers-view';

export const Route = createFileRoute('/admin/customers')({
  component: CustomersPage,
});

function CustomersPage() {
  return <CustomersView />;
}
