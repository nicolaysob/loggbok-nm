import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/dal";
import { BrandIcon } from "@/components/brand";
import { MobileNav } from "@/components/mobile-nav";
import { outlineActionClass } from "@/lib/ui";

const headerCtaClass =
  `inline-flex min-h-11 items-center rounded-xl px-3 text-meta font-semibold ${outlineActionClass}`;

const desktopLinkClass =
  "text-meta font-medium text-navy-700 transition-colors hover:text-navy-900";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  const links = [
    { href: "/", label: "Hjem" },
    { href: "/kalender", label: "Kalender" },
    ...(user?.role === "ADMIN"
      ? [
          { href: "/uke", label: "Uken" },
          { href: "/mnd", label: "Fakturering" },
          { href: "/kunder", label: "Kunder" },
          { href: "/oppdragstyper", label: "Typer" },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b border-line/80 bg-white/95 backdrop-blur-xl">
        <div className="relative mx-auto w-full max-w-5xl">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <Link
                href="/"
                className="flex size-9 shrink-0 items-center justify-center"
                aria-label="Hjem"
              >
                <BrandIcon size={36} className="size-9" />
              </Link>
              <Link href="/" className={`${headerCtaClass} sm:hidden`}>
                Loggbok
              </Link>
              <Link href="/kalender" className={`${headerCtaClass} sm:hidden`}>
                Kalender
              </Link>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden max-w-36 truncate text-meta font-medium text-navy-700 sm:inline">
                {user?.name}
              </span>
              <form action={logout} className="hidden sm:block">
                <button
                  type="submit"
                  className={`min-h-11 rounded-xl px-3 text-meta font-semibold ${outlineActionClass}`}
                >
                  Logg ut
                </button>
              </form>
              <MobileNav links={links} />
            </div>
          </div>

          <nav className="hidden items-center gap-5 px-4 pb-3 sm:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={desktopLinkClass}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
