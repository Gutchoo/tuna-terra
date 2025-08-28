import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { FinancialModelingSidebar } from "@/components/financial-modeling/FinancialModelingSidebar"
import { FinancialModelingProvider } from "@/lib/contexts/FinancialModelingContext"

export default function FinancialModelingLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <FinancialModelingProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 64)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <FinancialModelingSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </FinancialModelingProvider>
  )
}