import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tyler Boyd",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const links = [
    { name: "Home", href: "/" },
    { name: "Resume", href: "/tyler_boyd.pdf", external: true },
  ];
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-full w-full">
          <aside className="min-w-[300px] max-w-[400px] bg-slate-200 h-full flex flex-col gap-y-8 items-center pt-16 px-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://gravatar.com/avatar/323d29a51013f314c4eb678b44e2b86229d4d7a56b6fccd38be1710269582769?s=512"
              width={200}
              height={200}
              alt="Me"
              className="rounded-full border-white border-[10px]"
            />
            <div className="flex flex-col items-center">
              <h1 className="text-3xl font-bold">Tyler Boyd</h1>
              <h2 className="text-xl text-muted">Full-stack developer</h2>
            </div>
            <nav className="flex flex-col items-stretch w-full">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-center w-full p-2 gap-x-2 transition-all hover:bg-slate-300"
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  prefetch={!link.external}
                >
                  {link.name}
                  {link.external && <ExternalLinkIcon />}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="w-full flex justify-center overflow-y-auto">
            <div className="max-w-screen-lg pt-16 px-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
