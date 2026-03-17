import { Skeleton } from "@/components/ui/skeleton";

function InfoCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card py-4 text-card-foreground ring-1 ring-foreground/10">
      <div className="space-y-2 px-4">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="grid gap-4 px-4 pt-4 md:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  );
}

function FormCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card py-4 text-card-foreground ring-1 ring-foreground/10">
      <div className="space-y-2 px-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="space-y-3 px-4 pt-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

export default function OrganizationLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>

      <InfoCardSkeleton />
      <FormCardSkeleton />
      <FormCardSkeleton />
      <FormCardSkeleton />
    </div>
  );
}
