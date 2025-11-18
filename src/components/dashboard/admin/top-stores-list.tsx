import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Store, Package, Users, DollarSign } from "lucide-react";

interface TopStore {
  id: string;
  name: string;
  url: string;
  totalEarnings: number;
  _count: {
    products: number;
    followers: number;
  };
}

interface TopStoresListProps {
  stores: TopStore[];
}

export default function TopStoresList({ stores }: TopStoresListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Store className="h-5 w-5 text-purple-500" />
          Top Performing Stores
        </CardTitle>
      </CardHeader>
      <CardContent>
        {stores.length === 0 ? (
          <p className="text-sm text-gray-500">No stores yet</p>
        ) : (
          <div className="space-y-4">
            {stores.map((store, index) => (
              <div
                key={store.id}
                className="hover:bg-gray-50 p-3 rounded-lg transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <Link
                        href={`/store/${store.url}`}
                        className="text-sm font-medium text-gray-900 hover:text-purple-600"
                      >
                        {store.name}
                      </Link>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Package className="h-3 w-3" />
                          <span>{store._count.products} products</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Users className="h-3 w-3" />
                          <span>{store._count.followers} followers</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-green-600 font-semibold text-sm">
                    <DollarSign className="h-4 w-4" />
                    {store.totalEarnings.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
