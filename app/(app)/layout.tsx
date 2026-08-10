import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/dal";
import { BrandIcon } from "@/components/brand";
import { MobileNav, type AppNavGroup } from "@/components/mobile-nav";
import { outlineActionClass } from "@/lib/ui";

const desktopLinkClass =
  "text-meta font-medium text-navy-700 transition-colors hover:text-navy-900";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN";

  const groups: AppNavGroup[] = [
    {
      links: [
        { href: "/", label: "Hjem" },
        { href: "/kalender", label: "Kalender" },
        ...(!isAdmin && user?.payType === "HOURLY"
          ? [{ href: "/timeliste", label: "Timeliste" }]
          : []),
      ],
    },
    ...(isAdmin
      ? [
          {
            title: "Økonomi",
            links: [
              { href: "/lonn", label: "Lønn" },
              { href: "/uke", label: "Uken" },
              { href: "/mnd", label: "Fakturering" },
            ],
          },
          {
            title: "Oppsett",
            links: [
              { href: "/kunder", label: "Kunder" },
              { href: "/brukere", label: "Brukere" },
              { href: "/oppdragstyper", label: "Typer" },
            ],
          },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-white/95 backdrop-blur-xl">
        <div className="relative mx-auto w-full max-w-5xl">
          {/* Mobil: ren app-header — logo, tittel, meny */}
          <div className="flex h-14 items-center justify-between gap-3 px-4 sm:hidden">
            <Link
              href="/"
              className="flex min-w-0 items-center gap-2.5"
              aria-label="Loggbok hjem"
            >
              <BrandIcon size={32} className="size-8" />
              <span className="truncate text-heading tracking-tight text-navy-900">
                Loggbok
              </span>
            </Link>
            <MobileNav groups={groups} />
          </div>

          {/* Desktop */}
          <div className="hidden items-center justify-between gap-3 px-4 py-2.5 sm:flex">
            <Link
              href="/"
              className="flex min-h-11 min-w-0 items-center gap-2"
              aria-label="Loggbok hjem"
            >
              <BrandIcon size={36} className="size-9" />
              <span className="truncate text-meta font-medium text-navy-700">
                Loggbok
              </span>
            </Link>

            <div className="flex shrink-0 items-center gap-2">
              <span className="max-w-36 truncate text-meta font-medium text-navy-700">
                {user?.name}
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className={`min-h-11 rounded-xl px-3 text-meta font-semibold ${outlineActionClass}`}
                >
                  Logg ut
                </button>
              </form>
            </div>
          </div>

          <nav className="hidden flex-wrap items-center gap-x-5 gap-y-2 px-4 pb-3 sm:flex">
            {groups.map((group, index) => (
              <div
                key={group.title ?? "main"}
                className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${
                  index > 0 ? "border-l border-line pl-5" : ""
                }`}
              >
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={desktopLinkClass}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5 sm:py-8">
        {children}
      </main>
    </div>
  );
}
