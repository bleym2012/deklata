
export const dynamic = "force-dynamic";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata = {  
  title: "Deklata – Give Out What You Don’t Need | Student-to-Student Platform",  
  description:    "Deklata helps students give items they no longer need and receive what they do – safely, simply, and for free.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
