import { Suspense } from "react";
import ClientPage from "./ClientPage";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <ClientPage />
    </Suspense>
  );
}