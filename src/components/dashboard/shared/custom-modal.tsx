"use client";

// Provider
import { useModal } from "@/app/providers/modal-provider";

// UI components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"; // Import VisuallyHidden component
import { cn } from "@/lib/utils";

type Props = {
  heading?: string;
  subheading?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  maxWidth?: string;
};

const CustomModal = ({
  children,
  defaultOpen,
  subheading,
  heading,
  maxWidth,
}: Props) => {
  const { isOpen, setClose } = useModal();
  return (
    <Dialog open={isOpen || defaultOpen} onOpenChange={setClose}>
      <DialogContent
        className={cn(
          "overflow-y-scroll md:max-h-[700px] md:h-fit h-screen bg-card",
          maxWidth
        )}
      >
        <DialogHeader className="pt-8 text-left">
          {heading ? (
            <DialogTitle className="text-2xl font-bold">{heading}</DialogTitle>
          ) : (
            <VisuallyHidden>
              <DialogTitle>Default Title</DialogTitle>
            </VisuallyHidden>
          )}
          {subheading ? (
            <DialogDescription>{subheading}</DialogDescription>
          ) : (
            <VisuallyHidden>
              <DialogDescription>Default Description</DialogDescription>
            </VisuallyHidden>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default CustomModal;





// "use client";

// // Provider
// import { useModal } from "@/app/providers/modal-provider";

// // UI components
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
// } from "@/components/ui/dialog";
// import { DialogTitle } from "@/components/ui/dialog";
// import { cn } from "@/lib/utils";

// type Props = {
//   heading?: string;
//   subheading?: string;
//   children: React.ReactNode;
//   defaultOpen?: boolean;
//   maxWidth?: string;
// };

// const CustomModal = ({
//   children,
//   defaultOpen,
//   subheading,
//   heading,
//   maxWidth,
// }: Props) => {
//   const { isOpen, setClose } = useModal();
//   return (
//     <Dialog open={isOpen || defaultOpen} onOpenChange={setClose}>
//       <DialogContent
//         className={cn(
//           "overflow-y-scroll md:max-h-[700px] md:h-fit h-screen bg-card",
//           maxWidth
//         )}
//       >
//         <DialogHeader className="pt-8 text-left">
//           {heading && (
//             <DialogTitle className="text-2xl font-bold">{heading}</DialogTitle>
//           )}
//           {subheading && <DialogDescription>{subheading}</DialogDescription>}

//           {children}
//         </DialogHeader>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default CustomModal;
