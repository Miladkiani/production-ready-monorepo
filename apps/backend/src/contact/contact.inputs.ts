import { InputType, Field } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ContactMessageStatus } from '@prisma/client';

@InputType()
export class CreateContactMessageInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name must be less than 100 characters' })
  name: string;

  @Field()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Message must be at least 10 characters' })
  @MaxLength(2000, { message: 'Message must be less than 2000 characters' })
  message: string;
}

@InputType()
export class UpdateContactMessageStatusInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string;

  @Field(() => String)
  @IsEnum(ContactMessageStatus)
  status: ContactMessageStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNotes?: string;
}

@InputType()
export class ContactMessagesFilterInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(ContactMessageStatus)
  status?: ContactMessageStatus;

  @Field({ nullable: true })
  @IsOptional()
  skip?: number;

  @Field({ nullable: true })
  @IsOptional()
  take?: number;
}
