-- CreateEnum
CREATE TYPE "CarSubscriptionTier" AS ENUM ('INDIVIDUAL', 'PREMIUM', 'DEALER');

-- CreateEnum
CREATE TYPE "CarSubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING');

-- CreateEnum
CREATE TYPE "CarListingStatus" AS ENUM ('DRAFT', 'PENDING', 'ACTIVE', 'SOLD', 'EXPIRED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CarCondition" AS ENUM ('NEW', 'USED', 'CERTIFIED_PRE_OWNED');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'PLUGIN_HYBRID', 'LPG', 'OTHER');

-- CreateEnum
CREATE TYPE "TransmissionType" AS ENUM ('MANUAL', 'AUTOMATIC', 'SEMI_AUTOMATIC', 'CVT');

-- CreateEnum
CREATE TYPE "CarSellerType" AS ENUM ('INDIVIDUAL', 'DEALER');

-- CreateTable
CREATE TABLE "CarSubscription" (
    "id" TEXT NOT NULL,
    "tier" "CarSubscriptionTier" NOT NULL,
    "status" "CarSubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ZAR',
    "listingLimit" INTEGER NOT NULL,
    "listingsUsed" INTEGER NOT NULL DEFAULT 0,
    "sponsoredLimit" INTEGER NOT NULL,
    "sponsoredUsed" INTEGER NOT NULL DEFAULT 0,
    "sellerType" "CarSellerType" NOT NULL DEFAULT 'INDIVIDUAL',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "dealerName" TEXT,
    "dealerLicense" TEXT,
    "dealerAddress" TEXT,
    "dealerPhone" TEXT,
    "dealerLogo" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "paymentId" TEXT,
    "paymentStatus" TEXT DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarListing" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "variant" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "priceNegotiable" BOOLEAN NOT NULL DEFAULT false,
    "mileage" INTEGER NOT NULL,
    "fuelType" "FuelType" NOT NULL,
    "transmission" "TransmissionType" NOT NULL,
    "condition" "CarCondition" NOT NULL,
    "bodyType" TEXT,
    "color" TEXT,
    "engineSize" TEXT,
    "drivetrain" TEXT,
    "doors" INTEGER,
    "seats" INTEGER,
    "vin" TEXT,
    "regNumber" TEXT,
    "province" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "features" JSONB,
    "status" "CarListingStatus" NOT NULL DEFAULT 'DRAFT',
    "views" INTEGER NOT NULL DEFAULT 0,
    "inquiries" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isSponsored" BOOLEAN NOT NULL DEFAULT false,
    "sponsoredUntil" TIMESTAMP(3),
    "sponsoredViews" INTEGER NOT NULL DEFAULT 0,
    "sponsoredClicks" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "carSubscriptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "carListingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarInquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "carListingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CarSubscription_userId_idx" ON "CarSubscription"("userId");

-- CreateIndex
CREATE INDEX "CarSubscription_status_idx" ON "CarSubscription"("status");

-- CreateIndex
CREATE INDEX "CarSubscription_sellerType_idx" ON "CarSubscription"("sellerType");

-- CreateIndex
CREATE UNIQUE INDEX "CarListing_slug_key" ON "CarListing"("slug");

-- CreateIndex
CREATE INDEX "CarListing_userId_idx" ON "CarListing"("userId");

-- CreateIndex
CREATE INDEX "CarListing_carSubscriptionId_idx" ON "CarListing"("carSubscriptionId");

-- CreateIndex
CREATE INDEX "CarListing_status_idx" ON "CarListing"("status");

-- CreateIndex
CREATE INDEX "CarListing_make_idx" ON "CarListing"("make");

-- CreateIndex
CREATE INDEX "CarListing_model_idx" ON "CarListing"("model");

-- CreateIndex
CREATE INDEX "CarListing_year_idx" ON "CarListing"("year");

-- CreateIndex
CREATE INDEX "CarListing_price_idx" ON "CarListing"("price");

-- CreateIndex
CREATE INDEX "CarListing_isSponsored_idx" ON "CarListing"("isSponsored");

-- CreateIndex
CREATE INDEX "CarListing_province_idx" ON "CarListing"("province");

-- CreateIndex
CREATE INDEX "CarListing_city_idx" ON "CarListing"("city");

-- CreateIndex
CREATE INDEX "CarImage_carListingId_idx" ON "CarImage"("carListingId");

-- CreateIndex
CREATE INDEX "CarImage_isPrimary_idx" ON "CarImage"("isPrimary");

-- CreateIndex
CREATE INDEX "CarInquiry_carListingId_idx" ON "CarInquiry"("carListingId");

-- CreateIndex
CREATE INDEX "CarInquiry_isRead_idx" ON "CarInquiry"("isRead");

-- AddForeignKey
ALTER TABLE "CarSubscription" ADD CONSTRAINT "CarSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarListing" ADD CONSTRAINT "CarListing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarListing" ADD CONSTRAINT "CarListing_carSubscriptionId_fkey" FOREIGN KEY ("carSubscriptionId") REFERENCES "CarSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarImage" ADD CONSTRAINT "CarImage_carListingId_fkey" FOREIGN KEY ("carListingId") REFERENCES "CarListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarInquiry" ADD CONSTRAINT "CarInquiry_carListingId_fkey" FOREIGN KEY ("carListingId") REFERENCES "CarListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
