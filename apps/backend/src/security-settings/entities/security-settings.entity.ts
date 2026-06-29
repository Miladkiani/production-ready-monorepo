import { ObjectType, Field, ID } from '@nestjs/graphql';

/**
 * Security Settings Entity
 * Represents security configuration for admin panel
 * Single record model (id: 'security-settings')
 */
@ObjectType()
export class SecuritySettingsEntity {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  telegramBotToken?: string | null;

  @Field(() => String, { nullable: true })
  telegramChatId?: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
