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
    // Ensure countryId is always a valid country ID from the database
    // Priority: existing address -> first available country
    let countryId = data?.countryId;
    
    // If no existing countryId, use the first country's id
    if (!countryId && countries?.length > 0) {
      countryId = countries[0].id;
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
      default: data?.default || false,
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
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        address1: values.address1,
        address2: values.address2 || "",
        city: values.city,
        countryId: finalCountryId,
        state: values.state,
        default: values.default,
        zip_code: values.zip_code,
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
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <FormLabel>Contact information</FormLabel>
            <div className="flex items-center justify-between gap-3">
              <FormField
                disabled={isLoading}
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="First name*" {...field} />
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
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Last name*" {...field} />
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
                <FormItem className="flex-1 w-[calc(50%-8px)] !mt-3">
                  <FormControl>
                    <Input placeholder="Phone number*" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-2">
            <FormLabel>Address</FormLabel>
            <div>
              <FormField
                disabled={isLoading}
                control={form.control}
                name="countryId"
                render={({ field }) => {
                  // Find selected country by ID
                  const selectedCountry = countries?.find((c) => c.id === field.value);
                  
                  // Display the selected country or default to first
                  const displayCountry = selectedCountry || (countries?.length > 0 ? countries[0] : null);
                  
                  const selectedValue = displayCountry
                    ? { name: displayCountry.name, code: displayCountry.code }
                    : { name: "Select Country", code: "ZA" };

                  return (
                    <FormItem className="flex-1 w-[calc(50%-8px)] !mt-3">
                      <FormControl>
                        <CountrySelector
                          id="countries"
                          open={isOpen}
                          onToggle={() => setIsOpen((prev) => !prev)}
                          onChange={(val) => {
                            const selected = countries?.find(
                              (c) => c.name === val
                            );
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
            </div>
            <div className="!mt-3 flex items-center justify-between gap-3">
              <FormField
                disabled={isLoading}
                control={form.control}
                name="address1"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Street, house/apartment/unit*"
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
                name="address2"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Apt, suite, unit, etc (optional）"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="!mt-3 flex items-center justify-between gap-3">
              <FormField
                disabled={isLoading}
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="State*" {...field} />
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
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="City*" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              disabled={isLoading}
              control={form.control}
              name="zip_code"
              render={({ field }) => (
                <FormItem className="flex-1 w-[calc(50%-8px)] !mt-3">
                  <FormControl>
                    <Input placeholder="Zip code*" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="rounded-md">
            {isLoading ? (
              <Skeleton className="h-4 w-28 bg-white/40" />
            ) : data?.id ? (
              "Save address information"
            ) : (
              "Create address"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AddressDetails;
