import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { requireCustomer } from "@/lib/dal";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { outlineActionClass } from "@/lib/ui";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireCustomer();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <main className="mx-auto w-full max-w-lg flex-1 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-8">
        <PullToRefresh>{children}</PullToRefresh>
      </main>

      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-3 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <form action={logout} className="w-full">
          <button
            type="submit"
            className={`flex min-h-14 w-full items-center justify-center rounded-md px-4 text-body font-medium ${outlineActionClass}`}
          >
            Logg ut
          </button>
        </form>
        <Link
          href="/personvern"
          className="text-meta font-medium text-navy-700"
        >
          Personvern
        </Link>
      </div>
    </div>
  );
}
