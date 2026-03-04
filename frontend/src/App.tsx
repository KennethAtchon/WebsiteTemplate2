import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "./shared/components/ui/sonner";
import ThemeProvider from "./shared/components/layout/theme-provider-wrapper";
import { Outlet } from "@tanstack/react-router";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider>
          <div className="min-h-screen bg-background font-sans antialiased">
            <header className="border-b">
              <div className="container mx-auto px-4 py-4">
                <h1 className="text-2xl font-bold">Website Template</h1>
                <p className="text-muted-foreground">
                  Frontend application with migrated functionality
                </p>
              </div>
            </header>

            <main className="container mx-auto px-4 py-8">
              <Outlet />
            </main>
          </div>
          <Toaster />
        </ThemeProvider>
      </HelmetProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
