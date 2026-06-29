// apps/backend/src/auth/dto/auth.dto.ts
import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field(() => String, { nullable: true })
  captchaToken?: string;
}

@ObjectType()
export class LoginResponse {
  @Field()
  accessToken: string;
}
