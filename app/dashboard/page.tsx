"use client"

import { useState } from "react"
import { UserDashboard } from "@/components/user-dashboard"
import { LoginRequired } from "@/components/login-required"

export default function DashboardPage() {
  const [isLoggedIn] = useState(false) // Simulate login state - in real app this would come from auth context

  if (!isLoggedIn) {
    return <LoginRequired />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <UserDashboard />
    </div>
  )
}
