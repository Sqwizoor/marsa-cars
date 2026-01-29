import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import TrafficPageClient from './client'

export default async function TrafficPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  return <TrafficPageClient />
}
