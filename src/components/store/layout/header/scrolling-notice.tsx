import Link from 'next/link';
import { Plus } from "lucide-react";

const ScrollingNotice = () => {
    // Content to be repeated
    const Content = () => (
        <div className="flex items-center gap-12 px-6">
            <span className="text-xs sm:text-sm font-medium tracking-wide">Find New & Used Car Parts</span>
            <span className="text-xs sm:text-sm font-medium tracking-wide">Sell Your Cars</span>
            <span className="text-xs sm:text-sm font-medium tracking-wide">Buy Cars</span>
            <span className="text-xs sm:text-sm font-medium tracking-wide">Sell Your Car Parts</span>
            <Link 
                href="/cars/sell" 
                className="flex items-center gap-1 bg-pink-600 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-pink-700 transition-colors shadow-sm whitespace-nowrap"
            >
                <Plus className="w-3 h-3" />
                <span>Post Now</span>
            </Link>
        </div>
    );

    return (
        <div className="w-full bg-black text-white overflow-hidden py-2 border-b border-white/10 relative z-[101]">
            <div className="flex w-max animate-marquee hover:pause-on-hover">
                <Content />
                <Content />
                <Content />
                <Content />
                <Content />
                <Content />
                <Content />
                <Content />
            </div>
        </div>
    );
}

export default ScrollingNotice;
