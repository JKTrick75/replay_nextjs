/*
  Warnings:

  - Made the column `genre` on table `game` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `CartItem_listingId_fkey` ON `cartitem`;

-- DropIndex
DROP INDEX `Console_brandId_fkey` ON `console`;

-- DropIndex
DROP INDEX `Favorite_listingId_fkey` ON `favorite`;

-- DropIndex
DROP INDEX `Listing_buyerId_fkey` ON `listing`;

-- DropIndex
DROP INDEX `Listing_gameId_fkey` ON `listing`;

-- DropIndex
DROP INDEX `Listing_platformId_fkey` ON `listing`;

-- DropIndex
DROP INDEX `Listing_sellerId_fkey` ON `listing`;

-- DropIndex
DROP INDEX `ListingPhoto_listingId_fkey` ON `listingphoto`;

-- AlterTable
ALTER TABLE `game` MODIFY `genre` VARCHAR(191) NOT NULL DEFAULT 'Varios';

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
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GamePlatforms` ADD CONSTRAINT `_GamePlatforms_A_fkey` FOREIGN KEY (`A`) REFERENCES `Console`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GamePlatforms` ADD CONSTRAINT `_GamePlatforms_B_fkey` FOREIGN KEY (`B`) REFERENCES `Game`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
