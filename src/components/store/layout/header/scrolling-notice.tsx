import Link from 'next/link';
import { Plus } from "lucide-react";

const ScrollingNotice = () => {
    // Content to be repeated
    const Content = () => (
        <div className="flex items-center gap-8 px-4">
            <Link href="/cars" className="text-xs font-bold uppercase tracking-tight text-slate-800 hover:text-pink-600 transition-colors whitespace-nowrap">
                Browse Cars
            </Link>
            <Link href="/parts" className="text-xs font-bold uppercase tracking-tight text-slate-800 hover:text-pink-600 transition-colors whitespace-nowrap">
                Car Parts
            </Link>
            <Link href="/cars/sell" className="text-xs font-bold uppercase tracking-tight text-slate-800 hover:text-pink-600 transition-colors whitespace-nowrap">
                Sell Your Car
            </Link>
            <Link href="/parts/sell" className="text-xs font-bold uppercase tracking-tight text-slate-800 hover:text-pink-600 transition-colors whitespace-nowrap">
                Sell Car Parts
            </Link>
            <div className="w-1.5 h-1.5 rounded-full bg-pink-600 mx-2" />
        </div>
    );

    return (
        <div className="w-full bg-white text-black overflow-hidden py-2.5 border-t border-slate-200 relative z-[101] shadow-sm">
            <div className="flex w-max animate-marquee-right-slow hover:pause-on-hover">
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
