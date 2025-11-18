import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Star, TrendingUp } from "lucide-react";

interface TopProduct {
  id: string;
  name: string;
  slug: string;
  sales: number;
  rating: number;
}

interface TopProductsListProps {
  products: TopProduct[];
}

export default function TopProductsList({ products }: TopProductsListProps) {
  return (
    <Card className="border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2 dark:text-white">
          <TrendingUp className="h-5 w-5 text-[#FF1744]" />
          Top Selling Products
        </CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No products yet</p>
        ) : (
          <div className="space-y-4">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FF1744]/10 dark:bg-[#FF1744]/20 flex items-center justify-center text-[#FF1744] font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <Link
                      href={`/product/${product.slug}`}
                      className="text-sm font-medium text-gray-900 dark:text-white hover:text-[#FF1744] dark:hover:text-[#FF1744]"
                    >
                      {product.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {product.sales} sales
                      </span>
                      {product.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {product.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
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
