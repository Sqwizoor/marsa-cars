import Link from 'next/link';
import { Plus } from "lucide-react";

const ScrollingNotice = () => {
    // Content to be repeated
    const Content = () => (
        <div className="flex items-center gap-4 px-2">
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
                Sell Your Car
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
        <div className="w-full bg-white text-black overflow-hidden py-2 border-t border-slate-200 relative z-[101] shadow-sm">
            <div className="flex w-max lg:w-full animate-marquee-right-slow lg:animate-none lg:justify-center hover:pause-on-hover">
                <Content />
                <Content />
                <Content />
                <Content />
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
