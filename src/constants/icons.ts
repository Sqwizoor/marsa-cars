import {
  BoxesIcon,
  BoxListIcon,
  CategoriesIcon,
  CouponIcon,
  CreateStoreIcon,
  DashboardIcon,
  InventoryIcon,
  ProductsIcon,
  SettingsIcon,
  ShippingIcon,
  StoreIcon,
} from "@/components/dashboard/icons";
import { BarChart3 } from "lucide-react";

export const icons = [
  {
    label: "Dashboard",
    value: "dashboard",
    path: DashboardIcon,
  },
  {
    label: "Analytics",
    value: "chart",
    path: BarChart3,
  },
  {
    label: "Categories",
    value: "categories",
    path: CategoriesIcon,
  },
  {
    label: "Create Store",
    value: "create-store",
    path: CreateStoreIcon,
  },
  {
    label: "Box List",
    value: "box-list",
    path: BoxListIcon,
  },
  {
    label: "Boxes",
    value: "boxes",
    path: BoxesIcon,
  },
  {
    label: "Store",
    value: "store",
    path: StoreIcon,
  },
  {
    label: "Settings",
    value: "settings",
    path: SettingsIcon,
  },
  {
    label: "Products",
    value: "products",
    path: ProductsIcon,
  },
  {
    label: "Inventory",
    value: "inventory",
    path: InventoryIcon,
  },
  {
    label: "Coupon",
    value: "coupon",
    path: CouponIcon,
  },
  {
    label: "Shipping",
    value: "shipping",
    path: ShippingIcon,
  },
];
