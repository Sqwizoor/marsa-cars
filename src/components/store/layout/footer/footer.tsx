import type { SubCategory } from "@prisma/client";
import { getSubcategories } from "@/queries/subCategories";
import Contact from "./contact";
import Links from "./links";
import Newsletter from "./newsletter";

export default async function Footer() {
  let subs: SubCategory[] = [];
  try {
    subs = await getSubcategories(7, true);
  } catch (error) {
    console.error("Footer getSubcategories failed", error);
  }
  return (
    <footer className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>
      
      <div className="relative z-10">
        <Newsletter />
        
        <div className="max-w-[1430px] mx-auto px-5 py-12">
          <div className="grid md:grid-cols-2 md:gap-x-10 gap-y-10">
            <Contact />
            <Links subs={subs} />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-700/50 backdrop-blur-sm">
          <div className="max-w-[1430px] mx-auto px-5 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-sm">
                  <b className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">© 2025 GoShop</b> - All Rights Reserved
                </span>
              </div>
              <div className="flex items-center gap-6 text-xs text-slate-400">
                <a href="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
                <span>•</span>
                <a href="/terms" className="hover:text-white transition-colors duration-200">Terms of Service</a>
                <span>•</span>
                <a href="/cookies" className="hover:text-white transition-colors duration-200">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
