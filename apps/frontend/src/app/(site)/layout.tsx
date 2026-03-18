import { auth } from "@/auth";
import { Header } from "@/widgets/header/ui/Header";
import { PageTitle } from "@/widgets/header/ui/PageTitle";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/shared/ui/sidebar";
import { AppSidebar } from "@/widgets/admin-sidebar/ui/AppSidebar";
import { Toaster } from "@/shared/ui/sonner";
import { Footer } from "@/widgets/footer/ui/Footer";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isAdmin = session?.user?.role === "manager";

  if (isAdmin) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <Header className="sticky top-0 z-10 rounded-t-xl" leftSlot={<><SidebarTrigger /><PageTitle /></>} showLogo={false} fullWidth />
          <main className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]">
            {children}
          </main>
        </SidebarInset>
        <Toaster position="top-center" />
      </SidebarProvider>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
      <Toaster position="top-center" />
    </>
  );
}
