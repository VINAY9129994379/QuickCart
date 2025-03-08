 import { Inngest } from "inngest";
import connectDB from "./db.js";
import User from "@/models/User";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "quickcart-next" });

//inngest function to save user data to a database
export const syncUserCreation = inngest.createFunction({
    id:'sync-user-from-clerk'
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
    { id: "quickcart-next-delete-user-from-clerk" }, // ✅ FIXED: No extra spaces
    { event: "clerk/user.deleted" },
    async ({ event }) => {
        try {
            await connectDB(); // Ensure database connection is established

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
