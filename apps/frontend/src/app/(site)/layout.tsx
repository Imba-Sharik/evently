import { auth } from "@/auth";
import { Header } from "@/widgets/header/ui/Header";
import { PageTitle } from "@/widgets/header/ui/PageTitle";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/shared/ui/sidebar";
import { AppSidebar } from "@/widgets/admin-sidebar/ui/AppSidebar";
import { Toaster } from "@/shared/ui/sonner";

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
        <SidebarInset>
          <Header className="sticky top-0 z-10 rounded-t-xl" leftSlot={<><SidebarTrigger /><PageTitle /></>} showLogo={false} />
          <main className="flex-1 overflow-y-auto [scrollbar-gutter:stable]">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 overflow-y-auto pt-16 [scrollbar-gutter:stable]">
        {children}
      </main>
      <Toaster />
    </>
  );
}
