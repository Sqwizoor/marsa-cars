"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface ResponsiveOrderLayoutProps {
  children: React.ReactNode[]
  isPendingOrFailed: boolean
}

export default function ResponsiveOrderLayout({ children, isPendingOrFailed }: ResponsiveOrderLayoutProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    // Function to check screen size
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024)
    }

    // Initial check
    checkScreenSize()

    // Add event listener for resize
    window.addEventListener("resize", checkScreenSize)

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  // Extract the children components
  const [userDetails, orderGroups, paymentGateway] = children

  // Determine the layout based on screen size and payment status
  if (isMobile) {
    return (
      <div className="flex flex-col gap-4 animate-fadeIn">
        {userDetails}
        {isPendingOrFailed && paymentGateway}
        {orderGroups}
      </div>
    )
  }

  // Tablet layout
  if (isTablet) {
    return (
      <div className="grid grid-cols-2 gap-4 animate-fadeIn">
        <div className="overflow-auto max-h-[calc(100vh-200px)] scrollbar-thin">{userDetails}</div>
        <div className="overflow-auto max-h-[calc(100vh-200px)] scrollbar-thin">
          {isPendingOrFailed && paymentGateway}
          {orderGroups}
        </div>
      </div>
    )
  }

  // Desktop layout
  return (
    <div
      className="grid gap-4 animate-fadeIn"
      style={{
        gridTemplateColumns: isPendingOrFailed
          ? "minmax(300px, 1fr) minmax(400px, 2.5fr) minmax(300px, 1fr)"
          : "minmax(300px, 1fr) minmax(400px, 3fr)",
      }}
    >
      <div className="overflow-auto max-h-[calc(100vh-200px)] scrollbar-thin">{userDetails}</div>
      <div className="overflow-auto max-h-[calc(100vh-200px)] scrollbar-thin">{orderGroups}</div>
      {isPendingOrFailed && (
        <div className="overflow-auto max-h-[calc(100vh-200px)] scrollbar-thin">{paymentGateway}</div>
      )}
    </div>
  )
}

