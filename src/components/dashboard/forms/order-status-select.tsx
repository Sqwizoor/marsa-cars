import OrderStatusTag from "@/components/shared/order-status";
import { useToast } from "@/hooks/use-toast";
import { OrderStatus } from "@/lib/types";
import { updateOrderGroupStatus } from "@/queries/order";
import { useState } from "react";

interface Props {
  storeId: string;
  groupId: string;
  status: OrderStatus;
}

const OrderStatusSelect = ({ groupId, status, storeId }: Props) => {

  const [newStatus, setNewStatus] = useState<OrderStatus>(status);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { toast } = useToast();

  // Options
  const options = Object.values(OrderStatus).filter((s) => s !== newStatus);

  // Handle click
  const handleClick = async (selectedStatus: OrderStatus) => {
    try {
      const response = await updateOrderGroupStatus(
        storeId,
        groupId,
        selectedStatus
      );
      if (response) {
        setNewStatus(response as OrderStatus);
        setIsOpen(false);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    }
  };
  return (
    <div className="relative">
      {/* Current status */}
      <div
        className="cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <OrderStatusTag status={newStatus} />
      </div>
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-md shadow-md mt-2 w-[140px]">
          {options.map((option) => (
            <button
              key={option}
              className="w-full flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              onClick={() => handleClick(option)}
            >
              <OrderStatusTag status={option} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderStatusSelect;