import { SubCategory } from "@prisma/client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Links({ subs }: { subs: SubCategory[] }) {
  return (
    <div className="grid md:grid-cols-3 gap-8 text-sm text-white">
      {/* SubCategories */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Find it Fast
        </h3>
        <ul className="flex flex-col gap-y-2">
          {subs.map((sub) => (
            <li key={sub.id} className="group">
              <Link 
                href={`/browse?subCategory=${sub.url}`}
                className="flex items-center gap-1 text-slate-300 hover:text-white transition-all duration-200 hover:translate-x-1"
              >
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <span>{sub.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Profile links */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Quick Links
        </h3>
        <ul className="flex flex-col gap-y-2">
          {footer_links.slice(0, 6).map((link, i) => (
            <li key={i} className="group">
              <Link 
                href={link.link}
                className="flex items-center gap-1 text-slate-300 hover:text-white transition-all duration-200 hover:translate-x-1"
              >
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <span>{link.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Customer care */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Customer Care
        </h3>
        <ul className="flex flex-col gap-y-2">
          {footer_links.slice(6).map((link, i) => (
            <li key={i} className="group">
              <Link 
                href={link.link}
                className="flex items-center gap-1 text-slate-300 hover:text-white transition-all duration-200 hover:translate-x-1"
              >
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <span>{link.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const footer_links = [
  {
    title: "About",
    link: "/about",
  },
  {
    title: "Contact",
    link: "/contact",
  },
  {
    title: "Wishlist",
    link: "/profile/wishlist",
  },
  {
    title: "Compare",
    link: "/compare",
  },
  {
    title: "FAQ",
    link: "/faq",
  },
  {
    title: "Store Directory",
    link: "/profile",
  },
  {
    title: "My Account",
    link: "/profile",
  },
  {
    title: "Track your Order",
    link: "/track-order",
  },
  {
    title: "Customer Service",
    link: "/customer-service",
  },
  {
    title: "Returns/Exchange",
    link: "/returns-exchange",
  },
  {
    title: "FAQs",
    link: "/faqs",
  },
  {
    title: "Product Support",
    link: "/product-support",
  },
];
