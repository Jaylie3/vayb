import { lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import RootLayout from "./layouts/RootLayout";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./auth/AuthProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import { Analytics } from "@vercel/analytics/react";

const Index = lazy(() => import("./pages/Index"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Auth = lazy(() => import("./pages/Auth"));
const Tickets = lazy(() => import("./pages/Tickets"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Index /> },
      { path: "/events/:id", element: <EventDetail /> },
      { path: "/checkout/:id", element: <Checkout /> },
      { path: "/auth", element: <Auth /> },
      { path: "/tickets", element: <Tickets /> },
      { path: "/admin", element: <Admin /> },
      { path: "/admin/users", element: <AdminUsers /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <RouterProvider router={router} />
          <Analytics />
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
