export interface ContactNotificationData {
  name: string;
  email: string;
  message: string;
  messageId: string;
  submittedAt: Date;
  ipAddress?: string;
}
