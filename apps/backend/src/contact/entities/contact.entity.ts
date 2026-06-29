import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { ContactMessageStatus } from '@prisma/client';

// Register enum for GraphQL
registerEnumType(ContactMessageStatus, {
  name: 'ContactMessageStatus',
  description: 'Status of contact message',
});

@ObjectType()
export class ContactMessage {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  message: string;

  @Field(() => ContactMessageStatus)
  status: ContactMessageStatus;

  @Field(() => String, { nullable: true })
  adminNotes?: string | null;

  @Field(() => String, { nullable: true })
  ipAddress?: string | null;

  @Field(() => String, { nullable: true })
  userAgent?: string | null;

  @Field(() => Date, { nullable: true })
  repliedAt?: Date | null;

  @Field(() => String, { nullable: true })
  repliedBy?: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class ContactMessageList {
  @Field(() => [ContactMessage])
  messages: ContactMessage[];

  @Field()
  total: number;
}

@ObjectType()
export class ContactMessageStatistics {
  @Field()
  total: number;

  @Field()
  new: number;

  @Field()
  read: number;

  @Field()
  replied: number;
}

@ObjectType()
export class ContactMessageResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => ContactMessage, { nullable: true })
  data?: ContactMessage | null;
}
