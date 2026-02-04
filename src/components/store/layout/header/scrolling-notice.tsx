import Link from 'next/link';
import { Plus } from "lucide-react";

const ScrollingNotice = () => {
    // Content to be repeated
    const Content = () => (
        <div className="flex items-center gap-4">
            <Link 
                href="/cars" 
                className="px-4 py-1.5 rounded-full bg-pink-600 text-[10px] md:text-xs font-bold uppercase text-white hover:bg-pink-700 transition-all shadow-sm whitespace-nowrap"
            >
                Browse Cars
            </Link>
            <Link 
                href="/parts" 
                className="px-4 py-1.5 rounded-full bg-pink-600 text-[10px] md:text-xs font-bold uppercase text-white hover:bg-pink-700 transition-all shadow-sm whitespace-nowrap"
            >
                Car Parts
            </Link>
            <Link 
                href="/cars/sell" 
                className="px-4 py-1.5 rounded-full bg-slate-900 text-[10px] md:text-xs font-bold uppercase text-white hover:bg-slate-800 transition-all shadow-sm whitespace-nowrap border border-white/10"
            >
                SELL YOUR CARS
            </Link>
            <Link 
                href="/parts/sell" 
                className="px-4 py-1.5 rounded-full bg-slate-900 text-[10px] md:text-xs font-bold uppercase text-white hover:bg-slate-800 transition-all shadow-sm whitespace-nowrap border border-white/10"
            >
                Sell Car Parts
            </Link>
        </div>
    );

    return (
        <div className="w-full bg-white text-black border-t border-slate-200 relative z-[101] shadow-sm py-2">
            {/* Desktop View: Static, centered, and aligned with Navbar width */}
            <div className="hidden lg:flex justify-center items-center w-full px-4 sm:px-6 lg:px-8">
                <Content />
            </div>

            {/* Mobile View: Scrolling Marquee */}
            <div className="lg:hidden w-full overflow-hidden">
                <div className="flex w-max animate-marquee-right-slow hover:pause-on-hover px-4">
                    <Content />
                    <div className="mx-4" />
                    <Content />
                    <div className="mx-4" />
                    <Content />
                    <div className="mx-4" />
                    <Content />
                    <div className="mx-4" />
                    <Content />
                    <div className="mx-4" />
                    <Content />
                </div>
            </div>
        </div>
    );
}

export default ScrollingNotice;
