import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Deklata team. We support students across UDS Tamale, UDS Nyankpala, and Tamale Technical University.',
  alternates: { canonical: 'https://deklata.app/contact' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
