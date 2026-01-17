import { getContacts } from '@/actions/contact';
import { Badge } from "@/components/ui/badge"
import ContactCard from './contact-card';

async function ContactList() {
    const result = await getContacts();

    if (!result.success) {
        return (
            <div className="p-4 rounded-md bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                <p>{result.message || "Failed to load contacts"}</p>
            </div>
        );
    }

    const data = result.contacts;

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <h2 className='text-2xl font-bold'>Contact Messages</h2>
                <Badge variant={'secondary'}>{data?.length ?? 0} Messages</Badge>
            </div>

            {!data || data.length === 0 ? (
                <div className="text-center py-12 px-4">
                    <p className="text-muted-foreground text-lg">No contact messages yet.</p>
                    <p className="text-muted-foreground text-sm mt-2">Messages will appear here once someone submits the contact form.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {data.map((contact) => (
                        <ContactCard
                            key={contact._id.toString()}
                            contact={{
                                _id: contact._id.toString(),
                                name: contact.name,
                                email: contact.email,
                                subject: contact.subject,
                                message: contact.message,
                                status: contact.status as 'pending' | 'read' | 'replied',
                                createdAt: contact.createdAt,
                                updatedAt: contact.updatedAt,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default ContactList
