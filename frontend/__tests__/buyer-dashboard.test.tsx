import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import BuyerDashboard from "@/components/BuyerDashboard";

const requirementRecord = {
  id: 1,
  buyer_name: "Ocean Freight Export",
  product_type: "coffee",
  volume_required: 1200,
  allowed_contaminants: { total_ppm: 20 },
  shipping_window_start: "2025-12-01",
  shipping_window_end: "2025-12-10",
  status: "OPEN",
  quality_status: "PASS",
  latest_qc_hash: "abc",
};

const matchResults = [
  {
    id: "COF-001",
    supplier: "Bali Harvest",
    product_type: "coffee",
    available_volume: 1500,
    contaminant_ppm: 12.5,
    origin: "Bali Highlands",
    qc_status: "PASS",
  },
];

const documentPack = {
  quality_status: "PASS",
  quality_hash: "deadbeef",
  documents: {
    commercial_invoice: "Invoice for Ocean Freight Export",
    certificate_of_origin: "Certified origin: Indonesia",
    health_certificate: "QC hash: deadbeef",
  },
};

describe("BuyerDashboard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    delete (globalThis as any).fetch;
  });

  it("renders requirements loaded from the API", async () => {
    (globalThis as any).fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ results: [requirementRecord] }),
      })
    );

    render(<BuyerDashboard />);

    expect(await screen.findByText("Ocean Freight Export")).toBeDefined();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/requirements/"
    );
  });

  it("shows matches when the user requests them", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation((input: RequestInfo) => {
        if (typeof input === "string" && input.includes("/matches/")) {
          return Promise.resolve({
            ok: true,
            json: async () => matchResults,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ results: [requirementRecord] }),
        });
      });

    (globalThis as any).fetch = fetchMock;

    render(<BuyerDashboard />);
    await screen.findByText("Ocean Freight Export");
    await userEvent.click(
      screen.getByRole("button", { name: /view matches/i })
    );

    expect(await screen.findByText(/Bali Harvest/)).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/api/requirements/1/matches/"
    );
  });

  it("reveals document preview after revalidation", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation((input: RequestInfo) => {
        if (typeof input === "string" && input.includes("/revalidate/")) {
          return Promise.resolve({
            ok: true,
            json: async () => documentPack,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ results: [requirementRecord] }),
        });
      });

    (globalThis as any).fetch = fetchMock;

    render(<BuyerDashboard />);
    await screen.findByText("Ocean Freight Export");
    await userEvent.click(
      screen.getByRole("button", { name: /revalidate qc/i })
    );

    expect(
      await screen.findByText(/Invoice for Ocean Freight Export/)
    ).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/api/requirements/1/revalidate/",
      { method: "POST" }
    );
  });
});
