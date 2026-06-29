import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ContactMessage as PrismaContactMessage,
  ContactMessageStatus,
  Prisma,
} from '@prisma/client';

interface MessageStatistics {
  total: number;
  new: number;
  read: number;
  replied: number;
}

interface MessageListResult {
  messages: PrismaContactMessage[];
  total: number;
}

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new contact message
   */
  async createMessage(data: {
    name: string;
    email: string;
    message: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<PrismaContactMessage> {
    try {
      const message = await this.prisma.contactMessage.create({
        data: {
          name: data.name,
          email: data.email,
          message: data.message,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          status: ContactMessageStatus.NEW,
        },
      });

      this.logger.log(
        `New contact message from ${data.email} (ID: ${message.id})`,
      );

      return message;
    } catch (error) {
      this.logger.error('Failed to create contact message', error);
      throw error;
    }
  }

  /**
   * Get all messages with optional filtering
   */
  async getMessages(filter?: {
    status?: ContactMessageStatus;
    skip?: number;
    take?: number;
  }): Promise<MessageListResult> {
    const where: Prisma.ContactMessageWhereInput = {};

    if (filter?.status) {
      where.status = filter.status;
    }

    const [messages, total] = await Promise.all([
      this.prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: filter?.skip,
        take: filter?.take ?? 20,
      }),
      this.prisma.contactMessage.count({ where }),
    ]);

    return { messages, total };
  }

  /**
   * Get a single message by ID
   */
  async getMessage(id: string): Promise<PrismaContactMessage | null> {
    return await this.prisma.contactMessage.findUnique({
      where: { id },
    });
  }

  /**
   * Update message status
   */
  async updateMessageStatus(
    id: string,
    status: ContactMessageStatus,
    adminNotes?: string,
  ): Promise<PrismaContactMessage> {
    const updateData: Prisma.ContactMessageUpdateInput = {
      status,
    };

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    if (status === ContactMessageStatus.REPLIED) {
      updateData.repliedAt = new Date();
      // TODO: Set repliedBy from authenticated user
    }

    return await this.prisma.contactMessage.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Mark message as read
   */
  async markAsRead(id: string): Promise<PrismaContactMessage | null> {
    const message = await this.getMessage(id);
    if (message && message.status === ContactMessageStatus.NEW) {
      return await this.updateMessageStatus(id, ContactMessageStatus.READ);
    }
    return message;
  }

  /**
   * Delete a message (hard delete)
   */
  async deleteMessage(id: string): Promise<PrismaContactMessage> {
    return await this.prisma.contactMessage.delete({
      where: { id },
    });
  }

  /**
   * Get message statistics
   */
  async getStatistics(): Promise<MessageStatistics> {
    const [total, newCount, readCount, repliedCount] = await Promise.all([
      this.prisma.contactMessage.count(),
      this.prisma.contactMessage.count({
        where: { status: ContactMessageStatus.NEW },
      }),
      this.prisma.contactMessage.count({
        where: { status: ContactMessageStatus.READ },
      }),
      this.prisma.contactMessage.count({
        where: { status: ContactMessageStatus.REPLIED },
      }),
    ]);

    return {
      total,
      new: newCount,
      read: readCount,
      replied: repliedCount,
    };
  }
}
