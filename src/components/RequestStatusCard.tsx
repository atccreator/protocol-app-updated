import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, User, Hourglass, Circle } from "lucide-react";

type RequestStatus = "approved" | "pending" | "rejected";

interface RequestItem {
  id: number;
  code: string;
  title: string;
  status: RequestStatus;
  dateTime: string;
  location: string;
  officer?: string;
}

const statusStyles: Record<RequestStatus, string> = {
  approved: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

const statusDot: Record<RequestStatus, string> = {
  approved: "text-green-500",
  pending: "text-yellow-500",
  rejected: "text-red-500",
};

export function RecentRequests({ requests }: { requests: RequestItem[] }) {
  return (
    <div className="space-y-3">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
        <h4 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          🚨 Recent Requests
        </h4>
      </div>

      {requests.map((req) => (
        <Card
          key={req.id}
          className="rounded-xl border shadow-sm hover:shadow-md transition p-3"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-800">
              <span className="font-semibold">{req.code}</span> – {req.title}
            </div>
            <Badge
              className={`${
                statusStyles[req.status]
              } flex items-center gap-1 text-xs`}
              variant="outline"
            >
              <Circle className={`h-2 w-2 ${statusDot[req.status]}`} />
              {req.status}
            </Badge>
          </div>

          <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-gray-500" /> {req.dateTime}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-gray-500" /> {req.location}
            </span>
            {req.officer ? (
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-gray-500" /> {req.officer}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Hourglass className="h-3.5 w-3.5 text-gray-500" /> Awaiting
              </span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
