"use client";
import { X } from "lucide-react";
import { Dispatch, FC, ReactNode, SetStateAction, useEffect, useRef } from "react";
import useOnClickOutside from "use-onclickoutside";

interface ModalProps {
  title?: string;
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  children: ReactNode;
  maxWidth?: string;
}

const Modal: FC<ModalProps> = ({
  children,
  title,
  show,
  setShow,
  maxWidth = "max-w-2xl",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const close = () => setShow(false);
  useOnClickOutside(ref as React.RefObject<HTMLElement>, close);

  // Lock body scroll when modal is open on mobile/desktop
  useEffect(() => {
    if (show) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        ref={ref}
        className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-2xl flex flex-col my-auto max-h-[92vh] sm:max-h-[88vh] overflow-hidden border border-slate-100`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10 shrink-0">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 truncate pr-2">
            {title}
          </h2>
          <button
            type="button"
            onClick={close}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

