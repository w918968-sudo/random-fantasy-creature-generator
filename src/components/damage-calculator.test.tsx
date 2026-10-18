import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DamageCalculator } from "./damage-calculator";

describe("DamageCalculator", () => {
  it("renders the attacker/defender form", () => {
    render(<DamageCalculator initialAttacker={null} onClose={() => {}} />);
    expect(screen.getByRole("dialog", { name: "Damage calculator" })).toBeInTheDocument();
    expect(screen.getByText("Attacker")).toBeInTheDocument();
    expect(screen.getByText("Defender")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Calculate" })).toBeInTheDocument();
  });

  it("asks for an attacker and defender before calculating", async () => {
    render(<DamageCalculator initialAttacker={null} onClose={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Calculate" }));
    expect(screen.getByText("Choose an attacker and a defender first.")).toBeInTheDocument();
  });
});
