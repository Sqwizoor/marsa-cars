import AddressContainer from "@/components/store/profile/addresses/container";
import { db } from "@/lib/db";
import { getUserShippingAddresses } from "@/queries/user";

export const dynamic = 'force-dynamic';

export default async function ProfileAddressesPage() {
  const addresses = await getUserShippingAddresses();
  const dbCountries = await db.country.findMany();
  const countries = dbCountries.sort((a, b) =>
    a.code === "ZA" ? -1 : b.code === "ZA" ? 1 : a.name.localeCompare(b.name)
  );
  return (
    <div>
      <AddressContainer addresses={addresses} countries={countries} />
    </div>
  );
}
