"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AppNavGroup } from "@/components/mobile-nav";

function linkActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNav({ groups }: { groups: AppNavGroup[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Hovedmeny"
      className="hidden border-t border-line sm:block"
    >
      <div className="flex flex-wrap items-center gap-x-1 gap-y-2 px-3 py-2">
        {groups.map((group, index) => (
          <div
            key={group.title ?? `group-${index}`}
            className="flex flex-wrap items-center gap-1"
          >
            {index > 0 && (
              <span
                aria-hidden
                className="mx-1.5 hidden h-5 w-px bg-line-strong sm:block lg:mx-2"
              />
            )}
            {group.title && (
              <span className="mr-1 px-1 text-[0.7rem] font-semibold tracking-wide text-navy-700 uppercase">
                {group.title}
              </span>
            )}
            {group.links.map((link) => {
              const active = linkActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-md px-3 py-2 text-body font-semibold transition-colors ${
                    active
                      ? "bg-brand-50 text-green-700"
                      : "text-navy-800 hover:bg-navy-50 hover:text-navy-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </nav>
  );
}
