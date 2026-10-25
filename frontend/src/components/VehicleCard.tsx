import CarArt, { kindFromCategory, PAINTS } from "./CarArt";
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

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5CF5] focus-visible:ring-offset-2";

export default function VehicleCard({ vehicle, isAdmin, onPurchase, onEdit, onDelete, onRestock }: Props) {
  const soldOut = vehicle.quantity === 0;
  const lowStock = !soldOut && vehicle.quantity <= 3;

  return (
    <article className="flex flex-col rounded-2xl p-4 transition-colors hover:bg-white">
      <div className="relative">
        <div className={`flex h-44 items-center justify-center px-2 ${soldOut ? "opacity-50 grayscale" : ""}`}>
          {vehicle.imageUrl ? (
           <img
  src={vehicle.imageUrl}
  alt=""
  className="max-h-full w-full object-contain mix-blend-multiply"
/>
          ) : (
            <CarArt
              kind={kindFromCategory(vehicle.category)}
              paint={PAINTS[vehicle.id % PAINTS.length]}
              className="w-full max-w-[280px]"
            />
          )}
        </div>

        {soldOut && (
          <span className="absolute left-0 top-0 rounded-full bg-[#0F1B33] px-3 py-1 text-xs font-medium text-white">
            Sold out
          </span>
        )}
        {lowStock && (
          <span className="absolute left-0 top-0 rounded-full bg-[#E4E9FF] px-3 py-1 text-xs font-medium text-[#2B44C8]">
            Only {vehicle.quantity} left
          </span>
        )}
      </div>

      <h3 className="mt-3 text-lg font-semibold">
        {vehicle.make} {vehicle.model}
      </h3>
      <p className="text-sm text-[#5B6880]">{vehicle.category}</p>
      <p className="mt-1 text-base font-medium tabular-nums">{money(vehicle.price)}</p>

      <button
        type="button"
        disabled={soldOut}
        onClick={() => onPurchase(vehicle.id)}
        className={`mt-4 rounded-full border border-[#0F1B33] px-4 py-2 text-sm font-semibold transition-colors hover:bg-[#0F1B33] hover:text-white disabled:cursor-not-allowed disabled:border-[#C5CCDA] disabled:text-[#9AA5B8] disabled:hover:bg-transparent disabled:hover:text-[#9AA5B8] ${focus}`}
      >
        Purchase
      </button>

      {isAdmin && (
        <div className="mt-3 flex gap-4 text-sm text-[#5B6880]">
          <button type="button" onClick={() => onEdit(vehicle)} className={`rounded hover:text-[#0F1B33] hover:underline ${focus}`}>
            Edit
          </button>
          <button type="button" onClick={() => onRestock(vehicle.id)} className={`rounded hover:text-[#0F1B33] hover:underline ${focus}`}>
            Restock
          </button>
          <button type="button" onClick={() => onDelete(vehicle.id)} className={`rounded text-[#B42318] hover:underline ${focus}`}>
            Delete
          </button>
        </div>
      )}
    </article>
  );
}