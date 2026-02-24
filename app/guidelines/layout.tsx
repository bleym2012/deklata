import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Community Guidelines',
  description: 'Deklata community guidelines — how to be a good member of our student exchange community in Ghana.',
  alternates: { canonical: 'https://deklata.app/guidelines' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
