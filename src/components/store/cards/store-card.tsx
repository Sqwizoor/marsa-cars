"use client";
import { cn } from "@/lib/utils";
import { followStore } from "@/queries/user";
import { useUser } from "@clerk/nextjs";
import { Check, MessageSquareMore, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  store: {
    id: string;
    url: string;
    name: string;
    logo: string;
    followersCount: number;
    isUserFollowingStore: boolean;
  };
}

const StoreCard = ({ store }: Props) => {
  const { id, name, logo, url, followersCount, isUserFollowingStore } = store;
  const [following, setFollowing] = useState<boolean>(isUserFollowingStore);
  const [storeFollowersCount, setStoreFollowersCount] =
    useState<number>(followersCount);
  const user = useUser();
  const router = useRouter();
  const handleStoreFollow = async () => {
    if (!user.isSignedIn) router.push("/sign-in");
    try {
      const res = await followStore(id);
      setFollowing(res);
      if (res) {
        setStoreFollowersCount((prev) => prev + 1);
        toast.success(`You are now following ${name}`);
      }
      if (!res) {
        setStoreFollowersCount((prev) => prev - 1);
        toast.success(`You unfollowed ${name}`);
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something happend, Try again later !"
      );
    }
  };
  return (
    <div className="w-full">
      <div className="bg-[#f5f5f5] flex items-center justify-between rounded-xl py-3 px-4">
        <div className="flex">
          <Link href={`/store/${url}`}>
            <Image
              src={logo}
              alt={name}
              width={50}
              height={50}
              className="w-12 h-12 object-cover rounded-full"
            />
          </Link>
          <div className="mx-2">
            <div className="text-xl font-bold leading-6">
              <Link href={`/store/${url}`} className="text-main-primary">
                {name}
              </Link>
            </div>
            <div className="text-sm leading-5 mt-1">
              <strong>100%</strong>
              <span> Positive Feedback</span>&nbsp;|&nbsp;
              <strong>{storeFollowersCount}</strong>
              <strong> Followers</strong>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-end md:items-center gap-2 md:gap-0 mt-2 md:mt-0">
          <div
            className={cn(
              "flex items-center justify-center border border-black rounded-full cursor-pointer text-base font-bold h-9 w-32 md:w-auto md:mx-2 px-4 hover:bg-black hover:text-white transition-all",
              {
                "bg-black text-white": following,
              }
            )}
            onClick={() => handleStoreFollow()}
          >
            {following ? (
              <Check className="w-4 me-1" />
            ) : (
              <Plus className="w-4 me-1" />
            )}
            <span>{following ? "Following" : "Follow"}</span>
          </div>
          <div className="flex items-center justify-center border border-[#25D366] rounded-full cursor-pointer text-base font-bold h-9 w-32 md:w-auto md:mx-2 px-4 bg-[#25D366] text-white hover:bg-[#128C7E] transition-all">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="currentColor"
              className="bi bi-whatsapp me-2"
              viewBox="0 0 16 16"
            >
              <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
            </svg>
            <span>Message</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreCard;
