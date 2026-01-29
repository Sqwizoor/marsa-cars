import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    defaults: '2025-11-30',
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
    capture_exceptions: true,
    autocapture: {
      dom_event_allowlist: ['click', 'change', 'submit'],
      url_allowlist: ['.*'],
      element_allowlist: ['a', 'button', 'form', 'input', 'select', 'textarea']
    }
  })
}

export default posthog
