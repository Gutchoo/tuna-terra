export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Dashboard pages now use SidebarProvider which provides its own layout
  // This layout just passes through the children
  return <>{children}</>
}