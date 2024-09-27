import React from "react";
import { screen } from "@testing-library/react";
import App from "./App";
import { renderWithRouter } from "./testUtils";

test("renders App component", () => {
  renderWithRouter(<App />, { useMemoryRouter: false });

  // Check for a heading
  const headingElement = screen.getByRole("heading");
  expect(headingElement).toBeInTheDocument();

  // Check for a paragraph
  const paragraphElement = screen.getByRole("paragraph");
  expect(paragraphElement).toBeInTheDocument();

  // Check for a textbox
  const textboxElement = screen.getByRole("textbox");
  expect(textboxElement).toBeInTheDocument();

  // Check for a link
  const linkElement = screen.getByRole("link");
  expect(linkElement).toBeInTheDocument();

  // Check for a button
  const buttonElement = screen.getByRole("button");
  expect(buttonElement).toBeInTheDocument();

  //More will be tested as the project progress
});
