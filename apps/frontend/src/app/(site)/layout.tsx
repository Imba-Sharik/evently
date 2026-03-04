// import { auth } from "@/auth"; // TODO: раскомментировать когда бэк будет настроен
import { Header } from "@/widgets/header/ui/Header";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/shared/ui/sidebar";
import { AppSidebar } from "@/widgets/admin-sidebar/ui/AppSidebar";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: заменить на auth() когда бэк будет настроен
  // const session = await auth();
  // const isAdmin = session?.user?.role === "admin";
  const isAdmin = true;

  if (isAdmin) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header className="sticky top-0 z-10 rounded-t-xl" leftSlot={<SidebarTrigger />} />
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
    </>
  );
}
