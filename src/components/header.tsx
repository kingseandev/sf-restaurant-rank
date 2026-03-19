"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/vote", label: "Vote" },
  { href: "/rankings", label: "Rankings" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <Link className="brand" href="/vote">
        <span className="brand-mark">SF</span>
        <div>
          <p>Restaurant Rank</p>
          <span>Prestige-style voting for San Francisco dining</span>
        </div>
      </Link>

      <nav className="nav">
        {navItems.map((item) => (
          <Link
            key={item.href}
            className={pathname === item.href ? "nav-link active" : "nav-link"}
            href={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
