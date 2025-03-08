import { Inngest } from "inngest";
import connectDB from "./db.js";
import User from "@/models/User";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "quickcart-next" });

// Inngest function to save user data to a database
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
        name: `${first_name} ${last_name}`.trim(),
        image_url: image_url || "",
      };

      await User.create(userData);
      console.log(`✅ User created: ${id}`);
    } catch (error) {
      console.error("❌ Error syncing user creation:", error);
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
        name: `${first_name} ${last_name}`.trim(),
        image_url: image_url || "",
      };

      const updatedUser = await User.findByIdAndUpdate(id, userData, { new: true, upsert: true });
      console.log(`🔄 User updated: ${id}`, updatedUser);
    } catch (error) {
      console.error("❌ Error updating user:", error);
    }
  }
);

// Inngest function to delete user data in the database
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      await connectDB();

      const { id } = event.data;
      await User.findByIdAndDelete(id);
      console.log(`🗑️ User deleted: ${id}`);
    } catch (error) {
      console.error("❌ Error deleting user:", error);
    }
  }
);
