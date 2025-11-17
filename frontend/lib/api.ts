const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:8000";

export interface BuyerRequirement {
  id: number;
  buyer_name: string;
  product_type: string;
  volume_required: number;
  allowed_contaminants: Record<string, number>;
  shipping_window_start: string;
  shipping_window_end: string;
  status: string;
  quality_status?: string | null;
  latest_qc_hash?: string | null;
}

export interface RequirementListResponse {
  results: BuyerRequirement[];
}

export interface SupplierMatch {
  id: string;
  supplier: string;
  product_type: string;
  available_volume: number;
  contaminant_ppm: number;
  origin: string;
  qc_status: string;
}

export interface RevalidationPayload {
  quality_status: string;
  quality_hash: string;
  documents: Record<string, string>;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || "Failed to contact backend");
  }

  return (await response.json()) as T;
}

export async function fetchRequirements(): Promise<RequirementListResponse> {
  const response = await fetch(`${API_BASE}/api/requirements/`);
  return handleResponse(response);
}

export async function createRequirement(
  payload: Partial<BuyerRequirement> & {
    shipping_window_start: string;
    shipping_window_end: string;
  }
): Promise<BuyerRequirement> {
  const response = await fetch(`${API_BASE}/api/requirements/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function fetchMatches(
  requirementId: number
): Promise<SupplierMatch[]> {
  const response = await fetch(
    `${API_BASE}/api/requirements/${requirementId}/matches/`
  );
  return handleResponse(response);
}

export async function revalidateRequirement(
  requirementId: number
): Promise<RevalidationPayload> {
  const response = await fetch(
    `${API_BASE}/api/requirements/${requirementId}/revalidate/`,
    {
      method: "POST",
    }
  );
  return handleResponse(response);
}
