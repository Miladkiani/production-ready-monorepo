"use client";

import { useCallback, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import { Button, Icon, Typography } from "@repo/ui";
import { Table, type Column } from "@repo/ui/components/Table";
import { type ContactMessagesQuery } from "@repo/graphql";
import { useDrawer } from "@repo/ui/components/Drawer";
import { useState } from "react";
import {
  deleteContactMessageAction,
  markAsReadAction,
} from "../contact-actions";
import { ContactMessageDrawer } from "./ContactMessageDrawer";

// Extract the contact message type from the query result
type ContactMessage =
  ContactMessagesQuery["contactMessages"]["messages"][number] & {
    updatedAt?: string;
  };

interface ContactMessageTableProps {
  messages?: ContactMessage[];
}

// Memoized status badge component
const StatusBadge = memo(({ status }: { status: string }) => {
  const styles = {
    NEW: "bg-primary/10 text-primary",
    READ: "bg-warning/10 text-warning",
    REPLIED: "bg-success/10 text-success",
    ARCHIVED: "bg-surface text-muted",
    SPAM: "bg-error/10 text-error",
  };

  const icons = {
    NEW: "Mail" as const,
    READ: "MailOpen" as const,
    REPLIED: "CheckCircle" as const,
    ARCHIVED: "Archive" as const,
    SPAM: "AlertTriangle" as const,
  };

  return (
    <div className="flex items-center gap-1.5">
      <Icon
        name={icons[status as keyof typeof icons] || icons.NEW}
        size={14}
        className="flex-shrink-0"
      />
      <span
        className={`px-2 py-1 rounded-md text-xs font-medium ${styles[status as keyof typeof styles] || styles.NEW}`}
      >
        {status}
      </span>
    </div>
  );
});

StatusBadge.displayName = "StatusBadge";

export const ContactMessageTable: React.FC<ContactMessageTableProps> = memo(
  ({ messages }) => {
    const router = useRouter();
    const drawerRef = useDrawer<ContactMessage>();
    const [filterStatus, setFilterStatus] = useState<string>("all");

    const filteredMessages = useMemo(() => {
      if (filterStatus === "all") return messages || [];
      return messages?.filter((m) => m.status === filterStatus) || [];
    }, [messages, filterStatus]);

    const markAsRead = useCallback(
      async (message: ContactMessage) => {
        if (message.status !== "NEW") return;

        try {
          await markAsReadAction(message.id);
          router.refresh();
        } catch (error) {
          console.error("Failed to mark as read:", error);
          alert("Failed to mark as read. Please try again.");
        }
      },
      [router],
    );

    const deleteMessage = useCallback(
      async (message: ContactMessage) => {
        if (
          !confirm(
            `Are you sure you want to delete the message from "${message.name}"?`,
          )
        )
          return;

        try {
          await deleteContactMessageAction(message.id);
          router.refresh();
        } catch (error) {
          console.error("Failed to delete message:", error);
          alert("Failed to delete message. Please try again.");
        }
      },
      [router],
    );

    const columns = useMemo<Column<ContactMessage>[]>(
      () => [
        {
          key: "name",
          title: "Sender",
          render: (row: ContactMessage) => (
            <div className="flex flex-col gap-1 min-w-[180px]">
              <Typography variant="body" weight="medium">
                {row.name}
              </Typography>
              <Typography variant="caption" color="muted" className="break-all">
                {row.email}
              </Typography>
            </div>
          ),
        },
        {
          key: "message",
          title: "Message",
          render: (row: ContactMessage) => (
            <div className="min-w-[300px] max-w-[500px]">
              <Typography variant="body" className="line-clamp-2">
                {row.message}
              </Typography>
            </div>
          ),
        },
        {
          key: "status",
          title: "Status",
          render: (row: ContactMessage) => <StatusBadge status={row.status} />,
        },
        {
          key: "createdAt",
          title: "Received",
          render: (row: ContactMessage) => (
            <div className="flex flex-col gap-1 min-w-[120px]">
              <Typography variant="caption" color="text">
                {new Date(row.createdAt).toLocaleDateString()}
              </Typography>
              <Typography variant="caption" color="muted">
                {new Date(row.createdAt).toLocaleTimeString()}
              </Typography>
            </div>
          ),
        },
        {
          key: "actions",
          title: "Actions",
          render: (row: ContactMessage) => (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                icon="Eye"
                onClick={() => drawerRef.current?.open(row)}
                aria-label="View message"
              />
              {row.status === "NEW" && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon="MailOpen"
                  onClick={() => markAsRead(row)}
                  aria-label="Mark as read"
                />
              )}
              <Button
                variant="ghost"
                size="sm"
                icon="Trash2"
                onClick={() => deleteMessage(row)}
                aria-label="Delete message"
              />
            </div>
          ),
        },
      ],
      [markAsRead, deleteMessage, drawerRef],
    );

    const statusFilters = [
      { label: "All", value: "all" },
      { label: "New", value: "NEW" },
      { label: "Read", value: "READ" },
      { label: "Replied", value: "REPLIED" },
      { label: "Archived", value: "ARCHIVED" },
      { label: "Spam", value: "SPAM" },
    ];

    return (
      <>
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Typography variant="h5" weight="semibold">
                All Messages ({filteredMessages.length})
              </Typography>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Typography variant="caption" color="muted">
                Filter:
              </Typography>
              <div className="flex gap-2 flex-wrap">
                {statusFilters.map((filter) => (
                  <Button
                    key={filter.value}
                    variant={
                      filterStatus === filter.value ? "solid" : "outline"
                    }
                    size="sm"
                    onClick={() => setFilterStatus(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Table<ContactMessage>
            data={filteredMessages}
            columns={columns}
            emptyMessage="No messages found."
          />
        </div>

        {/* Message Detail Drawer */}
        <ContactMessageDrawer
          ref={drawerRef}
          onUpdate={() => {
            router.refresh();
            drawerRef.current?.close();
          }}
        />
      </>
    );
  },
);

ContactMessageTable.displayName = "ContactMessageTable";
