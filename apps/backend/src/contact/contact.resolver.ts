import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ZodValidationPipe } from 'nestjs-zod';
import { ContactService } from './contact.service';
import { EmailService } from '../email/email.service';
import {
  ContactMessage,
  ContactMessageList,
  ContactMessageResponse,
  ContactMessageStatistics,
} from './entities/contact.entity';
import {
  CreateContactMessageInput,
  UpdateContactMessageStatusInput,
  ContactMessagesFilterInput,
} from './contact.inputs';
import {
  createContactMessageSchema,
  updateContactMessageStatusSchema,
} from '@repo/validation';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Resolver(() => ContactMessage)
export class ContactResolver {
  constructor(
    private readonly contactService: ContactService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Public mutation to submit a contact form
   * Rate limited to 3 submissions per hour per IP
   */
  @Mutation(() => ContactMessageResponse)
  @Throttle({ long: { limit: 3, ttl: 3600000 } })
  async submitContactForm(
    @Args('input', new ZodValidationPipe(createContactMessageSchema))
    input: CreateContactMessageInput,
  ): Promise<ContactMessageResponse> {
    try {
      const message = await this.contactService.createMessage({
        name: input.name,
        email: input.email,
        message: input.message,
      });

      this.emailService
        .sendContactNotification({
          name: message.name,
          email: message.email,
          message: message.message,
          messageId: message.id,
          submittedAt: message.createdAt,
          ipAddress: message.ipAddress || undefined,
        })
        .catch((error) => {
          console.error('Failed to send email notification:', error);
        });

      return {
        success: true,
        message: 'Your message has been sent successfully!',
        data: message,
      };
    } catch {
      return {
        success: false,
        message: 'Failed to send message. Please try again later.',
      };
    }
  }

  /**
   * Admin query: Get all messages (requires auth)
   */
  @Query(() => ContactMessageList)
  @UseGuards(JwtAuthGuard)
  async contactMessages(
    @Args('filter', { nullable: true }) filter?: ContactMessagesFilterInput,
  ): Promise<ContactMessageList> {
    return this.contactService.getMessages(filter);
  }

  /**
   * Admin query: Get single message (requires auth)
   */
  @Query(() => ContactMessage, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async contactMessage(@Args('id') id: string): Promise<ContactMessage | null> {
    return this.contactService.getMessage(id);
  }

  /**
   * Admin query: Get message statistics (requires auth)
   */
  @Query(() => ContactMessageStatistics)
  @UseGuards(JwtAuthGuard)
  async contactMessageStatistics(): Promise<ContactMessageStatistics> {
    return this.contactService.getStatistics();
  }

  /**
   * Admin mutation: Update message status (requires auth)
   */
  @Mutation(() => ContactMessage)
  @UseGuards(JwtAuthGuard)
  async updateContactMessageStatus(
    @Args('input', new ZodValidationPipe(updateContactMessageStatusSchema))
    input: UpdateContactMessageStatusInput,
  ): Promise<ContactMessage> {
    return this.contactService.updateMessageStatus(
      input.id,
      input.status,
      input.adminNotes,
    );
  }

  /**
   * Admin mutation: Mark message as read (requires auth)
   */
  @Mutation(() => ContactMessage, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async markContactMessageAsRead(
    @Args('id') id: string,
  ): Promise<ContactMessage | null> {
    return this.contactService.markAsRead(id);
  }

  /**
   * Admin mutation: Delete message (requires auth)
   */
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteContactMessage(@Args('id') id: string): Promise<boolean> {
    await this.contactService.deleteMessage(id);
    return true;
  }
}
