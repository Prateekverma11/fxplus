import React from 'react';

export function StatCardSkeleton() {
  return (
    <div className="card-clean p-5 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="w-20 h-4 bg-zinc-200 rounded"></div>
          <div className="w-28 h-3 bg-zinc-100 rounded"></div>
        </div>
        <div className="w-16 h-5 bg-zinc-200 rounded"></div>
      </div>
      <div className="mt-4 w-32 h-7 bg-zinc-200 rounded"></div>
      <div className="mt-4 pt-3.5 border-t border-zinc-100 flex justify-between">
        <div className="w-16 h-3 bg-zinc-100 rounded"></div>
        <div className="w-12 h-3 bg-zinc-100 rounded"></div>
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="w-full animate-pulse h-64 flex flex-col justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-200/60">
      <div className="flex justify-between items-center">
        <div className="w-36 h-4 bg-zinc-200 rounded"></div>
        <div className="w-24 h-6 bg-zinc-200 rounded"></div>
      </div>
      <div className="h-44 bg-zinc-100/70 rounded-lg flex items-end p-4 gap-3">
        <div className="flex-1 bg-zinc-200/70 rounded-t h-[40%]"></div>
        <div className="flex-1 bg-zinc-200/70 rounded-t h-[60%]"></div>
        <div className="flex-1 bg-zinc-200/70 rounded-t h-[30%]"></div>
        <div className="flex-1 bg-zinc-200/70 rounded-t h-[80%]"></div>
        <div className="flex-1 bg-zinc-200/70 rounded-t h-[50%]"></div>
        <div className="flex-1 bg-zinc-200/70 rounded-t h-[70%]"></div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="card-clean p-4 animate-pulse space-y-3">
      <div className="h-8 bg-zinc-200 rounded-md"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 bg-zinc-100 rounded-md"></div>
      ))}
    </div>
  );
}

export default { StatCardSkeleton, ChartSkeleton, TableSkeleton };
