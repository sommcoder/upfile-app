// ! Model Session storage is AUTOMATICALLY handled by the Shopify MongoDB adapter we implemented
//
// model Session {
//   id            String    @id
//   shop          String
//   state         String
//   isOnline      Boolean   @default(false)
//   scope         String?
//   expires       DateTime?
//   accessToken   String
//   userId        BigInt?
//   firstName     String?
//   lastName      String?
//   email         String?
//   accountOwner  Boolean   @default(false)
//   locale        String?
//   collaborator  Boolean?  @default(false)
//   emailVerified Boolean?  @default(false)
// }

import { db } from "../shopify.server";

console.log("db:", db);
