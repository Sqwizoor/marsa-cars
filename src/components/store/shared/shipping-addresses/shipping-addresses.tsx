import { UserShippingAddressType } from "@/lib/types";
import { Country, ShippingAddress } from "@prisma/client";
import { Plus } from "lucide-react";
import { Dispatch, FC, SetStateAction, useState } from "react";
import Modal from "../modal";
import AddressDetails from "./address-details";
import AddressList from "./address-list";

interface Props {
  countries: Country[];
  addresses: UserShippingAddressType[];
  selectedAddress: ShippingAddress | null;
  setSelectedAddress: Dispatch<SetStateAction<ShippingAddress | null>>;
}

const UserShippingAddresses: FC<Props> = ({
  addresses,
  countries,
  selectedAddress,
  setSelectedAddress,
}) => {
  const [show, setShow] = useState<boolean>(false);
  return (
    <div className="w-full py-4 px-4 sm:px-6 bg-white rounded-xl shadow-sm border border-slate-100">
      <div className="relative flex flex-col text-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Shipping Addresses
          </h2>
          {addresses && addresses.length > 0 && (
            <span className="text-xs text-slate-500 font-medium">
              {addresses.length} {addresses.length === 1 ? "saved" : "saved"}
            </span>
          )}
        </div>
        {addresses && addresses.length > 0 && (
          <AddressList
            addresses={addresses}
            countries={countries}
            selectedAddress={selectedAddress}
            setSelectedAddress={setSelectedAddress}
          />
        )}
        <button
          type="button"
          onClick={() => setShow(true)}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-pink-300 hover:border-pink-500 bg-pink-50/60 hover:bg-pink-50 text-pink-700 font-semibold text-xs sm:text-sm transition self-start cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4 text-pink-600 shrink-0" />
          <span>Add new address</span>
        </button>
        {/* Modal */}
        <Modal title="Add New Shipping Address" show={show} setShow={setShow}>
          <AddressDetails countries={countries} setShow={setShow} />
        </Modal>
      </div>
    </div>
  );
};

export default UserShippingAddresses;
