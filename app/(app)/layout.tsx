import { logout } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/dal";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-black/10 px-4 py-3">
        <span className="truncate text-base font-semibold">{user?.name}</span>
        <form action={logout}>
          <button
            type="submit"
            className="min-h-12 rounded-xl border border-black/20 px-4 text-base font-medium active:bg-black/5"
          >
            Logg ut
          </button>
        </form>
      </header>
      <main className="flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
