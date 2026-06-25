import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/SiteHeader";
import { formatPrice, statusBadgeClass } from "@/lib/format";

type Product = {
  id: string;
  title: string;
  price: number;
  status: string;
  created_at: string;
};

export default async function ProductsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: products } = await supabase
    .from("products")
    .select("id, title, price, status, created_at")
    .order("created_at", { ascending: false });

  const list = (products ?? []) as Product[];

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">판매 중인 물건</h1>
          {user && (
            <Link
              href="/products/new"
              className="rounded-lg bg-sweet px-4 py-2 text-sm font-semibold text-white transition hover:bg-sweet-dark"
            >
              + 글쓰기
            </Link>
          )}
        </div>

        {list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 py-16 text-center text-foreground/50">
            아직 올라온 물건이 없어요. 첫 번째 판매글을 올려보세요! 🍠
          </div>
        ) : (
          <ul className="space-y-3">
            {list.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/products/${p.id}`}
                  className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition hover:ring-sweet/40"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(p.status)}`}
                      >
                        {p.status}
                      </span>
                      <h2 className="truncate font-semibold">{p.title}</h2>
                    </div>
                    <p className="mt-1 text-sm font-bold text-sweet-dark">
                      {formatPrice(p.price)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
