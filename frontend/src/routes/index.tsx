import { createFileRoute } from '@tanstack/react-router';

// Import simple components
import SimpleCalculator from '../../features/calculator/components/SimpleCalculator';
import SimpleContactForm from '../../features/contact/components/SimpleContactForm';

function IndexRoute() {
  return (
    <div>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Calculator Features
        </h2>
        <SimpleCalculator />
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Contact Form</h2>
        <SimpleContactForm
          onSuccess={() => console.log("Form submitted")}
        />
      </section>
    </div>
  );
}

export const Route = createFileRoute()({
  component: IndexRoute,
});
