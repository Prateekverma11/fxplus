import React from 'react';

export function StatCardSkeleton() {
  return (
    <div className="card-clean p-5 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="w-20 h-4 bg-[#1a1a1a] rounded"></div>
          <div className="w-28 h-3 bg-[#141414] rounded"></div>
        </div>
        <div className="w-16 h-5 bg-[#1a1a1a] rounded"></div>
      </div>
      <div className="mt-4 w-32 h-7 bg-[#1a1a1a] rounded"></div>
      <div className="mt-4 pt-3.5 border-t border-[#1a1a1a] flex justify-between">
        <div className="w-16 h-3 bg-[#141414] rounded"></div>
        <div className="w-12 h-3 bg-[#141414] rounded"></div>
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="card-clean p-6 animate-pulse h-80 flex flex-col justify-between">
      <div className="flex justify-between items-center">
        <div className="space-y-1.5">
          <div className="w-36 h-4 bg-[#1a1a1a] rounded"></div>
          <div className="w-48 h-3 bg-[#141414] rounded"></div>
        </div>
        <div className="w-40 h-7 bg-[#1a1a1a] rounded"></div>
      </div>
      <div className="h-52 bg-[#0d0d0d] rounded-lg flex items-end p-4 gap-2">
        <div className="flex-1 bg-[#1a1a1a] rounded-t h-[40%]"></div>
        <div className="flex-1 bg-[#1a1a1a] rounded-t h-[60%]"></div>
        <div className="flex-1 bg-[#1a1a1a] rounded-t h-[30%]"></div>
        <div className="flex-1 bg-[#1a1a1a] rounded-t h-[80%]"></div>
        <div className="flex-1 bg-[#1a1a1a] rounded-t h-[50%]"></div>
        <div className="flex-1 bg-[#1a1a1a] rounded-t h-[70%]"></div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="card-clean p-4 animate-pulse space-y-3">
      <div className="h-8 bg-[#1a1a1a] rounded-md"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 bg-[#111111] rounded-md"></div>
      ))}
    </div>
  );
}

export default { StatCardSkeleton, ChartSkeleton, TableSkeleton };
