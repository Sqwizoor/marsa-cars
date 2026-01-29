import { DashboardSidebarMenuInterface } from "@/lib/types";

export const adminDashboardSidebarOptions: DashboardSidebarMenuInterface[] = [
  {
    label: "Dashboard",
    icon: "dashboard",
    link: "/dashboard/admin",
  },
  {
    label: "Analytics",
    icon: "chart",
    link: "/dashboard/admin/analytics",
  },
  {
    label: "Users",
    icon: "users",
    link: "/dashboard/admin/users",
  },
  {
    label: "Traffic & Growth",
    icon: "activity",
    link: "/dashboard/admin/traffic",
  },
  {
    label: "Stores",
    icon: "store",
    link: "/dashboard/admin/stores",
  },
  {
    label: "Product Reviews",
    icon: "products",
    link: "/dashboard/admin/products",
  },
  {
    label: "Car Listings",
    icon: "car",
    link: "/dashboard/admin/cars",
  },
  {
    label: "Orders",
    icon: "box-list",
    link: "/dashboard/admin/orders",
  },
  {
    label: "Categories",
    icon: "categories",
    link: "/dashboard/admin/categories",
  },
  {
    label: "Sub-Categories",
    icon: "categories",
    link: "/dashboard/admin/subCategories",
  },
  {
    label: "Offer Tags",
    icon: "offer",
    link: "/dashboard/admin/offer-tags",
  },
  {
    label: "Coupons",
    icon: "coupon",
    link: "/dashboard/admin/coupons",
  },
];

export const SellerDashboardSidebarOptions: DashboardSidebarMenuInterface[] = [
  {
    label: "Dashboard",
    icon: "dashboard",
    link: "",
  },
  {
    label: "Analytics",
    icon: "chart",
    link: "analytics",
  },
  {
    label: "Visitor Analytics",
    icon: "activity",
    link: "visitor-analytics",
  },
  {
    label: "Products",
    icon: "products",
    link: "products",
  },
  {
    label: "Orders",
    icon: "box-list",
    link: "orders",
  },
  {
    label: "Inventory",
    icon: "inventory",
    link: "inventory",
  },
  {
    label: "Coupons",
    icon: "coupon",
    link: "coupons",
  },
  {
    label: "Shipping",
    icon: "shipping",
    link: "shipping",
  },
  {
    label: "Sell Cars",
    icon: "car",
    link: "/cars/sell",
  },
  {
    label: "Settings",
    icon: "settings",
    link: "settings",
  },
];
export const CarsDashboardSidebarOptions: DashboardSidebarMenuInterface[] = [
  {
    label: "Overview",
    icon: "dashboard",
    link: "/dashboard/cars",
  },
  {
    label: "Analytics",
    icon: "chart",
    link: "/dashboard/cars/analytics",
  },
  {
    label: "My Listings",
    icon: "car",
    link: "/dashboard/cars",
  },
  {
    label: "Inquiries",
    icon: "box-list",
    link: "/dashboard/cars/inquiries",
  },
  {
    label: "Subscription",
    icon: "settings",
    link: "/dashboard/cars/subscription",
  },
];
