import { AgencyForm } from "@/components/agencies/agency-form";
import { listGroups } from "@/lib/pass/repo";

export default async function NuevaAgenciaPage({
  searchParams,
}: {
  searchParams: Promise<{ grupo?: string }>;
}) {
  const { grupo } = await searchParams;
  const groups = await listGroups();
  return (
    <div className="mx-auto w-full max-w-6xl">
      <AgencyForm groups={groups} defaultGroupId={grupo} />
    </div>
  );
}
