"use client";

import { type ContactMessagesQuery } from "@repo/graphql";
import { Button, Typography, Icon } from "@repo/ui";
import {
  Drawer,
  useDrawer,
  type DrawerRefType,
} from "@repo/ui/components/Drawer";
import { forwardRef } from "react";

type ContactMessage =
  ContactMessagesQuery["contactMessages"]["messages"][number] & {
    updatedAt?: string;
  };

interface ContactMessageDrawerContentProps {
  message: ContactMessage;
  onUpdate?: () => void;
  onClose: () => void;
}

const ContactMessageDrawerContent = ({
  message,
  onUpdate,
  onClose,
}: ContactMessageDrawerContentProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "text-primary";
      case "READ":
        return "text-warning";
      case "REPLIED":
        return "text-success";
      case "ARCHIVED":
        return "text-muted";
      case "SPAM":
        return "text-error";
      default:
        return "text-muted";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Typography variant="h5" weight="semibold">
            {message.name}
          </Typography>
          <Typography variant="body" color="muted" className="mt-1">
            {message.email}
          </Typography>
        </div>
        <div
          className={`flex items-center gap-1.5 ${getStatusColor(message.status)}`}
        >
          <Icon name="Circle" size={8} className="fill-current" />
          <Typography variant="caption" weight="medium">
            {message.status}
          </Typography>
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-surface rounded-lg border border-border">
        <div>
          <Typography variant="caption" color="muted">
            Received
          </Typography>
          <Typography variant="body" weight="medium">
            {new Date(message.createdAt).toLocaleString()}
          </Typography>
        </div>
        {message.repliedAt && (
          <div>
            <Typography variant="caption" color="muted">
              Replied
            </Typography>
            <Typography variant="body" weight="medium">
              {new Date(message.repliedAt).toLocaleString()}
            </Typography>
          </div>
        )}
        {message.ipAddress && (
          <div>
            <Typography variant="caption" color="muted">
              IP Address
            </Typography>
            <Typography variant="body" weight="medium">
              {message.ipAddress}
            </Typography>
          </div>
        )}
        {message.userAgent && (
          <div className="col-span-2">
            <Typography variant="caption" color="muted">
              User Agent
            </Typography>
            <Typography variant="caption" className="break-all">
              {message.userAgent}
            </Typography>
          </div>
        )}
      </div>

      {/* Message Content */}
      <div>
        <Typography variant="body" weight="medium" className="mb-2">
          Message
        </Typography>
        <div className="p-4 bg-surface rounded-lg border border-border">
          <Typography variant="body" className="whitespace-pre-wrap">
            {message.message}
          </Typography>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-border">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Close
        </Button>
        {onUpdate && message.status === "NEW" && (
          <Button onClick={onUpdate} className="flex-1">
            <Icon name="MailOpen" size={16} />
            Mark as Read
          </Button>
        )}
      </div>
    </div>
  );
};

export type ContactMessageDrawerRef = DrawerRefType<ContactMessage>;

interface ContactMessageDrawerProps {
  onUpdate?: () => void;
}

export const ContactMessageDrawer = forwardRef<
  ContactMessageDrawerRef,
  ContactMessageDrawerProps
>(({ onUpdate }, ref) => {
  const drawerRef = useDrawer<ContactMessage>();

  return (
    <Drawer ref={ref || drawerRef} title="Message Details">
      {(_, message) => {
        // Type guard to ensure message is properly typed
        const typedMessage = message as ContactMessage | null | undefined;
        return typedMessage ? (
          <ContactMessageDrawerContent
            message={typedMessage}
            onUpdate={onUpdate}
            onClose={() => {
              if (ref && typeof ref !== "function" && ref.current) {
                ref.current.close();
              } else if (drawerRef.current) {
                drawerRef.current.close();
              }
            }}
          />
        ) : null;
      }}
    </Drawer>
  );
});

ContactMessageDrawer.displayName = "ContactMessageDrawer";
