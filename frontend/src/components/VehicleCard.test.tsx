import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import VehicleCard from "./VehicleCard";

const camry = {
  id: 1,
  make: "Toyota",
  model: "Camry",
  category: "Sedan",
  price: 28500,
  quantity: 3,
};

const handlers = () => ({
  onPurchase: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onRestock: vi.fn(),
});

describe("VehicleCard", () => {
  it("disables the Purchase button when quantity is zero", () => {
    render(<VehicleCard vehicle={{ ...camry, quantity: 0 }} isAdmin={false} {...handlers()} />);

    expect(screen.getByRole("button", { name: /purchase/i })).toBeDisabled();
  });

  it("calls onPurchase with the vehicle id when in stock", () => {
    const h = handlers();
    render(<VehicleCard vehicle={camry} isAdmin={false} {...h} />);

    fireEvent.click(screen.getByRole("button", { name: /purchase/i }));

    expect(h.onPurchase).toHaveBeenCalledWith(1);
  });

  it("hides admin controls from normal users", () => {
    render(<VehicleCard vehicle={camry} isAdmin={false} {...handlers()} />);

    expect(screen.queryByRole("button", { name: /delete/i })).toBeNull();
  });

  it("shows admin controls to admins", () => {
    render(<VehicleCard vehicle={camry} isAdmin {...handlers()} />);

    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /restock/i })).toBeInTheDocument();
  });
});