import { db } from "./db";
import { getUser } from "./lucia";
import { userSubscriptions } from "./db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

const DAY_IN_MS = 1000 * 60 * 60 * 24;
export const checkSubscription = async () => {
  const user = await getUser();
  if (!user) {
    redirect("/authenticate");
  }

  const _userSubscriptions = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, user.id));

  if (!_userSubscriptions[0]) {
    return false;
  }

  const userSubscription = _userSubscriptions[0];

  const isValid =
    userSubscription.stripePriceId &&
    userSubscription.stripeCurrentPeriodEnd &&
    userSubscription.stripeCurrentPeriodEnd.getTime() + DAY_IN_MS > Date.now();

  return isValid;
};
