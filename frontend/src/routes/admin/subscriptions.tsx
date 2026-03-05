import { createFileRoute } from "@tanstack/react-router";
import { SubscriptionsView } from "@/features/admin/components/subscriptions/subscriptions-view";

export const Route = createFileRoute("/admin/subscriptions")({
  component: SubscriptionsPage,
});

function SubscriptionsPage() {
  return <SubscriptionsView />;
}
