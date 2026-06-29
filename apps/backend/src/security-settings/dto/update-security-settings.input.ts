import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateSecuritySettingsInput {
  @Field(() => String, { nullable: true })
  telegramBotToken?: string | null;

  @Field(() => String, { nullable: true })
  telegramChatId?: string | null;
}
