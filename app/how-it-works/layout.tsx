import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Learn how Deklata works — give items you no longer need to fellow students in Ghana, or request items for free from your campus community.',
  alternates: { canonical: 'https://deklata.app/how-it-works' },
  openGraph: {
    title: 'How Deklata Works – Free Student Item Exchange',
    description: 'Simple steps to give or receive free items from students on your campus in Ghana.',
    url: 'https://deklata.app/how-it-works',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
