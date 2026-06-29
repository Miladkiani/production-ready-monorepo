import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
};

export type ContactMessage = {
  __typename?: 'ContactMessage';
  adminNotes?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  ipAddress?: Maybe<Scalars['String']['output']>;
  message: Scalars['String']['output'];
  name: Scalars['String']['output'];
  repliedAt?: Maybe<Scalars['DateTime']['output']>;
  repliedBy?: Maybe<Scalars['String']['output']>;
  status: ContactMessageStatus;
  updatedAt: Scalars['DateTime']['output'];
  userAgent?: Maybe<Scalars['String']['output']>;
};

export type ContactMessageList = {
  __typename?: 'ContactMessageList';
  messages: Array<ContactMessage>;
  total: Scalars['Float']['output'];
};

export type ContactMessageResponse = {
  __typename?: 'ContactMessageResponse';
  data?: Maybe<ContactMessage>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type ContactMessageStatistics = {
  __typename?: 'ContactMessageStatistics';
  new: Scalars['Float']['output'];
  read: Scalars['Float']['output'];
  replied: Scalars['Float']['output'];
  total: Scalars['Float']['output'];
};

/** Status of contact message */
export enum ContactMessageStatus {
  Archived = 'ARCHIVED',
  New = 'NEW',
  Read = 'READ',
  Replied = 'REPLIED',
  Spam = 'SPAM'
}

export type ContactMessagesFilterInput = {
  skip?: InputMaybe<Scalars['Float']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  take?: InputMaybe<Scalars['Float']['input']>;
};

export type CreateContactMessageInput = {
  email: Scalars['String']['input'];
  message: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type LoginInput = {
  captchaToken?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type LoginResponse = {
  __typename?: 'LoginResponse';
  accessToken: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  deleteContactMessage: Scalars['Boolean']['output'];
  login: LoginResponse;
  logout: Scalars['Boolean']['output'];
  markContactMessageAsRead?: Maybe<ContactMessage>;
  refresh: LoginResponse;
  submitContactForm: ContactMessageResponse;
  updateContactMessageStatus: ContactMessage;
  updateSecuritySettings: SecuritySettingsEntity;
};


export type MutationDeleteContactMessageArgs = {
  id: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationMarkContactMessageAsReadArgs = {
  id: Scalars['String']['input'];
};


export type MutationSubmitContactFormArgs = {
  input: CreateContactMessageInput;
};


export type MutationUpdateContactMessageStatusArgs = {
  input: UpdateContactMessageStatusInput;
};


export type MutationUpdateSecuritySettingsArgs = {
  input: UpdateSecuritySettingsInput;
};

export type Query = {
  __typename?: 'Query';
  contactMessage?: Maybe<ContactMessage>;
  contactMessageStatistics: ContactMessageStatistics;
  contactMessages: ContactMessageList;
  securitySettings?: Maybe<SecuritySettingsEntity>;
};


export type QueryContactMessageArgs = {
  id: Scalars['String']['input'];
};


export type QueryContactMessagesArgs = {
  filter?: InputMaybe<ContactMessagesFilterInput>;
};

export type SecuritySettingsEntity = {
  __typename?: 'SecuritySettingsEntity';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  telegramBotToken?: Maybe<Scalars['String']['output']>;
  telegramChatId?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type UpdateContactMessageStatusInput = {
  adminNotes?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  status: Scalars['String']['input'];
};

export type UpdateSecuritySettingsInput = {
  telegramBotToken?: InputMaybe<Scalars['String']['input']>;
  telegramChatId?: InputMaybe<Scalars['String']['input']>;
};

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'LoginResponse', accessToken: string } };

export type RefreshTokenMutationVariables = Exact<{ [key: string]: never; }>;


export type RefreshTokenMutation = { __typename?: 'Mutation', refresh: { __typename?: 'LoginResponse', accessToken: string } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type SubmitContactFormMutationVariables = Exact<{
  input: CreateContactMessageInput;
}>;


export type SubmitContactFormMutation = { __typename?: 'Mutation', submitContactForm: { __typename?: 'ContactMessageResponse', success: boolean, message: string, data?: { __typename?: 'ContactMessage', id: string, name: string, email: string, status: ContactMessageStatus, createdAt: any } | null } };

export type ContactMessagesQueryVariables = Exact<{
  filter?: InputMaybe<ContactMessagesFilterInput>;
}>;


export type ContactMessagesQuery = { __typename?: 'Query', contactMessages: { __typename?: 'ContactMessageList', total: number, messages: Array<{ __typename?: 'ContactMessage', id: string, name: string, email: string, message: string, status: ContactMessageStatus, createdAt: any, repliedAt?: any | null, repliedBy?: string | null, ipAddress?: string | null, userAgent?: string | null }> } };

export type ContactMessageStatisticsQueryVariables = Exact<{ [key: string]: never; }>;


export type ContactMessageStatisticsQuery = { __typename?: 'Query', contactMessageStatistics: { __typename?: 'ContactMessageStatistics', total: number, new: number, read: number, replied: number } };

export type ContactMessageQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type ContactMessageQuery = { __typename?: 'Query', contactMessage?: { __typename?: 'ContactMessage', id: string, name: string, email: string, message: string, status: ContactMessageStatus, createdAt: any, repliedAt?: any | null, repliedBy?: string | null, adminNotes?: string | null, ipAddress?: string | null, userAgent?: string | null } | null };

export type UpdateContactMessageStatusMutationVariables = Exact<{
  input: UpdateContactMessageStatusInput;
}>;


export type UpdateContactMessageStatusMutation = { __typename?: 'Mutation', updateContactMessageStatus: { __typename?: 'ContactMessage', id: string, status: ContactMessageStatus } };

export type MarkContactMessageAsReadMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type MarkContactMessageAsReadMutation = { __typename?: 'Mutation', markContactMessageAsRead?: { __typename?: 'ContactMessage', id: string, status: ContactMessageStatus } | null };

export type DeleteContactMessageMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DeleteContactMessageMutation = { __typename?: 'Mutation', deleteContactMessage: boolean };

export type SecuritySettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type SecuritySettingsQuery = { __typename?: 'Query', securitySettings?: { __typename?: 'SecuritySettingsEntity', id: string, telegramBotToken?: string | null, telegramChatId?: string | null, createdAt: any, updatedAt: any } | null };

export type UpdateSecuritySettingsMutationVariables = Exact<{
  input: UpdateSecuritySettingsInput;
}>;


export type UpdateSecuritySettingsMutation = { __typename?: 'Mutation', updateSecuritySettings: { __typename?: 'SecuritySettingsEntity', id: string, telegramBotToken?: string | null, telegramChatId?: string | null, createdAt: any, updatedAt: any } };


export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const RefreshTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refresh"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}}]}}]}}]} as unknown as DocumentNode<RefreshTokenMutation, RefreshTokenMutationVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"}}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const SubmitContactFormDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitContactForm"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateContactMessageInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitContactForm"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<SubmitContactFormMutation, SubmitContactFormMutationVariables>;
export const ContactMessagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ContactMessages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ContactMessagesFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contactMessages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"repliedAt"}},{"kind":"Field","name":{"kind":"Name","value":"repliedBy"}},{"kind":"Field","name":{"kind":"Name","value":"ipAddress"}},{"kind":"Field","name":{"kind":"Name","value":"userAgent"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]} as unknown as DocumentNode<ContactMessagesQuery, ContactMessagesQueryVariables>;
export const ContactMessageStatisticsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ContactMessageStatistics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contactMessageStatistics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"new"}},{"kind":"Field","name":{"kind":"Name","value":"read"}},{"kind":"Field","name":{"kind":"Name","value":"replied"}}]}}]}}]} as unknown as DocumentNode<ContactMessageStatisticsQuery, ContactMessageStatisticsQueryVariables>;
export const ContactMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ContactMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contactMessage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"repliedAt"}},{"kind":"Field","name":{"kind":"Name","value":"repliedBy"}},{"kind":"Field","name":{"kind":"Name","value":"adminNotes"}},{"kind":"Field","name":{"kind":"Name","value":"ipAddress"}},{"kind":"Field","name":{"kind":"Name","value":"userAgent"}}]}}]}}]} as unknown as DocumentNode<ContactMessageQuery, ContactMessageQueryVariables>;
export const UpdateContactMessageStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateContactMessageStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateContactMessageStatusInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateContactMessageStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<UpdateContactMessageStatusMutation, UpdateContactMessageStatusMutationVariables>;
export const MarkContactMessageAsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkContactMessageAsRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markContactMessageAsRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<MarkContactMessageAsReadMutation, MarkContactMessageAsReadMutationVariables>;
export const DeleteContactMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteContactMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteContactMessage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteContactMessageMutation, DeleteContactMessageMutationVariables>;
export const SecuritySettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SecuritySettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"securitySettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"telegramBotToken"}},{"kind":"Field","name":{"kind":"Name","value":"telegramChatId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<SecuritySettingsQuery, SecuritySettingsQueryVariables>;
export const UpdateSecuritySettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSecuritySettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateSecuritySettingsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSecuritySettings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"telegramBotToken"}},{"kind":"Field","name":{"kind":"Name","value":"telegramChatId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateSecuritySettingsMutation, UpdateSecuritySettingsMutationVariables>;