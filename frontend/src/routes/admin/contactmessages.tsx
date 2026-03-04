import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/contactmessages')({
  component: ContactMessagesPage,
});

function ContactMessagesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Contact Messages</h1>
      <p className="text-muted-foreground">
        Manage contact form submissions from users.
      </p>
    </div>
  );
}
