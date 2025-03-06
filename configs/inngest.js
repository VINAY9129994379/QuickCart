import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "quickcart-next" });

//inngest function to save user data to a database
export const syncUserCreation = inngest.createFunction({
    id:'sync-user-from-clerk '
},

{
    event:'clerk/user.created'
},
 async({event})=>{
    const {id,first_name,last_name,email_addresses,image_url} = event.data

    const userData = {
        _id:id,
        email:email_addresses[0].email_address,
        name:first_name + ' ' + last_name,
        image_url:image_url
    }
    await connectDB()
    await User.create(userData)
 }

)

//inngest  function to update user data in database

export  const syncUserUpdation = inngest.createFunction(
    {
        id:'update-user-from-clerk'
    },
    {event:'clerk/user.updated'},
    async ({event})=>{

        const {id,first_name,last_name,email_addresses,image_url} = event.data

        const userData = {
            _id:id,
            email:email_addresses[0].email_address,
            name:first_name + ' ' + last_name,
            image_url:image_url
        }
        await connectDB()
        await User.findByIdAndUpdate(id,userData)
    }
)

//inngest function to delete data in databse 
export const syncUserDeletion = inngest.createFunction(
    { id: "delete-user-from-clerk" }, // ✅ Fix ID formatting
    { event: "clerk/user.deleted" }, // ✅ Fix event formatting
    async ({ event }) => {
        try {
            const userId = event.data?.id; // ✅ Extract correct ID

            if (!userId || typeof userId !== "string") {
                throw new Error("❌ Invalid user ID received.");
            }

            console.log(`🗑️ Deleting user with ID: ${userId}`);
            await User.findByIdAndDelete(userId);

            console.log(`✅ User ${userId} deleted successfully`);
        } catch (error) {
            console.error("❌ Error deleting user:", error);
        }
    }
);
