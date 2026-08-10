"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { outlineActionClass, solidActionClass } from "@/lib/ui";

export type AppNavLink = {
  href: string;
  label: string;
};

export type AppNavGroup = {
  title?: string;
  links: AppNavLink[];
};

export function MobileNav({ groups }: { groups: AppNavGroup[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobilmeny"
        onClick={() => setOpen((value) => !value)}
        className="flex size-11 items-center justify-center rounded-xl text-navy-900 active:bg-navy-50"
      >
        <span className="sr-only">{open ? "Lukk meny" : "Åpne meny"}</span>
        <span aria-hidden className="flex flex-col gap-1.5">
          <span
            className={`block h-0.5 w-5 rounded-full bg-navy-900 transition ${
              open ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-navy-900 transition ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-navy-900 transition ${
              open ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Lukk meny"
            className="fixed inset-0 z-40 bg-navy-900/25"
            onClick={() => setOpen(false)}
          />
          <div
            id="mobilmeny"
            className="absolute inset-x-0 top-full z-50 max-h-[min(85dvh,40rem)] overflow-y-auto border-b border-line bg-white px-4 py-3 shadow-card"
          >
            <nav className="flex flex-col gap-4">
              {groups.map((group) => (
                <div key={group.title ?? group.links[0]?.href} className="flex flex-col gap-2">
                  {group.title && (
                    <p className="px-1 text-meta font-semibold uppercase tracking-wide text-navy-700">
                      {group.title}
                    </p>
                  )}
                  {group.links.map((link) => {
                    const active =
                      link.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex min-h-14 items-center justify-center rounded-xl px-4 text-body font-semibold ${
                          active ? solidActionClass : outlineActionClass
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            <form
              action={logout}
              className="mt-4 border-t border-line pt-3"
            >
              <button
                type="submit"
                className={`flex min-h-14 w-full items-center justify-center rounded-xl px-4 text-body font-semibold ${outlineActionClass}`}
              >
                Logg ut
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
