"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navigation } from "@/lib/navigation";
import { ThemeToggle } from "./theme-toggle";
import { MediaImage } from "@/components/ui/content-ui";
import type { Media } from "@/types/content";

export function PortfolioNavigation({
  children,
  logo,
}: {
  children: React.ReactNode;
  logo?: Media | null;
}) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return (
      <header className="site-header">
        <div className="header-top">
          <Link href="/admin" className="brand" aria-label="Admin dashboard">
            <span className="brand-mark" aria-hidden="true">
              {logo ? (
                <MediaImage media={logo} priority />
              ) : (
                <>
                  CL<span>.</span>
                </>
              )}
            </span>
            <span>Portfolio admin</span>
          </Link>
          <div className="header-actions">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              View website ↗
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>
    );
  }
  return (
    <NavigationContent key={pathname} pathname={pathname} logo={logo}>
      {children}
    </NavigationContent>
  );
}

function NavigationContent({
  pathname,
  children,
  logo,
}: {
  pathname: string;
  children: React.ReactNode;
  logo?: Media | null;
}) {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const wide = window.matchMedia("(min-width: 1024px)");
    const resize = () => {
      if (wide.matches) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", escape);
    wide.addEventListener("change", resize);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", escape);
      wide.removeEventListener("change", resize);
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      className="site-header"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <div className="header-top">
        <Link
          href="/"
          aria-label="Chimeng Ly home"
          className="brand"
          onClick={() => setOpen(false)}
        >
          <span className="brand-mark" aria-hidden="true">
            {logo ? (
              <MediaImage media={logo} priority />
            ) : (
              <>
                CL<span>.</span>
              </>
            )}
          </span>
          <span>
            chimeng<span className="brand-accent">.dev</span>
          </span>
        </Link>
        <div className="header-actions">
          {children}
          <span className="action-divider" aria-hidden="true" />
          <ThemeToggle />
          <button
            ref={buttonRef}
            type="button"
            className="menu-button"
            aria-expanded={open}
            aria-controls="portfolio-menu"
            onClick={() => setOpen(!open)}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              {open ? (
                <path d="m6 6 12 12M6 18 18 6" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
            <span>{open ? "Close" : "Menu"}</span>
          </button>
        </div>
      </div>
      <nav
        id="portfolio-menu"
        aria-label="Main navigation"
        className={`portfolio-menu ${open ? "is-open" : ""}`}
      >
        <ul>
          {navigation.map(({ href, label }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`navigation-link ${href === "/contact" ? "contact-link" : ""}`}
                  onClick={() => setOpen(false)}
                >
                  {label}
                  {href === "/contact" && <span aria-hidden="true">↗</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
