import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

const ADS_DATA = [
  {
    title: "Used vehicles for sale",
    url: "https://www.newmarketmotorco.co.za/",
    displayUrl: "newmarketmotorco.co.za",
    description: "Used Cars for Sale Gauteng - Competitive financing options, extended warranties, and comprehensive after-sales service. Sell your vehicle or buy a new car from our Market Motor Co. dealership in Gauteng. Latest Arrivals.",
    links: [
        { label: "View Showroom", url: "#" },
        { label: "Sell Your Vehicle", url: "#" },
        { label: "Contact Us", url: "#" },
        { label: "Finance Information", url: "#" },
    ]
  },
   {
    title: "MFC Repossessed Cars - Used Cars for Sale Auction",
    url: "https://www.mfcauctions.co.za/car_auctions/online",
    displayUrl: "mfcauctions.co.za",
    description: "Register today and start bidding on quality repossessed vehicles across South Africa. Buy repossessed cars for less. Join SA's trusted vehicle auction platform today.",
     links: []
  },
  {
      title: "AutoTrader - South Africa's #1 Car Site",
      url: "https://www.autotrader.co.za/",
      displayUrl: "autotrader.co.za",
      description: "Search for new & used cars for sale in South Africa. Compare cars, read reviews & find the best deals on AutoTrader.co.za.",
      links: []
  },
  {
      title: "Cars.co.za - New & Used Cars",
      url: "https://www.cars.co.za/",
      displayUrl: "cars.co.za",
      description: "Find the perfect car providing you with the most intuitive search experience. Buy and sell cars with ease on Cars.co.za.",
      links: []
  }
];

interface SponsoredAdProps {
    index?: number;
    minimal?: boolean;
}

const SponsoredAd: FC<SponsoredAdProps> = ({ index = 0, minimal = false }) => {
  const ad = ADS_DATA[index % ADS_DATA.length];

  return (
    <div className="flex flex-col gap-1 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 w-full">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-bold text-gray-900">Sponsored</span>
      </div>
      <div className="flex items-start gap-3">
         <div className="p-2 bg-gray-50 rounded-full flex-shrink-0">
            <ExternalLink className="w-5 h-5 text-gray-500" />
         </div>
         <div className="flex-1">
            <div className="text-sm text-gray-700">
                {ad.displayUrl}
            </div>
            <Link href={ad.url} target="_blank" rel="noopener noreferrer" className="text-blue-800 text-lg sm:text-xl font-medium hover:underline block mb-1">
                {ad.title}
            </Link>
             <p className="text-sm text-gray-600 leading-relaxed">
                {ad.description}
            </p>
            {!minimal && ad.links.length > 0 && (
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
                    {ad.links.map((link, i) => (
                        <Link key={i} href={link.url} className="text-blue-800 text-sm hover:underline">
                            {link.label}
                        </Link>
                    ))}
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default SponsoredAd;
