'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { updateContact } from "@/actions/contact"
import { cn } from "@/lib/utils"
import { Contact, ContactStatus } from "@/types/contact"

interface ContactCardProps {
    contact: Contact;
}

const statusColors: Record<ContactStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
    read: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    replied: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
}

const statusOptions: ContactStatus[] = ['pending', 'read', 'replied']

export default function ContactCard({ contact }: ContactCardProps) {
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<string>("")
    const messageTimeoutRef = useRef<number | null>(null)
    const isMountedRef = useRef(true)

    const handleStatusChange = (newStatus: ContactStatus) => {
        if (newStatus === contact.status) return

        // Clear any existing timeout before setting a new one
        if (messageTimeoutRef.current) {
            clearTimeout(messageTimeoutRef.current)
            messageTimeoutRef.current = null
        }

        if (isMountedRef.current) {
            setMessage("")
        }
        startTransition(async () => {
            const result = await updateContact(contact._id, newStatus)
            if (result.success) {
                if (isMountedRef.current) {
                    setMessage("Status updated successfully!")
                    messageTimeoutRef.current = window.setTimeout(() => {
                        if (isMountedRef.current) {
                            setMessage("")
                        }
                        messageTimeoutRef.current = null
                    }, 3000)
                }
            } else {
                if (isMountedRef.current) {
                    setMessage(result.message || "Failed to update status")
                }
            }
        })
    }

    useEffect(() => {
        return () => {
            // Clear timeout on unmount
            if (messageTimeoutRef.current) {
                clearTimeout(messageTimeoutRef.current)
                messageTimeoutRef.current = null
            }
            // Mark component as unmounted
            isMountedRef.current = false
        }
    }, [])

    const formatDate = (date: string) => {
        const d = new Date(date)
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-center gap-3 flex-wrap">
                    <CardTitle className="text-lg">{contact.name}</CardTitle>
                    <Badge className={cn(statusColors[contact.status])}>
                        {contact.status}
                    </Badge>
                </div>
                <CardDescription>{contact.email}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <div>
                    <p className="font-medium text-foreground">{contact.subject}</p>
                </div>
                <div className="pt-2 border-t">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{contact.message}</p>
                </div>

                {message && (
                    <div className={cn(
                        "text-sm p-2 rounded",
                        message.includes("successfully")
                            ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                    )}>
                        {message}
                    </div>
                )}
            </CardContent>

            <CardFooter className="border-t flex items-center justify-between">
                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                    <span>Created: {formatDate(contact.createdAt)}</span>
                    {contact.updatedAt && new Date(contact.createdAt).getTime() !== new Date(contact.updatedAt).getTime() && (
                        <span>Updated: {formatDate(contact.updatedAt)}</span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {statusOptions.map((status) => (
                        <Button
                            key={status}
                            variant={contact.status === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleStatusChange(status)}
                            disabled={isPending || contact.status === status}
                            className="capitalize"
                        >
                            {status}
                        </Button>
                    ))}
                </div>
            </CardFooter>
        </Card>
    )
}
