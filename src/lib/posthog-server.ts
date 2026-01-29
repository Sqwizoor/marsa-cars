import { PostHog } from 'posthog-node'

// Singleton instance for better performance
let posthogInstance: PostHog | null = null

export function getPostHogClient(): PostHog {
  if (!posthogInstance) {
    posthogInstance = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 20,
      flushInterval: 10000,
    })
  }
  return posthogInstance
}

export async function shutdownPostHog() {
  if (posthogInstance) {
    await posthogInstance.shutdown()
    posthogInstance = null
  }
}

// Helper function to track events
export async function trackEvent({
  distinctId,
  event,
  properties = {},
}: {
  distinctId: string
  event: string
  properties?: Record<string, any>
}) {
  const client = getPostHogClient()
  
  client.capture({
    distinctId,
    event,
    properties: {
      ...properties,
      timestamp: new Date().toISOString(),
    },
  })

  // Note: We don't shutdown here to reuse the singleton
  // Shutdown should be called at application shutdown or in specific cases
}

// Helper to identify users
export async function identifyUser({
  distinctId,
  properties = {},
}: {
  distinctId: string
  properties?: Record<string, any>
}) {
  const client = getPostHogClient()
  
  client.identify({
    distinctId,
    properties,
  })
}
