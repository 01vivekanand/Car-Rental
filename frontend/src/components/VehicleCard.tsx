import type { Vehicle } from "../types";

interface Props {
  vehicle: Vehicle;
  isAdmin: boolean;
  onPurchase: (id: number) => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: number) => void;
  onRestock: (id: number) => void;
}

const money = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function VehicleCard({ vehicle, isAdmin, onPurchase, onEdit, onDelete, onRestock }: Props) {
  const soldOut = vehicle.quantity === 0;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/70 shadow-lg transition hover:-translate-y-1 hover:border-emerald-500/50">
      <div className="flex h-28 items-center justify-center bg-gradient-to-br from-emerald-500/30 via-sky-500/20 to-slate-800 text-5xl">
        🚗
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-white">{vehicle.make} {vehicle.model}</h3>
            <span className="mt-1 inline-block rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-medium text-sky-300">
              {vehicle.category}
            </span>
          </div>
          <p className="text-lg font-bold text-emerald-400">{money(vehicle.price)}</p>
        </div>

        <p className={`text-sm ${soldOut ? "font-medium text-rose-400" : "text-slate-400"}`}>
          {soldOut ? "Out of stock" : `${vehicle.quantity} in stock`}
        </p>

        <button
          type="button"
          disabled={soldOut}
          onClick={() => onPurchase(vehicle.id)}
          className="mt-auto rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
        >
          Purchase
        </button>

        {isAdmin && (
          <div className="grid grid-cols-3 gap-2 border-t border-slate-700 pt-3 text-sm">
            <button type="button" onClick={() => onEdit(vehicle)} className="rounded-md bg-slate-700 py-1.5 text-slate-200 hover:bg-slate-600">
              Edit
            </button>
            <button type="button" onClick={() => onRestock(vehicle.id)} className="rounded-md bg-slate-700 py-1.5 text-slate-200 hover:bg-slate-600">
              Restock
            </button>
            <button type="button" onClick={() => onDelete(vehicle.id)} className="rounded-md bg-rose-500/20 py-1.5 text-rose-300 hover:bg-rose-500/30">
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}