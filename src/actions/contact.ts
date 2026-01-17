'use server'

import { connectDB } from "@/lib/db"
import Contact from "@/models/contact"
import { revalidatePath } from "next/cache"

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

export async function getContacts() {
    try {
        await connectDB();
        const contacts = await Contact.find().sort({ createdAt: -1 }).lean();
        return {
            success: true,
            contacts,
        };
    } catch (error) {
        console.error("Error getting contacts:", error);
        return {
            success: false,
            message: "Failed to get contacts",
            error: error instanceof Error ? error.message : String(error) || "An unknown error occurred",
        };
    }
}

export async function updateContact(contactId: string, status: 'pending' | 'read' | 'replied') {
    try {
        await connectDB();

        // Validate status
        const validStatuses = ['pending', 'read', 'replied'];
        if (!validStatuses.includes(status)) {
            return {
                success: false,
                message: "Invalid status. Must be one of: pending, read, replied",
            };
        }

        // Validate contactId
        if (!contactId || typeof contactId !== 'string') {
            return {
                success: false,
                message: "Contact ID is required",
            };
        }

        // Update contact
        const contact = await Contact.findByIdAndUpdate(
            contactId,
            { status },
            { new: true }
        );

        if (!contact) {
            return {
                success: false,
                message: "Contact not found",
            };
        }

        // Revalidate the contacts page
        revalidatePath('/contacts');

        return {
            success: true,
            message: "Contact status updated successfully",
        };
    } catch (error) {
        console.error("Error updating contact:", error);
        return {
            success: false,
            message: "Failed to update contact",
            error: error instanceof Error ? error.message : String(error) || "An unknown error occurred",
        };
    }
}