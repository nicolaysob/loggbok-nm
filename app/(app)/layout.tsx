import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/dal";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between gap-4 border-b-2 border-neutral-900 bg-white px-4 py-3 text-neutral-950">
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-base font-semibold">
            Loggbok
          </Link>
          {user?.role === "ADMIN" && (
            <Link
              href="/kunder"
              className="text-base underline underline-offset-2"
            >
              Kunder
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <span className="truncate text-sm text-neutral-700">{user?.name}</span>
          <form action={logout}>
            <button
              type="submit"
              className="min-h-12 rounded-xl border-2 border-neutral-900 px-4 text-base font-medium active:bg-neutral-100"
            >
              Logg ut
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
