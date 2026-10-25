import { useCallback, useEffect, useMemo, useState } from "react";
import { api, errorText } from "../api";
import { useAuth } from "../auth";
import { CarRow } from "../components/CarArt";
import VehicleCard from "../components/VehicleCard";
import VehicleForm from "../components/VehicleForm";
import type { SearchFilters, Vehicle, VehicleInput } from "../types";

type Sort = "newest" | "priceAsc" | "priceDesc";

const emptyFilters: SearchFilters = { make: "", model: "", category: "", minPrice: "", maxPrice: "" };

const inputs = [
  { key: "make", placeholder: "Make" },
  { key: "model", placeholder: "Model" },
  { key: "minPrice", placeholder: "Min price" },
  { key: "maxPrice", placeholder: "Max price" },
] as const;

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5CF5] focus-visible:ring-offset-2";
const field = `rounded-lg border border-[#D6DDEB] bg-white px-3 py-2.5 text-sm placeholder:text-[#8A96AB] focus:border-[#3D5CF5] ${focus}`;

export default function Dashboard() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>(emptyFilters);
  const [sort, setSort] = useState<Sort>("newest");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [editing, setEditing] = useState<Vehicle | "new" | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await api.searchVehicles(filters);
      setVehicles(result);
      // Remember every category we've seen, so the tabs stay visible while filtering.
      setCategories((prev) => Array.from(new Set([...prev, ...result.map((v) => v.category)])).sort());
    } catch (e) {
      setMessage({ type: "error", text: errorText(e) });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Waits 300ms after typing stops, so we don't call the API on every keystroke.
  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const sorted = useMemo(() => {
    const list = [...vehicles];
    if (sort === "priceAsc") list.sort((a, b) => a.price - b.price);
    else if (sort === "priceDesc") list.sort((a, b) => b.price - a.price);
    else list.sort((a, b) => b.id - a.id);
    return list;
  }, [vehicles, sort]);

  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      setMessage({ type: "ok", text: success });
      await load();
    } catch (e) {
      setMessage({ type: "error", text: errorText(e) });
    }
  };

  const save = async (input: VehicleInput) => {
    if (editing === "new") {
      await api.createVehicle(input);
    } else if (editing) {
      await api.updateVehicle(editing.id, input);
    }
    setEditing(null);
    setMessage({ type: "ok", text: "Vehicle saved" });
    await load();
  };

  const restock = (id: number) => {
    const amount = Number(window.prompt("How many units to add?", "5"));
    if (!amount) return;
    void run(() => api.restock(id, amount), "Stock updated");
  };

  const remove = (id: number) => {
    if (window.confirm("Delete this vehicle?")) {
      void run(() => api.deleteVehicle(id), "Vehicle deleted");
    }
  };

  const tabs = ["All", ...categories];
  const hasFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="min-h-screen bg-[#F3F6FC] text-[#0F1B33]">
      <section className="relative overflow-hidden bg-gradient-to-b from-[#3A5796] via-[#8EA2D3] to-[#F3F6FC] pb-24 pt-24">
        <header className="absolute inset-x-0 top-0">
          <div className="mx-auto grid max-w-6xl grid-cols-3 items-center px-5 py-5 text-white">
            <p className="truncate text-sm text-white/85 max-sm:invisible">
              {user?.email}
              {isAdmin ? " (admin)" : ""}
            </p>
            <span className="text-center text-lg font-semibold tracking-[0.3em] sm:text-xl">MARQUE</span>
            <div className="flex items-center justify-end gap-2">
              {isAdmin && (
                <button
                  onClick={() => setEditing("new")}
                  className={`rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0F1B33] hover:bg-[#EEF1F7] ${focus}`}
                >
                  Add vehicle
                </button>
              )}
              <button
                onClick={logout}
                className={`rounded-full border border-white/60 px-4 py-2 text-sm font-medium hover:bg-white/10 ${focus}`}
              >
                Log out
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-5 text-center">
          <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">Find your car</h1>
          <p className="mt-3 text-white/85">Browse what is on the floor today.</p>
        </div>
        <CarRow className="mt-10" />
      </section>

      <section className="relative z-10 mx-auto -mt-12 max-w-6xl px-5">
        <div className="rounded-2xl bg-white p-5 shadow-xl shadow-[#3A5796]/10">
          <div className="flex flex-wrap gap-x-6 gap-y-2 border-b border-[#E6EAF3]">
            {tabs.map((tab) => {
              const active = filters.category === (tab === "All" ? "" : tab);
              return (
                <button
                  key={tab}
                  onClick={() => setFilters({ ...filters, category: tab === "All" ? "" : tab })}
                  className={`-mb-px border-b-2 pb-3 text-sm font-medium ${focus} ${
                    active ? "border-[#0F1B33] text-[#0F1B33]" : "border-transparent text-[#6B7790] hover:text-[#0F1B33]"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {inputs.map((f) => (
              <input
                key={f.key}
                type={f.key.includes("Price") ? "number" : "text"}
                min={f.key.includes("Price") ? 0 : undefined}
                placeholder={f.placeholder}
                aria-label={f.placeholder}
                value={filters[f.key]}
                onChange={(e) => setFilters({ ...filters, [f.key]: e.target.value })}
                className={field}
              />
            ))}
            <button
              type="button"
              onClick={() => void load()}
              className={`rounded-lg bg-[#3D5CF5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2F4AD6] ${focus}`}
            >
              Search
            </button>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-5 pb-16 pt-8">
        <div className="mb-4 flex items-center justify-between gap-3 text-sm">
          <p className="text-[#5B6880]">
            {sorted.length} {sorted.length === 1 ? "vehicle" : "vehicles"}
            {hasFilters && (
              <button onClick={() => setFilters(emptyFilters)} className={`ml-3 rounded font-medium text-[#3D5CF5] hover:underline ${focus}`}>
                Clear filters
              </button>
            )}
          </p>
          <label className="flex items-center gap-2 text-[#5B6880]">
            Sort by
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className={`rounded-lg border border-[#D6DDEB] bg-white px-3 py-1.5 text-[#0F1B33] ${focus}`}
            >
              <option value="newest">Newest</option>
              <option value="priceAsc">Price, low to high</option>
              <option value="priceDesc">Price, high to low</option>
            </select>
          </label>
        </div>

        {message && (
          <div
            className={`mb-4 flex items-center justify-between rounded-lg px-4 py-3 text-sm ${
              message.type === "ok" ? "bg-[#E6F4EC] text-[#1B6B3A]" : "bg-[#FDECEA] text-[#B42318]"
            }`}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} aria-label="Dismiss message" className={`rounded px-1 ${focus}`}>
              ✕
            </button>
          </div>
        )}

        {loading ? (
          <p className="py-20 text-center text-[#5B6880]">Loading vehicles...</p>
        ) : sorted.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg font-medium">No vehicles match your search.</p>
            <p className="mt-1 text-[#5B6880]">Try a wider price range or clear a filter.</p>
          </div>
        ) : (
          <div className="grid gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                isAdmin={isAdmin}
                onPurchase={(id) => void run(() => api.purchase(id), `Purchased ${v.make} ${v.model}`)}
                onEdit={setEditing}
                onDelete={remove}
                onRestock={restock}
              />
            ))}
          </div>
        )}
      </main>

      {editing && (
        <VehicleForm
          initial={editing === "new" ? undefined : editing}
          onSubmit={save}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}