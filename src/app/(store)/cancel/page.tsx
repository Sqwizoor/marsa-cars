import Link from "next/link";
import { XCircle, ShoppingCart, ArrowLeft } from "lucide-react";

export default function CancelPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-50 p-4 animate-in zoom-in duration-300">
            <XCircle className="h-16 w-16 text-red-500" strokeWidth={1.5} />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Payment Cancelled
          </h2>
          <p className="text-gray-500 text-lg">
            Your transaction was cancelled and no charges were made to your account.
          </p>
        </div>

        <div className="pt-4 space-y-3">
          <Link 
            href="/cart" 
            className="w-full flex items-center justify-center gap-2 px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 md:py-4 md:text-lg transition-all shadow-lg shadow-red-200"
          >
            <ShoppingCart className="w-5 h-5" />
            Return to Cart
          </Link>
          
          <Link 
            href="/" 
            className="w-full flex items-center justify-center gap-2 px-8 py-3 border border-gray-200 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-400">
            If you experienced an issue with payment, please try a different payment method or <Link href="/contact" className="text-red-600 hover:underline font-medium">contact support</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
