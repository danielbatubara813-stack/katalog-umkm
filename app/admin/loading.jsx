export default function LoadingAdmin() {
  return (
    <div className="flex flex-col gap-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="h-8 w-32 animate-pulse rounded bg-permukaan" />
        <div className="h-10 w-36 animate-pulse rounded bg-permukaan" />
      </div>
      <div className="h-64 w-full animate-pulse rounded-2xl bg-permukaan" />
    </div>
  );
}

