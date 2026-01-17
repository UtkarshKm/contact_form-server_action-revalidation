export type ContactStatus = 'pending' | 'read' | 'replied';

// Serialized contact from getContacts() - dates are ISO strings
export interface Contact {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: string; // ISO string after serialization
  updatedAt: string; // ISO string after serialization
}
