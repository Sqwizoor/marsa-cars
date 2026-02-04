import { ProductType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { FC, Fragment } from "react";
import ProductCard from "../cards/product/product-card";
import SponsoredAd from "./sponsored-ad";

interface Props {
  products: ProductType[];
  title?: string;
  link?: string;
  arrow?: boolean;
  adInterval?: number;
}

const ProductList: FC<Props> = ({ products, title, link, arrow, adInterval }) => {
  const Title = () => {
    if (link) {
      <Link href={link} className="h-12">
        <h2 className="text-main-primary text-xl font-bold">
          {title}&nbsp;
          {arrow && <ChevronRight className="w-3 inline-block" />}
        </h2>
      </Link>;
    } else {
      return (
        <h2 className="text-main-primary text-xl font-bold">
          {title}&nbsp;
          {arrow && <ChevronRight className="w-3 inline-block" />}
        </h2>
      );
    }
  };
  return (
    <div className="relative w-full pb-[4rem]">
      {title && <Title />}
      {products.length > 0 ? (
        <div
          className={cn(
            "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4",
            {
              "mt-2": title,
            }
          )}
        >
          {products.map((product, index) => (
            <Fragment key={product.id}>
              <ProductCard product={product} />
              {adInterval && (index + 1) % adInterval === 0 && (
                <div className="col-span-full my-4">
                  <SponsoredAd index={Math.floor((index + 1) / adInterval) - 1} />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      ) : (
        "No Products."
      )}
    </div>
  );
};

export default ProductList;
