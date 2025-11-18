import SupplierBatchManager from "@/components/SupplierBatchManager";

export const metadata = {
  title: "Supplier Console | IndoXport",
  description: "Register harvest batches and run the BRIN QC simulation.",
};

export default function SupplierPage() {
  return <SupplierBatchManager />;
}
