'use server'

import { connectDB } from "@/lib/db"
import ContactModel from "@/models/contact"
import { revalidatePath } from "next/cache"
import { ContactStatus, Contact } from "@/types/contact"

interface ContactData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

type ActionResponse<T = void> =
    | { success: true; message: string; data?: T }
    | { success: false; message: string; error?: string };

type CreateContactResponse =
    | { success: true; message: string; contactId: string }
    | { success: false; message: string; error?: string };

type GetContactsResponse =
    | { success: true; contacts: Contact[] }
    | { success: false; message: string; error?: string };

type UpdateContactResponse = ActionResponse;

export async function createContact(formData: ContactData): Promise<CreateContactResponse> {
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
        const contact = await ContactModel.create({
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

export async function getContacts(): Promise<GetContactsResponse> {
    try {
        await connectDB();
        const contacts = await ContactModel.find().sort({ createdAt: -1 }).lean();

        // Convert ObjectId and Date types to serializable primitives
        const serializedContacts: Contact[] = contacts.map((contact: Record<string, unknown>) => ({
            _id: String(contact._id),
            name: String(contact.name),
            email: String(contact.email),
            subject: String(contact.subject),
            message: String(contact.message),
            status: contact.status as ContactStatus,
            createdAt: contact.createdAt instanceof Date ? contact.createdAt.toISOString() : String(contact.createdAt),
            updatedAt: contact.updatedAt instanceof Date ? contact.updatedAt.toISOString() : String(contact.updatedAt),
        }));

        return {
            success: true,
            contacts: serializedContacts,
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

export async function updateContact(contactId: string, status: ContactStatus): Promise<UpdateContactResponse> {
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
        const contact = await ContactModel.findByIdAndUpdate(
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