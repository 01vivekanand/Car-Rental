import { useState, type ChangeEvent, type FormEvent } from "react";
import { errorText } from "../api";
import type { Vehicle, VehicleInput } from "../types";

interface Props {
  initial?: Vehicle;
  onSubmit: (input: VehicleInput) => Promise<void>;
  onClose: () => void;
}

const fields = [
  { key: "make", label: "Make", type: "text" },
  { key: "model", label: "Model", type: "text" },
  { key: "category", label: "Category (Sedan, SUV, Truck, Electric)", type: "text" },
  { key: "price", label: "Price", type: "number" },
  { key: "quantity", label: "Quantity in stock", type: "number" },
] as const;

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5CF5] focus-visible:ring-offset-2";

export default function VehicleForm({ initial, onSubmit, onClose }: Props) {
  const [values, setValues] = useState({
    make: initial?.make ?? "",
    model: initial?.model ?? "",
    category: initial?.category ?? "",
    price: String(initial?.price ?? ""),
    quantity: String(initial?.quantity ?? 0),
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const change = (key: keyof typeof values) => (e: ChangeEvent<HTMLInputElement>) =>
    setValues({ ...values, [key]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await onSubmit({
        make: values.make.trim(),
        model: values.model.trim(),
        category: values.category.trim(),
        price: Number(values.price),
        quantity: Number(values.quantity),
      });
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-[#0F1B33]/50 p-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 text-[#0F1B33] shadow-2xl">
        <h2 className="text-xl font-semibold">{initial ? "Edit vehicle" : "Add vehicle"}</h2>

        {fields.map((f) => (
          <label key={f.key} className="block text-sm font-medium text-[#3C4A63]">
            {f.label}
            <input
              required
              type={f.type}
              min={f.type === "number" ? 0 : undefined}
              step={f.key === "price" ? "0.01" : undefined}
              value={values[f.key]}
              onChange={change(f.key)}
              className={`mt-1 w-full rounded-lg border border-[#D6DDEB] px-3 py-2.5 font-normal text-[#0F1B33] focus:border-[#3D5CF5] ${focus}`}
            />
          </label>
        ))}

        {error && <p className="rounded-lg bg-[#FDECEA] px-3 py-2 text-sm text-[#B42318]">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className={`rounded-full px-4 py-2 text-sm font-medium text-[#3C4A63] hover:bg-[#EEF1F7] ${focus}`}>
            Cancel
          </button>
          <button type="submit" disabled={busy} className={`rounded-full bg-[#3D5CF5] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2F4AD6] disabled:opacity-60 ${focus}`}>
            {busy ? "Saving..." : "Save vehicle"}
          </button>
        </div>
      </form>
    </div>
  );
}