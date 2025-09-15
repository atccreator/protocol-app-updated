'use client';

import { useEffect, useState } from 'react';
import RequestStatusCard from "@/components/RequestStatusCard";
import type { Request } from "@/types/requestStatusCard";
import { getUserRequestStatusApi, handleApiError } from "@/lib/api";

export default function UserRequestStatusPage() {
  const [data, setData] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const res = await getUserRequestStatusApi.getRequestStatus();
        // Try common response shapes: { data: Request[] } or { data: { data: Request[] } }
        const raw = (res as any)?.data;
        const list: unknown = raw?.data ?? raw?.requests ?? raw ?? [];
        if (!isMounted) return;
        setData(Array.isArray(list) ? (list as Request[]) : []);
      } catch (err) {
        if (!isMounted) return;
        setError(handleApiError(err));
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-600">Loading requests…</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <RequestStatusCard data={data} />
    </div>
  );
}