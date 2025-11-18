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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          Top Selling Products
        </CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-sm text-gray-500">No products yet</p>
        ) : (
          <div className="space-y-4">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <Link
                      href={`/product/${product.slug}`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600"
                    >
                      {product.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {product.sales} sales
                      </span>
                      {product.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">
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
