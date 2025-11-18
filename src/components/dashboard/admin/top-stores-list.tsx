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
    <Card className="border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2 dark:text-white">
          <Store className="h-5 w-5 text-[#FF1744]" />
          Top Performing Stores
        </CardTitle>
      </CardHeader>
      <CardContent>
        {stores.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No stores yet</p>
        ) : (
          <div className="space-y-4">
            {stores.map((store, index) => (
              <div
                key={store.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-lg transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FF1744]/10 dark:bg-[#FF1744]/20 flex items-center justify-center text-[#FF1744] font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <Link
                        href={`/store/${store.url}`}
                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-[#FF1744] dark:hover:text-[#FF1744]"
                      >
                        {store.name}
                      </Link>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                          <Package className="h-3 w-3" />
                          <span>{store._count.products} products</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                          <Users className="h-3 w-3" />
                          <span>{store._count.followers} followers</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold text-sm">
                    R{store.totalEarnings.toLocaleString()}
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
