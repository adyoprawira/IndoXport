import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import BuyerDashboard from "@/components/BuyerDashboard";

const requirementRecord = {
  id: 1,
  commodity: "black tiger shrimp",
  buyer_name: "Ocean Freight Export",
  min_volume: 500,
  max_volume: 1200,
  allowed_contaminants: { mercury: 0.4, total_ppm: 1 },
  shipping_window_start: "2025-12-01",
  shipping_window_end: "2025-12-10",
  destination_country: "JP",
  standards: ["EU"],
  notes: "Frozen shipment only",
  status: "OPEN",
  quality_summary: {
    status: "PASS",
    result: { contaminant_ppm: 0.31, threshold_ppm: 0.9 },
    hash: "abc123",
    previous_hash: "",
    created_at: "2025-11-17T10:00:00Z",
  },
  created_at: "2025-11-15T10:00:00Z",
  updated_at: "2025-11-15T10:00:00Z",
};

const matchResults = [
  {
    batch_id: 42,
    batch_code: "BT-001",
    species: "black tiger shrimp",
    supplier: { id: 1, name: "Bali Harvest" },
    size_range: { min_mm: 12, max_mm: 18 },
    volume_available: 1400,
    unit: "kg",
    region: "Bali",
    country_of_origin: "ID",
    destination_country: "JP",
    harvest_date: "2025-11-10",
    ready_date: "2025-11-25",
    price_per_unit: "5200",
    contaminant_mercury_ppm: 0.3,
    contaminant_cesium_ppm: 0.2,
    contaminant_ecoli_cfu: 120,
    quality_summary: null,
  },
];

describe("BuyerDashboard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    delete (globalThis as any).fetch;
  });

  it("renders requirements loaded from the API", async () => {
    (globalThis as any).fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ count: 1, next: null, previous: null, results: [requirementRecord] }),
    });

    render(<BuyerDashboard />);

    expect(await screen.findByText("Ocean Freight Export")).toBeDefined();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/buyer/requirements/",
      expect.objectContaining({ credentials: "include" })
    );
  });

  it("shows matches when the user requests them", async () => {
    const fetchMock = vi.fn().mockImplementation((input: RequestInfo) => {
      if (typeof input === "string" && input.includes("/matches/")) {
        return Promise.resolve({
          ok: true,
          json: async () => matchResults,
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ count: 1, next: null, previous: null, results: [requirementRecord] }),
      });
    });

    (globalThis as any).fetch = fetchMock;

    render(<BuyerDashboard />);
    await screen.findByText("Ocean Freight Export");
    await userEvent.click(screen.getByRole("button", { name: /view matches/i }));

    expect(await screen.findByText(/Bali Harvest/)).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/api/buyer/requirements/1/matches/",
      expect.objectContaining({ credentials: "include" })
    );
  });

  it("shows QC summary data when available", async () => {
    (globalThis as any).fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ count: 1, next: null, previous: null, results: [requirementRecord] }),
    });

    render(<BuyerDashboard />);
    await screen.findByText("Ocean Freight Export");

    expect(screen.getByText(/QC summary/i)).toBeTruthy();
    expect(screen.getByText(/abc123/)).toBeTruthy();
    expect(screen.getByText(/contaminant ppm/i)).toBeTruthy();
  });
});
