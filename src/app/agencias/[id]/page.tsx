import { notFound } from "next/navigation";
import { AgencyForm } from "@/components/agencies/agency-form";
import { getAgency, listGroups } from "@/lib/pass/repo";

export default async function EditarAgenciaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [agency, groups] = await Promise.all([getAgency(id), listGroups()]);
  if (!agency) notFound();
  return (
    <div className="mx-auto w-full max-w-6xl">
      <AgencyForm agency={agency} groups={groups} />
    </div>
  );
}
