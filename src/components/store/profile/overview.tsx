import { getUserSubscription } from "@/queries/profile";
import { currentUser } from "@clerk/nextjs/server";
import { Eye, Heart, Puzzle, Rss, WalletCards } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function ProfileOverview() {
  const user = await currentUser();
  if (!user) return;

  const subscription = await getUserSubscription();

  return (
    <div className="w-full bg-red-500">
      <div className="bg-white p-4 border shadow-sm">
        <div className="flex items-center">
          <Image
            src={user.imageUrl}
            alt={user.fullName!}
            width={200}
            height={200}
            className="w-14 h-14 rounded-full object-cover"
          />
          <div className="flex-1 ml-4">
            <div className="text-main-primary text-xl font-bold capitalize ">
              {user.fullName?.toLowerCase()}
            </div>
            {subscription && (
              <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    subscription.tier === "GOLD"
                      ? "bg-yellow-100 text-yellow-700"
                      : subscription.tier === "SILVER"
                      ? "bg-gray-100 text-gray-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {subscription.tier}
                </span>
                {subscription.endDate && (
                  <span>
                    Expires:{" "}
                    {new Date(subscription.endDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 py-4">
          {menu.map((item) => (
            <Link
              key={item.link}
              href={item.link}
              className="relative flex flex-col items-center justify-center cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="text-2xl sm:text-3xl">
                <span>{item.icon}</span>
              </div>
              <div className="mt-2 text-sm sm:text-base text-center">{item.title}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const menu = [
  {
    title: "Wishlist",
    icon: <Heart />,
    link: "/profile/wishlist",
  },
  {
    title: "Following",
    icon: <Rss />,
    link: "/profile/following/1",
  },
  {
    title: "Viewed",
    icon: <Eye />,
    link: "/profile/history/1",
  },
  {
    title: "Coupons",
    icon: <Puzzle />,
    link: "/profile/coupons",
  },
  {
    title: "Shopping credit",
    icon: <WalletCards />,
    link: "/profile/credit",
  },
];
