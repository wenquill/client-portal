import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function StatSkeletonCard() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-14" />
      </CardContent>
    </Card>
  );
}

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-20" />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Skeleton className="h-6 w-24" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatSkeletonCard />
          <StatSkeletonCard />
          <StatSkeletonCard />
          <StatSkeletonCard />
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-6 w-24" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatSkeletonCard />
          <StatSkeletonCard />
          <StatSkeletonCard />
          <StatSkeletonCard />
        </div>
      </div>
    </div>
  );
}
