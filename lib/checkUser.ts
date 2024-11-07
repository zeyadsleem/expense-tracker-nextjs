import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const checkUser = async () => {
  try {
    const user = await currentUser();

    // Check for current logged in Clerk user
    if (!user) {
      console.error("No user found");
      return null;
    }

    // Check if the user is already in the database
    const loggedInUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    // If user is in database, return user
    if (loggedInUser) {
      return loggedInUser;
    }

    // If not in database, create new user
    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name: `${user.firstName || ""} ${user.lastName || ""}`,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0]?.emailAddress || "",
      },
    });

    return newUser;
  } catch (error) {
    console.error("Error in checkUser function:", error);
    throw new Error(
      `Failed to check or create user: ${
        error instanceof Error ? error.message : error
      }`
    );
  }
};
