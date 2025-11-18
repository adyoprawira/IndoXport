const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:8000";

const BASIC_AUTH = process.env.NEXT_PUBLIC_BUYER_BASIC_AUTH;

export type ContaminantLimits = Record<string, number | null>;

export interface QualitySummary {
  status: string;
  result?: Record<string, number | string | null>;
  hash?: string | null;
  previous_hash?: string | null;
  created_at?: string;
}

export interface BuyerRequirement {
  id: number;
  commodity: string;
  buyer_name: string;
  min_volume: number;
  max_volume: number;
  allowed_contaminants: ContaminantLimits;
  shipping_window_start: string;
  shipping_window_end: string;
  destination_country?: string | null;
  standards: string[];
  notes?: string | null;
  status: string;
  quality_summary?: QualitySummary | null;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceBatch {
  batch_id: number;
  batch_code: string;
  species: string;
  supplier: {
    id: number | null;
    name: string;
  };
  size_range: {
    min_mm: number | null;
    max_mm: number | null;
  };
  volume_available: number;
  unit: string;
  region: string;
  country_of_origin: string;
  destination_country: string;
  harvest_date?: string | null;
  ready_date?: string | null;
  price_per_unit?: string | null;
  contaminant_mercury_ppm?: number | null;
  contaminant_cesium_ppm?: number | null;
  contaminant_ecoli_cfu?: number | null;
  quality_summary?: QualitySummary | null;
}

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

const withAuthHeaders = (headers?: HeadersInit) => {
  const finalHeaders = new Headers(headers);
  if (BASIC_AUTH && !finalHeaders.has("Authorization")) {
    finalHeaders.set("Authorization", `Basic ${BASIC_AUTH}`);
  }
  return finalHeaders;
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || "Failed to contact backend");
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

function buildQuery(params?: Record<string, string | number | null | undefined>) {
  if (!params) return "";
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    search.append(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers: withAuthHeaders(options?.headers),
  });
  return handleResponse<T>(response);
}

export async function fetchRequirements(): Promise<
  PaginatedResponse<BuyerRequirement>
> {
  return apiFetch(`/api/buyer/requirements/`);
}

export interface CreateRequirementPayload {
  commodity: string;
  buyer_name?: string;
  min_volume: number;
  max_volume: number;
  allowed_contaminants: ContaminantLimits;
  shipping_window_start: string;
  shipping_window_end: string;
  destination_country?: string;
  standards?: string[];
  notes?: string;
}

export async function createRequirement(
  payload: CreateRequirementPayload,
): Promise<BuyerRequirement> {
  return apiFetch(`/api/buyer/requirements/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function fetchMatches(
  requirementId: number,
): Promise<MarketplaceBatch[]> {
  return apiFetch(`/api/buyer/requirements/${requirementId}/matches/`);
}

export type MarketplaceFilters = Record<
  string,
  string | number | null | undefined
>;

export async function fetchMarketplace(
  filters?: MarketplaceFilters,
): Promise<PaginatedResponse<MarketplaceBatch>> {
  const query = buildQuery(filters);
  return apiFetch(`/api/buyer/marketplace/${query}`);
}
