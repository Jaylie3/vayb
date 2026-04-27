import { Suspense, useMemo, useState } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChromeContext } from "@/layouts/ChromeContext";
import { PageSkeleton } from "@/components/PageSkeleton";

const RootLayout = () => {
  const [transparent, setTransparent] = useState(false);
  const value = useMemo(() => ({ transparent, setTransparent }), [transparent]);

  return (
    <ChromeContext.Provider value={value}>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
        <Footer />
        <ScrollRestoration />
      </div>
    </ChromeContext.Provider>
  );
};

export default RootLayout;
