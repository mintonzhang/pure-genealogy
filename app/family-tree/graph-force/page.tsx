import { Suspense } from "react";
import { fetchAllFamilyMembers } from "../graph/actions";
import { ForceGraph } from "./force-graph";

async function ForceGraphLoader() {
  const { data, error } = await fetchAllFamilyMembers();

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-muted-foreground">
        {error || "加载数据失败"}
      </div>
    );
  }

  return <ForceGraph initialData={data} />;
}

export default function ForceGraphPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[60vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <ForceGraphLoader />
    </Suspense>
  );
}
