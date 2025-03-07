import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "quickcart-next" });

// Inngest function to save user data to the database
export const syncUserCreation = inngest.createFunction(
    { id: "sync-user-from-clerk" },
    { event: "clerk/user.created" },
    async ({ event }) => {
        try {
            await connectDB();

            const { id, first_name, last_name, email_addresses, image_url } = event.data;
            const userData = {
                _id: id,
                email: email_addresses[0]?.email_address || "",
                name: `${first_name} ${last_name}`,
                image_url,
            };

            await User.create(userData);
            console.log(`User ${id} created successfully.`);
        } catch (error) {
            console.error("Error creating user:", error);
        }
    }
);

// Inngest function to update user data in the database
export const syncUserUpdation = inngest.createFunction(
    { id: "update-user-from-clerk" },
    { event: "clerk/user.updated" },
    async ({ event }) => {
        try {
            await connectDB();

            const { id, first_name, last_name, email_addresses, image_url } = event.data;
            const userData = {
                email: email_addresses[0]?.email_address || "",
                name: `${first_name} ${last_name}`,
                image_url,
            };

            const updatedUser = await User.findByIdAndUpdate(id, userData, { new: true });
            if (!updatedUser) {
                console.warn(`User ${id} not found.`);
            } else {
                console.log(`User ${id} updated successfully.`);
            }
        } catch (error) {
            console.error("Error updating user:", error);
        }
    }
);

// Inngest function to delete user data in the database
export const syncUserDeletion = inngest.createFunction(
    { id: "delete-user-from-clerk" },
    { event: "clerk/user.deleted" },
    async ({ event }) => {
        try {
            await connectDB();

            const userId = event.data?.id;
            if (!userId) {
                throw new Error("Invalid user ID received.");
            }

            console.log(`Attempting to delete user with ID: ${userId}`);
            const deletedUser = await User.findByIdAndDelete(userId);

            if (!deletedUser) {
                console.warn(`User ${userId} not found.`);
            } else {
                console.log(`User ${userId} deleted successfully.`);
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    }
);
