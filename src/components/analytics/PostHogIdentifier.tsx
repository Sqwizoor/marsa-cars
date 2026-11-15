'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import posthog from 'posthog-js'
import { trackMetaCompleteRegistration } from '@/lib/meta-pixel'

export function PostHogIdentifier() {
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
      })
      const createdAtMs = user.createdAt ? new Date(user.createdAt).getTime() : 0
      const isRecentSignup = createdAtMs > 0 && Date.now() - createdAtMs < 5 * 60 * 1000
      const regKey = `fbq_reg_${user.id}`
      if (isRecentSignup && typeof window !== 'undefined' && !localStorage.getItem(regKey)) {
        trackMetaCompleteRegistration({ status: true })
        localStorage.setItem(regKey, 'true')
      }
    } else {
      posthog.reset()
    }
  }, [user])

  return null
}
