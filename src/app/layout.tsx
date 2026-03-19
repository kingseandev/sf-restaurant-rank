import type { Metadata } from "next";

import { Header } from "@/components/header";

import "./globals.css";

export const metadata: Metadata = {
  title: "SF Restaurant Rank",
  description: "Vote on San Francisco restaurants and watch the ELO leaderboard move in real time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="page-shell">
          <Header />
          <main className="page-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
