# Contact Form with Server Actions & Revalidation

A modern Next.js contact form application demonstrating server actions, MongoDB integration, and automatic page revalidation. Built with TypeScript, shadcn/ui components, and React Hook Form.

## Features

- **Contact Form**: Validated form with Zod schema validation
- **Server Actions**: Next.js server actions for form submission and data fetching
- **MongoDB Integration**: Mongoose ODM for database operations
- **Status Management**: Update contact status (pending, read, replied) with inline UI
- **Automatic Revalidation**: Page automatically refreshes after status updates using `revalidatePath`
- **TypeScript**: Fully typed with shared types and explicit return types
- **Modern UI**: Built with shadcn/ui components (Card, Badge, Button, Form)
- **Responsive Design**: Mobile-friendly interface with dark mode support

## Tech Stack

- **Framework**: Next.js 16.1.2 (App Router)
- **Language**: TypeScript 5
- **Database**: MongoDB with Mongoose
- **Form Handling**: React Hook Form + Zod validation
- **UI Components**: shadcn/ui (New York style)
- **Styling**: Tailwind CSS 4
- **Runtime**: Bun (or Node.js)

## Getting Started

### Prerequisites

- Node.js 20+ or Bun
- MongoDB database (local or cloud like MongoDB Atlas)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd contact_form-server_action-revalidation
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

3. Create a `.env.local` file in the root directory:
```env
MONGO_URI=your_mongodb_connection_string
```

4. Run the development server:
```bash
bun dev
# or
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── actions/           # Server actions
│   └── contact.ts     # Contact CRUD operations
├── app/               # Next.js app router pages
│   ├── page.tsx       # Home page with contact form
│   └── contacts/      # Contacts list page
│       └── page.tsx
├── components/        # React components
│   ├── contact-form.tsx    # Contact form component
│   ├── contact-list.tsx    # Contact list (server component)
│   ├── contact-card.tsx    # Contact card (client component)
│   └── ui/            # shadcn/ui components
├── lib/               # Utility functions
│   ├── db.ts         # MongoDB connection
│   └── utils.ts      # Helper functions
├── models/            # Mongoose models
│   └── contact.ts    # Contact schema
└── types/             # TypeScript type definitions
    └── contact.ts     # Shared Contact types
```

## Key Concepts & Things I Learned

### 1. Server Actions (`'use server'`)

Server Actions are Next.js functions that run on the server. They can be called directly from client components without creating API routes.

```typescript
'use server'

export async function createContact(formData: ContactData) {
  // This runs on the server
  await connectDB();
  const contact = await ContactModel.create(formData);
  return { success: true, contactId: contact._id.toString() };
}
```

**Key Points:**
- Must be marked with `'use server'` directive
- Can be imported and called directly from client components
- Automatically handle serialization of data
- Cannot return non-serializable data (like Mongoose documents)

### 2. `revalidatePath` - Automatic Page Refresh

`revalidatePath` invalidates cached data for a specific path, causing Next.js to fetch fresh data on the next request.

```typescript
import { revalidatePath } from "next/cache"

export async function updateContact(contactId: string, status: ContactStatus) {
  await ContactModel.findByIdAndUpdate(contactId, { status });
  
  // This tells Next.js to refresh /contacts page
  revalidatePath('/contacts');
  
  return { success: true, message: "Status updated successfully" };
}
```

**How it works:**
- When called in a Server Action, it marks the specified path for revalidation
- On the next visit to that path, Next.js fetches fresh data
- The UI automatically updates without manual refresh
- Works with both specific URLs and route patterns

**Usage:**
- `revalidatePath('/contacts')` - Revalidates a specific page
- `revalidatePath('/blog/[slug]', 'page')` - Revalidates dynamic routes
- `revalidatePath('/', 'layout')` - Revalidates entire app

**Important Notes:**
- Only works in Server Actions and Route Handlers (server-side)
- Cannot be called from Client Components
- Updates happen on the next page visit, not immediately
- In Server Actions, it updates the UI immediately if you're viewing the affected path

### 3. `useTransition` Hook

`useTransition` marks state updates as non-urgent, keeping the UI responsive during async operations.

```typescript
const [isPending, startTransition] = useTransition()

const handleStatusChange = (newStatus: ContactStatus) => {
  startTransition(async () => {
    const result = await updateContact(contact._id, newStatus)
    // Handle result
  })
}
```

**Benefits:**
- Provides `isPending` state to show loading indicators
- Keeps UI responsive during async operations
- Works seamlessly with Server Actions
- Better than `useState` for tracking async operations

### 4. Memory Leak Prevention with `useRef` and `useEffect`

Preventing memory leaks when components unmount during async operations:

```typescript
const messageTimeoutRef = useRef<number | null>(null)
const isMountedRef = useRef(true)

useEffect(() => {
  return () => {
    // Cleanup on unmount
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current)
    }
    isMountedRef.current = false
  }
}, [])

// Check if mounted before setting state
if (isMountedRef.current) {
  setMessage("Status updated!")
}
```

**Why it's important:**
- Prevents "Can't perform a React state update on an unmounted component" warnings
- Cleans up timers/intervals when component unmounts
- Prevents memory leaks from lingering async operations

### 5. Mongoose Document Serialization

Mongoose documents cannot be directly serialized and passed to Client Components. They must be converted to plain objects.

```typescript
// ❌ This causes serialization errors
const contacts = await Contact.find().lean();
return { contacts }; // Mongoose document with toJSON methods

// ✅ Convert to plain objects
const serializedContacts: Contact[] = contacts.map(contact => ({
  _id: contact._id.toString(),
  name: contact.name,
  // ... other fields
  createdAt: contact.createdAt instanceof Date 
    ? contact.createdAt.toISOString() 
    : String(contact.createdAt),
}));
```

**Key Points:**
- Use `.lean()` to get plain JavaScript objects instead of Mongoose documents
- Convert ObjectId to string with `.toString()`
- Convert Date objects to ISO strings for serialization
- Type the result properly with TypeScript interfaces

### 6. Shared TypeScript Types

Creating a single source of truth for types improves maintainability:

```typescript
// src/types/contact.ts
export type ContactStatus = 'pending' | 'read' | 'replied';

export interface Contact {
  _id: string;
  name: string;
  email: string;
  status: ContactStatus;
  createdAt: string; // ISO string after serialization
  updatedAt: string;
}
```

**Benefits:**
- Single source of truth - change once, update everywhere
- Better IDE autocomplete
- Catch type errors at compile time
- Easier refactoring

### 7. Explicit Return Types for Server Actions

Adding explicit return types makes function contracts clear:

```typescript
type GetContactsResponse = 
  | { success: true; contacts: Contact[] }
  | { success: false; message: string; error?: string };

export async function getContacts(): Promise<GetContactsResponse> {
  // Implementation
}
```

**Benefits:**
- Clear contract of what the function returns
- TypeScript catches mismatches
- Better IDE support
- Self-documenting code

### 8. shadcn/ui Components

shadcn/ui provides copy-pasteable, customizable components built on Radix UI.

**Installation:**
```bash
bunx shadcn@latest add card
```

**Usage:**
- Components are in `src/components/ui/`
- Fully customizable - they're your code
- Built on Radix UI primitives
- Accessible by default

## Common Improvements & Best Practices

### 1. Error Handling

Always handle errors gracefully in Server Actions:

```typescript
try {
  // Operation
} catch (error) {
  console.error("Error:", error);
  return {
    success: false,
    message: "Operation failed",
    error: error instanceof Error ? error.message : String(error)
  };
}
```

### 2. Input Validation

Validate inputs both on client (Zod) and server:

```typescript
// Client-side (Zod)
const formSchema = z.object({
  email: z.string().email()
});

// Server-side
if (!email || !isValidEmail(email)) {
  return { success: false, message: "Invalid email" };
}
```

### 3. Database Connection Management

Reuse database connections to avoid connection overhead:

```typescript
let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return; // Reuse existing connection
  await mongoose.connect(MONGO_URI);
  isConnected = true;
};
```

### 4. Type Safety

- Use explicit return types for functions
- Create shared types for reused data structures
- Avoid `any` types - use `unknown` or proper types
- Type Mongoose results properly after serialization

### 5. Component Organization

- Separate Server Components (async, data fetching) from Client Components (interactivity)
- Keep shared types in `src/types/`
- Group related components together
- Use shadcn/ui for consistent UI components

### 6. Performance Optimizations

- Use `useTransition` for non-urgent updates
- Implement proper cleanup in `useEffect`
- Serialize data properly to avoid unnecessary re-renders
- Use `revalidatePath` strategically (not on every operation)

## Environment Variables

Create a `.env.local` file:

```env
MONGO_URI=mongodb://localhost:27017/contact_form
# or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
```

## Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun start` - Start production server
- `bun lint` - Run ESLint

## Learn More

- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [revalidatePath Documentation](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
- [React useTransition](https://react.dev/reference/react/useTransition)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)

## License

MIT
