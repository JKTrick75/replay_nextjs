/*
  Warnings:

  - You are about to drop the `order` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX `Console_brandId_fkey` ON `console`;

-- DropIndex
DROP INDEX `Favorite_listingId_fkey` ON `favorite`;

-- DropIndex
DROP INDEX `Listing_gameId_fkey` ON `listing`;

-- DropIndex
DROP INDEX `Listing_platformId_fkey` ON `listing`;

-- DropIndex
DROP INDEX `Listing_sellerId_fkey` ON `listing`;

-- DropIndex
DROP INDEX `ListingPhoto_listingId_fkey` ON `listingphoto`;

-- AlterTable
ALTER TABLE `listing` ADD COLUMN `buyerId` VARCHAR(36) NULL,
    ADD COLUMN `soldAt` DATETIME(3) NULL;

-- DropTable
DROP TABLE `order`;

-- AddForeignKey
ALTER TABLE `Console` ADD CONSTRAINT `Console_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brand`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Listing` ADD CONSTRAINT `Listing_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Listing` ADD CONSTRAINT `Listing_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Listing` ADD CONSTRAINT `Listing_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Listing` ADD CONSTRAINT `Listing_platformId_fkey` FOREIGN KEY (`platformId`) REFERENCES `Console`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListingPhoto` ADD CONSTRAINT `ListingPhoto_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GamePlatforms` ADD CONSTRAINT `_GamePlatforms_A_fkey` FOREIGN KEY (`A`) REFERENCES `Console`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GamePlatforms` ADD CONSTRAINT `_GamePlatforms_B_fkey` FOREIGN KEY (`B`) REFERENCES `Game`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
