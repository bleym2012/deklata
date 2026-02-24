import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Deklata terms of use — the rules for giving and receiving items on our student platform.',
  alternates: { canonical: 'https://deklata.app/terms' },
  robots: { index: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
