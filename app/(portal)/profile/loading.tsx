import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Skeleton className="h-8 w-28" />

      <div className="rounded-xl border bg-card py-4 text-card-foreground ring-1 ring-foreground/10">
        <div className="px-4">
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="px-4 pt-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card py-4 text-card-foreground ring-1 ring-foreground/10">
        <div className="px-4">
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="space-y-2 px-4 pt-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card py-4 text-card-foreground ring-1 ring-foreground/10">
        <div className="space-y-2 px-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
        </div>
        <div className="space-y-3 px-4 pt-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}
