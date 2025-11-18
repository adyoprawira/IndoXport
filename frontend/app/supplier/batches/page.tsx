import SupplierBatchManager from "@/components/SupplierBatchManager";

export const metadata = {
  title: "Supplier Batches | IndoXport",
  description: "Manage batches and trigger BRIN QC simulations.",
};

export default function SupplierBatchesPage() {
  return <SupplierBatchManager />;
}
