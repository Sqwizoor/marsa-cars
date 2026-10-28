"use client";

import { PartRequest } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, Phone, Car, Tag, Hash } from "lucide-react";

interface PartRequestDetailsProps {
  data: PartRequest;
}

const PartRequestDetails = ({ data }: PartRequestDetailsProps) => {
  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center justify-between mb-2">
            <Badge variant={data.status === "RESOLVED" ? "default" : "secondary"} className={data.status === "RESOLVED" ? "bg-green-500" : ""}>
                {data.status}
            </Badge>
            <div className="flex items-center text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(data.createdAt).toLocaleString()}
            </div>
        </div>
        <CardTitle className="text-2xl font-bold text-slate-900">{data.partName}</CardTitle>
        <CardDescription>Full details for the car part sourcing request</CardDescription>
      </CardHeader>
      
      <CardContent className="px-0 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 flex items-center">
                        <Tag className="w-3 h-3 mr-1" /> Part Details
                    </span>
                    <p className="text-slate-800 font-medium">{data.partName}</p>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 flex items-center">
                        <Hash className="w-3 h-3 mr-1" /> Part Number
                    </span>
                    <p className="text-slate-800 font-medium">{data.partNumber || "Not provided"}</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 flex items-center">
                        <Car className="w-3 h-3 mr-1" /> Vehicle Details
                    </span>
                    <p className="text-slate-800 font-medium whitespace-pre-wrap">{data.vehicleDetails}</p>
                </div>
            </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 flex items-center">
                        <User className="w-3 h-3 mr-1" /> Customer Name
                    </span>
                    <p className="text-slate-800 font-medium">{data.userName}</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 flex items-center">
                        <Phone className="w-3 h-3 mr-1" /> Contact Information
                    </span>
                    <p className="text-slate-800 font-medium">{data.contactInfo}</p>
                </div>
            </div>
        </div>
        
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 leading-relaxed italic">
                Tip: After contacting the customer and finding the part, remember to mark this request as "RESOLVED" using the actions menu in the table.
            </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartRequestDetails;
