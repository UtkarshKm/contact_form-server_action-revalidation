'use server'

import { connectDB } from "@/lib/db"
import Contact from "@/models/contact"

interface ContactData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export async function createContact(formData: ContactData) {
    try {
        await connectDB();
        const name = formData.name;
        const email = formData.email;
        const subject = formData.subject;
        const message = formData.message;

        //validation
        if (!name || !email || !subject || !message) {
            return {
                success: false,
                message: "All fields are required",
            }
        }
        const contact = await Contact.create({
            name: name.trim(),
            email: email.trim(),
            subject: subject.trim(),
            message: message.trim(),
        })

        return {
            success: true,
            message: "Contact created successfully",
            contactId: contact._id.toString(),
        };
    } catch (error) {
        console.error("Error creating contact:", error);
        return {
            success: false,
            message: "Failed to create contact",
            error: error instanceof Error ? error.message : String(error) || "An unknown error occurred",
        };
    }
}