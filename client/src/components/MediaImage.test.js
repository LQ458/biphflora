import { act } from "react";
import { createRoot } from "react-dom/client";
import MediaImage from "./MediaImage";

let container;
let root;
let updateRoot;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  updateRoot = root.render.bind(root);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

test("tries a fallback once and then renders a stable failure state", () => {
  act(() => {
    updateRoot(
      <MediaImage
        src="/public/compressed/example.jpg"
        fallbackSrc="/public/example.jpg"
        failedContent={<span data-testid="missing-image">Unavailable</span>}
        alt="example"
      />,
    );
  });

  let image = container.querySelector("img");
  expect(image.getAttribute("src")).toBe("/public/compressed/example.jpg");

  act(() => image.dispatchEvent(new Event("error", { bubbles: true })));
  image = container.querySelector("img");
  expect(image.getAttribute("src")).toBe("/public/example.jpg");

  act(() => image.dispatchEvent(new Event("error", { bubbles: true })));
  expect(container.querySelector("img")).toBeNull();
  expect(
    container.querySelector('[data-testid="missing-image"]'),
  ).not.toBeNull();
});

test("defaults details to lazy loading while allowing eager images", () => {
  act(() => {
    updateRoot(<MediaImage src="/public/detail.jpg" alt="detail" />);
  });

  let image = container.querySelector("img");
  expect(image.getAttribute("loading")).toBe("lazy");
  expect(image.getAttribute("decoding")).toBe("async");

  act(() => {
    updateRoot(
      <MediaImage src="/public/visible.jpg" alt="visible" loading="eager" />,
    );
  });

  image = container.querySelector("img");
  expect(image.getAttribute("loading")).toBe("eager");
});

test("clears responsive candidates and tries each legacy fallback", () => {
  act(() => {
    updateRoot(
      <MediaImage
        src="/public/variants/v1/1600/plantspic/example.jpg.webp"
        srcSet="/small.webp 480w, /large.webp 1600w"
        fallbackSrc={[
          "/public/compressed/plantspic/example.jpg",
          "/public/plantspic/example.jpg",
        ]}
        alt="responsive"
      />,
    );
  });

  let image = container.querySelector("img");
  expect(image.getAttribute("srcset")).toContain("/small.webp");

  act(() => image.dispatchEvent(new Event("error", { bubbles: true })));
  image = container.querySelector("img");
  expect(image.getAttribute("src")).toBe(
    "/public/compressed/plantspic/example.jpg",
  );
  expect(image.getAttribute("srcset")).toBe(null);

  act(() => image.dispatchEvent(new Event("error", { bubbles: true })));
  image = container.querySelector("img");
  expect(image.getAttribute("src")).toBe("/public/plantspic/example.jpg");
});
