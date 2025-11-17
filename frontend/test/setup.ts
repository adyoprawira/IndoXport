import "@testing-library/jest-dom";
import React from "react";
import { vi } from "vitest";

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ComponentProps<"img">) =>
    React.createElement("img", { ...props }),
}));
