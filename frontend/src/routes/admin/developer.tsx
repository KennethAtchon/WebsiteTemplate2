import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/developer')({
  component: DeveloperPage,
});

function DeveloperPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Developer</h1>
      <p className="text-muted-foreground">
        Developer tools and debugging information.
      </p>
    </div>
  );
}
