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

// exporter apis

export interface ExporterRequirement extends BuyerRequirement {
  buyer: { username: string };
}

export interface ExporterBatch {
  id: number;
  batch_number: string;
  product_name: string;
  quantity: number;
  price_per_unit: number;
  qc_status: string;
  qc_results: Record<string, number>;
}

export interface BatchMatch {
  id: number;
  batch: ExporterBatch;
  requirement: ExporterRequirement;
  match_score: number;
  is_compatible: boolean;
  match_details: Record<string, boolean>;
}

export interface Deal {
  id: number;
  buyer_requirement: ExporterRequirement;
  product_batch: ExporterBatch;
  status: string;
  quantity: number;
  total_price: number;
  created_at: string;
}

export interface CreateDealPayload {
  buyer_requirement: number;
  product_batch: number;
  quantity: number;
  total_price: number;
  notes?: string;
}

// DUMMY DATA
const DUMMY_REQUIREMENTS: ExporterRequirement[] = [
  {
    id: 1,
    commodity: 'Vannamei Shrimp',
    buyer_name: 'Premium Seafood USA',
    buyer: { username: 'premium_usa' },
    min_volume: 2000,
    max_volume: 5000,
    allowed_contaminants: { 
      salmonella: 0, 
      vibrio: 0, 
      mercury: 0.5,
      cadmium: 0.1,
      antibiotic_residue: 0
    },
    shipping_window_start: '2025-12-01',
    shipping_window_end: '2025-12-31',
    destination_country: 'United States',
    standards: ['HACCP', 'FDA', 'BAP', 'ASC'],
    notes: 'Premium quality frozen Vannamei shrimp (16/20 count). HACCP certified required. Zero antibiotic policy.',
    status: 'active',
    created_at: '2025-11-15T10:00:00Z',
    updated_at: '2025-11-15T10:00:00Z',
  },
  {
    id: 2,
    commodity: 'Black Tiger Shrimp',
    buyer_name: 'European Delicacies GmbH',
    buyer: { username: 'euro_delicacies' },
    min_volume: 1500,
    max_volume: 3000,
    allowed_contaminants: { 
      salmonella: 0,
      listeria: 0,
      mercury: 0.3,
      lead: 0.5,
      cadmium: 0.05
    },
    shipping_window_start: '2025-11-25',
    shipping_window_end: '2025-12-25',
    destination_country: 'Germany',
    standards: ['EU Organic', 'MSC', 'HACCP', 'IFS Food'],
    notes: 'Wild-caught Black Tiger shrimp (21/25 count). EU organic certification mandatory. Sustainable fishing proof required.',
    status: 'active',
    created_at: '2025-11-10T08:00:00Z',
    updated_at: '2025-11-10T08:00:00Z',
  },
  {
    id: 3,
    commodity: 'Vannamei Shrimp',
    buyer_name: 'Tokyo Fresh Market Co.',
    buyer: { username: 'tokyo_fresh' },
    min_volume: 1000,
    max_volume: 2500,
    allowed_contaminants: { 
      salmonella: 0,
      vibrio: 0,
      mercury: 0.4,
      antibiotic_residue: 0,
      heavy_metals: 0.1
    },
    shipping_window_start: '2025-11-20',
    shipping_window_end: '2026-01-15',
    destination_country: 'Japan',
    standards: ['JAS', 'HACCP', 'BAP'],
    notes: 'Sushi-grade Vannamei shrimp (26/30 count). Ultra-fresh, blast frozen. Japanese quality standards.',
    status: 'active',
    created_at: '2025-11-12T14:00:00Z',
    updated_at: '2025-11-12T14:00:00Z',
  },
  {
    id: 4,
    commodity: 'Vannamei Shrimp',
    buyer_name: 'Middle East Seafood Trading',
    buyer: { username: 'me_seafood' },
    min_volume: 3000,
    max_volume: 6000,
    allowed_contaminants: { 
      salmonella: 0,
      ecoli: 0,
      mercury: 0.5,
      antibiotic_residue: 0
    },
    shipping_window_start: '2025-12-10',
    shipping_window_end: '2026-01-31',
    destination_country: 'United Arab Emirates',
    standards: ['HACCP', 'Halal', 'ISO 22000'],
    notes: 'Halal-certified Vannamei shrimp (31/40 count). Bulk frozen blocks. Halal certificate required.',
    status: 'active',
    created_at: '2025-11-14T11:00:00Z',
    updated_at: '2025-11-14T11:00:00Z',
  },
];

const DUMMY_BATCHES: ExporterBatch[] = [
  {
    id: 1,
    batch_number: 'VNM-JTB-2025-001',
    product_name: 'Vannamei Shrimp',
    quantity: 4500,
    price_per_unit: 12.50,
    qc_status: 'passed',
    qc_results: { 
      salmonella: 0, 
      vibrio: 0,
      mercury: 0.02, 
      cadmium: 0.01,
      antibiotic_residue: 0,
    },
  },
  {
    id: 2,
    batch_number: 'BTG-LMP-2025-003',
    product_name: 'Black Tiger Shrimp',
    quantity: 2800,
    price_per_unit: 18.00,
    qc_status: 'passed',
    qc_results: { 
      salmonella: 0,
      listeria: 0,
      mercury: 0.015,
      lead: 0.08,
      cadmium: 0.012,
    },
  },
  {
    id: 3,
    batch_number: 'VNM-SRY-2025-012',
    product_name: 'Vannamei Shrimp',
    quantity: 2000,
    price_per_unit: 13.80,
    qc_status: 'passed',
    qc_results: { 
      salmonella: 0,
      vibrio: 0,
      mercury: 0.018,
      antibiotic_residue: 0,
      heavy_metals: 0.02,
    },
  },
  {
    id: 4,
    batch_number: 'VNM-JTB-2025-008',
    product_name: 'Vannamei Shrimp',
    quantity: 5200,
    price_per_unit: 11.20,
    qc_status: 'passed',
    qc_results: { 
      salmonella: 0,
      ecoli: 0,
      mercury: 0.025,
      antibiotic_residue: 0,
    },
  },
  {
    id: 5,
    batch_number: 'VNM-BDG-2025-005',
    product_name: 'Vannamei Shrimp',
    quantity: 3800,
    price_per_unit: 12.00,
    qc_status: 'passed',
    qc_results: { 
      salmonella: 0,
      vibrio: 0,
      mercury: 0.019,
      cadmium: 0.008,
      antibiotic_residue: 0,
    },
  },
  {
    id: 6,
    batch_number: 'BTG-ACH-2025-002',
    product_name: 'Black Tiger Shrimp',
    quantity: 1800,
    price_per_unit: 19.50,
    qc_status: 'passed',
    qc_results: { 
      salmonella: 0,
      listeria: 0,
      mercury: 0.012,
      lead: 0.05,
      cadmium: 0.009,
    },
  },
  {
    id: 7,
    batch_number: 'VNM-SRY-2025-015',
    product_name: 'Vannamei Shrimp',
    quantity: 1500,
    price_per_unit: 14.50,
    qc_status: 'passed',
    qc_results: { 
      salmonella: 0,
      vibrio: 0,
      mercury: 0.016,
      antibiotic_residue: 0,
      heavy_metals: 0.018,
    },
  },
  {
    id: 8,
    batch_number: 'VNM-JTB-2025-011',
    product_name: 'Vannamei Shrimp',
    quantity: 4000,
    price_per_unit: 11.80,
    qc_status: 'passed',
    qc_results: { 
      salmonella: 0,
      ecoli: 0,
      mercury: 0.022,
      antibiotic_residue: 0,
    },
  },
];

let DUMMY_DEALS: Deal[] = [];
let dealIdCounter = 1;

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch all active buyer requirements for exporters (DUMMY)
export async function fetchExporterRequirements(): Promise<ExporterRequirement[]> {
  await delay(500); // Simulate network delay
  return Promise.resolve([...DUMMY_REQUIREMENTS]);
}

// Calculate match score between batch and requirement
function calculateMatch(batch: ExporterBatch, requirement: ExporterRequirement): BatchMatch {
  let score = 0;
  const details: Record<string, boolean> = {};

  // Check product type (must match exactly for shrimp varieties)
  if (batch.product_name.toLowerCase() === requirement.commodity.toLowerCase()) {
    score += 25;
    details.product_match = true;
  } else {
    details.product_match = false;
  }

  // Check quantity availability
  if (batch.quantity >= requirement.min_volume) {
    score += 20;
    details.quantity_sufficient = true;
  } else {
    details.quantity_sufficient = false;
  }

  // Check contamination levels (critical for food safety)
  let contaminantPass = true;
  for (const [contaminant, threshold] of Object.entries(requirement.allowed_contaminants)) {
    const batchLevel = batch.qc_results[contaminant] ?? 0;
    if (threshold !== null && batchLevel > threshold) {
      contaminantPass = false;
      break;
    }
  }
  
  if (contaminantPass) {
    score += 35;
    details.contamination_pass = true;
  } else {
    details.contamination_pass = false;
  }

  // Check certifications (important for international trade)
  let certificationMatch = false;
  if (requirement.standards.includes('HACCP')) {
    certificationMatch = true;
    details.haccp_certified = true;
  }
  if (requirement.standards.includes('Halal') && batch.qc_results.halal_certified) {
    certificationMatch = true;
    details.halal_certified = true;
  }
  if (requirement.standards.includes('MSC') && batch.qc_results.msc_certified) {
    certificationMatch = true;
    details.msc_certified = true;
  }
  if (requirement.standards.includes('BAP') && batch.qc_results.bap_certified) {
    certificationMatch = true;
    details.bap_certified = true;
  }
  
  if (certificationMatch) {
    score += 20;
  }

  const is_compatible = score >= 65;

  return {
    id: Math.floor(Math.random() * 10000),
    batch,
    requirement,
    match_score: score,
    is_compatible,
    match_details: details,
  };
}

// Find matching batches for a specific requirement (DUMMY)
export async function findBatchMatches(requirementId: number): Promise<BatchMatch[]> {
  await delay(800);
  
  const requirement = DUMMY_REQUIREMENTS.find(r => r.id === requirementId);
  if (!requirement) {
    return Promise.reject(new Error('Requirement not found'));
  }

  const matches = DUMMY_BATCHES
    .map(batch => calculateMatch(batch, requirement))
    .filter(match => match.is_compatible)
    .sort((a, b) => b.match_score - a.match_score);

  return Promise.resolve(matches);
}

// Fetch all deals for the current exporter (DUMMY)
export async function fetchExporterDeals(): Promise<Deal[]> {
  await delay(500);
  return Promise.resolve([...DUMMY_DEALS]);
}

// Create a new deal (DUMMY)
export async function createDeal(payload: CreateDealPayload): Promise<Deal> {
  await delay(600);
  
  const requirement = DUMMY_REQUIREMENTS.find(r => r.id === payload.buyer_requirement);
  const batch = DUMMY_BATCHES.find(b => b.id === payload.product_batch);

  if (!requirement || !batch) {
    return Promise.reject(new Error('Invalid requirement or batch'));
  }

  const newDeal: Deal = {
    id: dealIdCounter++,
    buyer_requirement: requirement,
    product_batch: batch,
    status: 'pending',
    quantity: payload.quantity,
    total_price: payload.total_price,
    created_at: new Date().toISOString(),
  };

  DUMMY_DEALS.push(newDeal);
  return Promise.resolve(newDeal);
}

// Generate documents for a deal (DUMMY)
export async function generateDealDocuments(dealId: number): Promise<any> {
  await delay(1000);
  
  const deal = DUMMY_DEALS.find(d => d.id === dealId);
  if (!deal) {
    return Promise.reject(new Error('Deal not found'));
  }

  // Update deal status
  deal.status = 'documents_generated';

  const documents = {
    commercial_invoice: {
      type: 'Commercial Invoice',
      deal_id: deal.id,
      exporter: 'PT IndoXport Seafood',
      exporter_address: 'Jl. Raya Pelabuhan No. 45, Jakarta Utara, Indonesia',
      buyer: deal.buyer_requirement.buyer_name,
      buyer_country: deal.buyer_requirement.destination_country,
      product: deal.product_batch.product_name,
      batch_number: deal.product_batch.batch_number,
      quantity: `${deal.quantity} kg`,
      unit_price: `$${deal.product_batch.price_per_unit}/kg`,
      total_price: `$${deal.total_price}`,
      hs_code: '0306.17.00', // Frozen shrimp HS code
      date: new Date().toISOString().split('T')[0],
    },
    certificate_of_origin: {
      type: 'Certificate of Origin (Form E)',
      deal_id: deal.id,
      origin_country: 'Indonesia',
      product: deal.product_batch.product_name,
      batch_number: deal.product_batch.batch_number,
      harvest_location: 'East Java / Lampung / Sulawesi',
      processing_facility: 'BPOM Certified Processing Plant',
      certification_body: 'Indonesian Chamber of Commerce',
    },
    health_certificate: {
      type: 'Health Certificate (Veterinary)',
      deal_id: deal.id,
      product: deal.product_batch.product_name,
      batch_number: deal.product_batch.batch_number,
      qc_status: deal.product_batch.qc_status,
      lab_test_date: new Date().toISOString().split('T')[0],
      tested_parameters: deal.product_batch.qc_results,
      certification: 'Product meets Indonesian SNI and international food safety standards',
      certifying_authority: 'Ministry of Marine Affairs and Fisheries (KKP)',
    },
    haccp_certificate: {
      type: 'HACCP Certificate',
      deal_id: deal.id,
      product: deal.product_batch.product_name,
      batch_number: deal.product_batch.batch_number,
      processing_plant: 'PT IndoXport Processing Facility',
      haccp_plan: 'Verified and approved',
      critical_control_points: 'Monitored and documented',
      issue_date: new Date().toISOString().split('T')[0],
      expiry_date: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
    },
  };

  return Promise.resolve(documents);
}

// Update deal status (DUMMY)
export async function updateDealStatus(dealId: number, status: string): Promise<{ status: string }> {
  await delay(400);
  
  const deal = DUMMY_DEALS.find(d => d.id === dealId);
  if (!deal) {
    return Promise.reject(new Error('Deal not found'));
  }

  deal.status = status;
  return Promise.resolve({ status: 'Deal status updated successfully' });
}