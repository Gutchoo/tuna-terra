"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { UserMenu } from "@/components/user-menu"

export function PropertiesSiteHeader() {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center">
        <SidebarTrigger className="-ml-1" />
        <div className="mx-2 h-4 w-px bg-border" />
        <h1 className="text-sm font-semibold">Properties</h1>
      </div>
      <UserMenu />
    </header>
  )
}
