import React from "react";
import {
  createRouter,
  createRootRoute,
  createRoute,
} from "@tanstack/react-router";
// import App from "../App";

// TODO: This is a legacy manual router - use file-based routing instead
const App = () => <div>Legacy Router - Use File-Based Routing</div>;

// Import simple components
import SimpleCalculator from "../features/calculator/components/SimpleCalculator";
import SimpleContactForm from "../features/contact/components/SimpleContactForm";
import { DashboardView } from "../features/admin/components/dashboard/dashboard-view";

// Create the root route
const rootRoute = createRootRoute({
  component: App,
});

// Create index route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <div>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Calculator Features</h2>
        <SimpleCalculator />
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Contact Form</h2>
        <SimpleContactForm onSuccess={() => console.log("Form submitted")} />
      </section>
    </div>
  ),
});

// Create admin routes
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "admin",
});

const adminIndexRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/",
  component: () => (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-muted-foreground">
        Select a section from the navigation to manage your application.
      </p>
    </div>
  ),
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "dashboard",
  component: DashboardView,
});

// Create the router with manual route tree
export const router = createRouter({
  routeTree: rootRoute.addChildren([
    indexRoute,
    adminRoute.addChildren([adminIndexRoute, adminDashboardRoute]),
  ]),
  defaultPreload: "intent",
});

// Legacy manual router kept for reference during migration.
