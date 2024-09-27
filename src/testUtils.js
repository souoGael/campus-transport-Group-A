import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

export const renderWithRouter = (
  ui,
  { route = "/", useMemoryRouter = false } = {}
) => {
  if (useMemoryRouter) {
    return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
  }
  return render(ui);
};
