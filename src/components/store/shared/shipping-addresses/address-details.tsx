"use client";

// React
import {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";

// Prisma model
import { Country } from "@prisma/client";

// Form handling utilities
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Types, Schema
import { ShippingAddressSchema } from "@/lib/schemas";
import { SelectMenuOption, UserShippingAddressType } from "@/lib/types";

// UI Components
import CountrySelector from "@/components/shared/country-selector";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Queries
import { upsertShippingAddress } from "@/queries/user";
// Utils
import { v4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "../../ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface AddressDetailsProps {
  data?: UserShippingAddressType;
  countries: Country[];
  setShow: Dispatch<SetStateAction<boolean>>;
}

const AddressDetails: FC<AddressDetailsProps> = ({
  data,
  countries,
  setShow,
}) => {
  // Initializing necessary hooks
  const { toast } = useToast(); // Hook for displaying toast messages
  const router = useRouter(); // Hook for routing

  // State for country selector
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // State for selected country
  const defaultValues = useMemo(() => {
    // Priority: existing address -> South Africa -> first available country
    const saCountry = countries?.find(
      (c) => c.code === "ZA" || c.name.toLowerCase() === "south africa"
    );
    let countryId = data?.countryId;
    
    // If no existing countryId, default to South Africa
    if (!countryId) {
      countryId = saCountry?.id || (countries?.length > 0 ? countries[0].id : "");
    }
    
    return {
      firstName: data?.firstName || "",
      lastName: data?.lastName || "",
      address1: data?.address1 || "",
      address2: data?.address2 || "",
      city: data?.city || "",
      countryId: countryId || "", // Will be validated on submit; empty now but form won't submit without a valid value
      phone: data?.phone || "",
      state: data?.state || "",
      zip_code: data?.zip_code || "",
      default: data?.default !== undefined ? data.default : true,
    } satisfies z.infer<typeof ShippingAddressSchema>;
  }, [data, countries]);

  // Form hook for managing form state and validation
  const form = useForm<z.infer<typeof ShippingAddressSchema>>({
    mode: "onSubmit", // Validate on submit to avoid transient invalid UUID during selection
    resolver: zodResolver(ShippingAddressSchema), // Resolver for form validation
    defaultValues,
  });

  // Loading status based on form submission
  const isLoading = form.formState.isSubmitting;

  // Submit handler for form submission
  const handleSubmit = async (
    values: z.infer<typeof ShippingAddressSchema>
  ) => {
    try {
      // Ensure countryId is always set and valid before submission
      let finalCountryId = values.countryId;
      
      // If countryId is empty and countries exist, use the first country
      if (!finalCountryId && countries?.length > 0) {
        finalCountryId = countries[0].id;
      }
      
      // If still no valid countryId, reject submission
      if (!finalCountryId) {
        toast({
          variant: "destructive",
          title: "Oops!",
          description: "Please select a country.",
        });
        return;
      }

      // Upserting address data
      await upsertShippingAddress({
        id: data?.id ? data.id : v4(),
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phone: values.phone.trim(),
        address1: values.address1.trim(),
        address2: values.address2?.trim() || "",
        city: values.city.trim(),
        countryId: finalCountryId,
        state: values.state.trim(),
        default: values.default,
        zip_code: values.zip_code.trim(),
        userId: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Displaying success message
      toast({
        title: data?.id
          ? "Shipping address has been updated."
          : `Congratulations! Shipping address is now created.`,
      });

      // Refresh data
      router.refresh();
      setShow(false);
    } catch (error) {
      const description =
        error instanceof Error ? error.message : "Failed to save address.";
      toast({
        variant: "destructive",
        title: "Oops!",
        description,
      });
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 border-b pb-1.5">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                disabled={isLoading}
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-xs font-semibold text-slate-700">
                      First Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="First name"
                        className="h-10 sm:h-11 rounded-lg text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-xs font-semibold text-slate-700">
                      Last Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Last name"
                        className="h-10 sm:h-11 rounded-lg text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              disabled={isLoading}
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="w-full sm:w-[calc(50%-6px)]">
                  <FormLabel className="text-xs font-semibold text-slate-700">
                    Phone Number *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 082 123 4567"
                      className="h-10 sm:h-11 rounded-lg text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Delivery Address */}
          <div className="space-y-3 pt-1">
            <h3 className="text-sm font-semibold text-slate-900 border-b pb-1.5">
              Delivery Address
            </h3>

            {/* Country */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="countryId"
              render={({ field }) => {
                const selectedCountry = countries?.find((c) => c.id === field.value);
                const saCountry = countries?.find(
                  (c) => c.code === "ZA" || c.name.toLowerCase() === "south africa"
                );
                const displayCountry =
                  selectedCountry || saCountry || (countries?.length > 0 ? countries[0] : null);

                const selectedValue = displayCountry
                  ? { name: displayCountry.name, code: displayCountry.code }
                  : { name: "South Africa", code: "ZA" };

                return (
                  <FormItem className="w-full sm:w-[calc(50%-6px)]">
                    <FormLabel className="text-xs font-semibold text-slate-700">
                      Country *
                    </FormLabel>
                    <FormControl>
                      <CountrySelector
                        id="countries"
                        open={isOpen}
                        onToggle={() => setIsOpen((prev) => !prev)}
                        onChange={(val) => {
                          const selected = countries?.find((c) => c.name === val);
                          if (selected?.id) {
                            field.onChange(selected.id);
                          }
                        }}
                        selectedValue={selectedValue as SelectMenuOption}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Street Address 1 (Full Width) */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="address1"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-xs font-semibold text-slate-700">
                    Street Address *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="House / building number, street name"
                      className="h-10 sm:h-11 rounded-lg text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address 2 (Full Width) */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="address2"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-xs font-semibold text-slate-700">
                    Apartment / Suite / Unit (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Apt, suite, unit, floor, complex (optional)"
                      className="h-10 sm:h-11 rounded-lg text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Province/State & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                disabled={isLoading}
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-xs font-semibold text-slate-700">
                      Province / State *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Gauteng"
                        className="h-10 sm:h-11 rounded-lg text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-xs font-semibold text-slate-700">
                      City / Town *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Johannesburg"
                        className="h-10 sm:h-11 rounded-lg text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Postal Code */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="zip_code"
              render={({ field }) => (
                <FormItem className="w-full sm:w-[calc(50%-6px)]">
                  <FormLabel className="text-xs font-semibold text-slate-700">
                    Postal Code *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 2000"
                      className="h-10 sm:h-11 rounded-lg text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Default Address Checkbox */}
            <FormField
              control={form.control}
              name="default"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0 pt-2 cursor-pointer">
                  <FormControl>
                    <input
                      type="checkbox"
                      id="default-address-checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-4 h-4 rounded border-slate-300 text-pink-600 focus:ring-pink-500 cursor-pointer"
                    />
                  </FormControl>
                  <FormLabel
                    htmlFor="default-address-checkbox"
                    className="text-xs sm:text-sm font-medium text-slate-700 cursor-pointer select-none"
                  >
                    Set as default shipping address
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto h-11 sm:h-12 px-8 bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm sm:text-base rounded-xl transition shadow-md flex items-center justify-center cursor-pointer"
            >
              {isLoading ? (
                <Skeleton className="h-4 w-28 bg-white/40" />
              ) : data?.id ? (
                "Save Address Information"
              ) : (
                "Create Address"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddressDetails;
