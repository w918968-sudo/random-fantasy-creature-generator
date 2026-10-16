import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MoveList } from "./move-list";

describe("MoveList", () => {
  it("shows damaging moves and hides status moves by default", async () => {
    render(<MoveList speciesId="pikachu" />);
    expect(await screen.findByText("Thunderbolt")).toBeInTheDocument();
    // Status moves (power 0) are hidden until toggled.
    expect(screen.queryByText("Agility")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("checkbox"));
    expect(await screen.findByText("Agility")).toBeInTheDocument();
  });

  it("filters moves by name", async () => {
    render(<MoveList speciesId="pikachu" />);
    await screen.findByText("Thunderbolt");
    await userEvent.type(screen.getByRole("searchbox"), "volt tack");
    expect(await screen.findByText("Volt Tackle")).toBeInTheDocument();
    expect(screen.queryByText("Thunderbolt")).not.toBeInTheDocument();
  });
});
