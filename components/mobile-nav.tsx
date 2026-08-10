"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { outlineActionClass } from "@/lib/ui";

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
        className="flex size-11 items-center justify-center rounded-md text-navy-900 active:bg-navy-50"
      >
        <span className="sr-only">{open ? "Lukk meny" : "Åpne meny"}</span>
        <span aria-hidden className="flex flex-col gap-1.5">
          <span
            className={`block h-0.5 w-5 bg-navy-900 transition ${
              open ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-navy-900 transition ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-navy-900 transition ${
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
            className="fixed inset-0 z-40 bg-navy-900/20"
            onClick={() => setOpen(false)}
          />
          <div
            id="mobilmeny"
            className="absolute inset-x-0 top-full z-50 max-h-[min(85dvh,40rem)] overflow-y-auto border-b border-line bg-white px-3 py-3"
          >
            <nav className="flex flex-col gap-4">
              {groups.map((group) => (
                <div
                  key={group.title ?? group.links[0]?.href}
                  className="flex flex-col"
                >
                  {group.title && (
                    <p className="px-3 pb-1.5 pt-1 text-meta font-medium text-navy-700">
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
                        className={`flex min-h-12 items-center border-l-2 px-3 text-body ${
                          active
                            ? "border-brand bg-brand-50 font-semibold text-navy-900"
                            : "border-transparent font-medium text-navy-800 active:bg-navy-50"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            <form action={logout} className="mt-3 border-t border-line pt-3">
              <button
                type="submit"
                className={`flex min-h-12 w-full items-center justify-center rounded-md px-4 text-body font-medium ${outlineActionClass}`}
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
