import { cn } from "@/lib/utils"
import type { FC } from "react"

interface Spec {
  name: string
  value: string
}

interface Props {
  specs: {
    product: Spec[]
    variant: Spec[]
  }
}

const ProductSpecs: FC<Props> = ({ specs }) => {
  const { product, variant } = specs
  return (
    <div className="pt-6">
      {/* Title */}
      <div className="h-12">
        <h2 className="text-main-primary text-2xl font-bold">Specifications</h2>
      </div>
      {/* Product Specs Table */}
      <SpecTable data={product} />
      {/* Variant Specs Table */}
      <SpecTable data={variant} noTopBorder />
    </div>
  )
}

export default ProductSpecs

const SpecTable = ({
  data,
  noTopBorder,
}: {
  data: Spec[]
  noTopBorder?: boolean
}) => {
  return (
    <ul
      className={cn("border w-full rounded-md overflow-hidden", {
        "border-t-0 rounded-t-none": noTopBorder,
      })}
    >
      {data.map((spec, i) => (
        <li
          key={i}
          className={cn("border-t first:border-t-0", {
            "border-t-0": i === 0,
          })}
        >
          <div className="flex flex-col sm:flex-row w-full">
            <div className="p-3 sm:p-4 bg-gray-50 text-main-primary sm:w-1/3 sm:min-w-[200px] font-medium">
              <span className="leading-5">{spec.name}</span>
            </div>
            <div className="p-3 sm:p-4 text-gray-800 flex-1 bg-white">
              <span className="leading-5">{spec.value}</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

