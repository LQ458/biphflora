import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import App from "./App";

jest.mock("react-player", () => () => null);

jest.mock("axios", () => ({
  defaults: {},
  get: jest.fn().mockResolvedValue({ data: {} }),
  post: jest.fn(),
}));

let container;
let root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  axios.get.mockReset();
  axios.get.mockResolvedValue({ data: {} });
  axios.post.mockReset();
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
    await Promise.resolve();
  });
  container.remove();
});

async function renderAt(pathname) {
  await act(async () => {
    root.render(
      <MemoryRouter
        initialEntries={[pathname]}
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      >
        <App />
      </MemoryRouter>,
    );
    await Promise.resolve();
    await Promise.resolve();
  });
}

test("renders the login route without a network dependency", async () => {
  await renderAt("/KQsfhwifheKDFJfkdfjdkfjd3q3puod0d0");

  expect(container.querySelector("h2").textContent).toBe("Login");
  expect(axios.get).toHaveBeenCalled();
});

test("renders the not-found route", async () => {
  await renderAt("/route-that-does-not-exist");

  expect(container.querySelector(".notFoundTitle").textContent).toBe("404");
});
