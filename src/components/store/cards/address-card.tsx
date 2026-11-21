import { UserShippingAddressType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Country } from "@prisma/client";
import { Check } from "lucide-react";
import { useState } from "react";
import Modal from "../shared/modal";
import AddressDetails from "../shared/shipping-addresses/address-details";
import toast from "react-hot-toast";
import { upsertShippingAddress } from "@/queries/user";
import { useRouter } from "next/navigation";

interface Props {
  address: UserShippingAddressType;
  isSelected: boolean;
  onSelect: () => void;
  countries: Country[];
}

const ShippingAddressCard = ({
  address,
  countries,
  isSelected,
  onSelect,
}: Props) => {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const handleMakeDefault = async () => {
    try {
      const { country, user, ...addressPayload } = address;
      void country;
      void user;
      const response = await upsertShippingAddress({
        ...addressPayload,
        default: true,
      });
      if (response) {
        toast.success("New Default Address saved.");
        router.refresh();
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong !"
      );
    }
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        "w-full relative flex items-start group p-3 sm:p-4 rounded-xl border transition-all cursor-pointer select-none",
        isSelected
          ? "border-orange-500 bg-orange-50/30 ring-1 ring-orange-500/20 shadow-sm"
          : "border-slate-200 hover:border-slate-300 bg-white"
      )}
    >
      {/* Checkbox indicator */}
      <div className="p-0 text-gray-900 text-sm leading-6 inline-flex items-center mr-3 shrink-0 mt-0.5">
        <span className="leading-8 inline-flex p-0.5">
          <span
            className={cn(
              "w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center transition-colors",
              {
                "bg-orange-500 border-none": isSelected,
              }
            )}
          >
            {isSelected && <Check className="stroke-white w-3 h-3 stroke-[3]" />}
          </span>
        </span>
      </div>
      {/* Address Content */}
      <div className="w-full pt-0.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pr-1">
          {/* Full name - Phone number */}
          <div className="flex flex-wrap items-center gap-x-2 text-sm">
            <span className="text-slate-900 font-semibold capitalize">
              {address.firstName} {address.lastName}
            </span>
            <span className="text-slate-500 font-medium text-xs sm:text-sm">
              {address.phone}
            </span>
            {address.default && (
              <span className="text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded font-medium">
                Default
              </span>
            )}
          </div>

          {/* Action Links (Visible on mobile and desktop) */}
          <div className="flex items-center gap-x-3 text-xs pt-1 sm:pt-0">
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer p-1"
              onClick={(e) => {
                e.stopPropagation();
                setShow(true);
              }}
            >
              Edit
            </button>
            {isSelected && !address.default && (
              <button
                type="button"
                className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMakeDefault();
                }}
              >
                Save as default
              </button>
            )}
          </div>
        </div>

        {/* Address 1 - Address 2 */}
        <div className="text-xs sm:text-sm text-slate-600 mt-1 leading-snug break-words">
          {address.address1}
          {address.address2 && `, ${address.address2}`}
        </div>

        {/* State - City - Country - Zipcode */}
        <div className="text-xs sm:text-sm text-slate-500 leading-snug break-words">
          {address.city}, {address.state}, {address.country.name} {address.zip_code}
        </div>

        {show && (
          <Modal title="Edit Shipping Address" show={show} setShow={setShow}>
            <AddressDetails
              data={address}
              countries={countries}
              setShow={setShow}
            />
          </Modal>
        )}
      </div>
    </div>
  );
};

export default ShippingAddressCard;
