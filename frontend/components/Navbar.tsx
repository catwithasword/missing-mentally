"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/report/lost", label: "Report Lost" },
  { href: "/report/found", label: "Report Found" },
  { href: "/search", label: "Browse & Search" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        KU Lost &amp; Found
      </Link>
      <ul className="navbar-links">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className={pathname === l.href ? "active" : ""}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
