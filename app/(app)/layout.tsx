import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/dal";
import { BrandIcon } from "@/components/brand";
import { MobileNav, type AppNavGroup } from "@/components/mobile-nav";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { outlineActionClass } from "@/lib/ui";

const desktopLinkClass =
  "text-meta font-medium text-navy-700 transition-colors hover:text-navy-900";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  if (user?.role === "CUSTOMER") redirect("/portal");

  const isAdmin = user?.role === "ADMIN";

  const groups: AppNavGroup[] = [
    {
      links: [
        { href: "/", label: "Hjem" },
        { href: "/kalender", label: "Kalender" },
        ...(isAdmin ? [{ href: "/ukeplan", label: "Ukeplan" }] : []),
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
      <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur-xl">
        <div className="relative mx-auto w-full max-w-5xl">
          <div className="flex h-14 items-center justify-between gap-3 px-4 sm:hidden">
            <Link
              href="/"
              className="flex min-w-0 items-center gap-2.5"
              aria-label="Loggbok hjem"
            >
              <BrandIcon size={28} className="size-7" />
              <span className="truncate text-[1.05rem] font-semibold tracking-tight text-navy-900">
                Loggbok
              </span>
            </Link>
            <MobileNav groups={groups} />
          </div>

          <div className="hidden items-center justify-between gap-3 px-4 py-2.5 sm:flex">
            <Link
              href="/"
              className="flex min-h-11 min-w-0 items-center gap-2.5"
              aria-label="Loggbok hjem"
            >
              <BrandIcon size={30} className="size-8" />
              <span className="truncate text-meta font-semibold text-navy-900">
                Loggbok
              </span>
            </Link>

            <div className="flex shrink-0 items-center gap-3">
              <span className="max-w-40 truncate text-meta text-navy-700">
                {user?.name}
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className={`min-h-10 rounded-md px-3 text-meta font-medium ${outlineActionClass}`}
                >
                  Logg ut
                </button>
              </form>
            </div>
          </div>

          <nav className="hidden flex-wrap items-center gap-x-1 gap-y-1 border-t border-line px-3 py-1.5 sm:flex">
            {groups.map((group) =>
              group.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${desktopLinkClass} rounded-md px-2.5 py-1.5`}
                >
                  {link.label}
                </Link>
              )),
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
        <PullToRefresh>{children}</PullToRefresh>
      </main>
    </div>
  );
}
