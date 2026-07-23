import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import http from "../api/http";
import { getCatalogNames } from "../api/catalog";
import HomeDatabase from "./HomeDatabase";

jest.mock("../api/http", () => ({
  get: jest.fn(),
}));
jest.mock("../api/catalog", () => ({
  getCatalogNames: jest.fn(),
}));

let container;
let root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  http.get.mockReset();
  getCatalogNames.mockReset();
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
    await Promise.resolve();
  });
  container.remove();
});

test("keeps placeholders when the picture response has no array", async () => {
  http.get.mockResolvedValue({ data: {} });
  getCatalogNames.mockResolvedValue([]);

  await act(async () => {
    root.render(
      <MemoryRouter
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      >
        <HomeDatabase handleGet={jest.fn()} setLoading={jest.fn()} />
      </MemoryRouter>,
    );
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(container.querySelectorAll(".db2picAlt")).toHaveLength(3);
});
