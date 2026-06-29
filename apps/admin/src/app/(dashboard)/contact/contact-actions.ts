"use server";

import {
  ContactMessagesDocument,
  ContactMessageStatisticsDocument,
  UpdateContactMessageStatusDocument,
  MarkContactMessageAsReadDocument,
  DeleteContactMessageDocument,
} from "@repo/graphql";
import { executeServerGraphQL } from "@admin/lib/clients/graphql-server";
import { revalidatePath } from "next/cache";

export async function getContactMessages() {
  const data = await executeServerGraphQL(
    {
      query: ContactMessagesDocument,
      variables: {},
    },
    { cache: "no-store" },
  );
  return data.contactMessages;
}

export async function getContactMessageStatistics() {
  const data = await executeServerGraphQL(
    {
      query: ContactMessageStatisticsDocument,
      variables: {},
    },
    { cache: "no-store" },
  );
  return data.contactMessageStatistics;
}

export async function updateMessageStatus(id: string, status: string) {
  const data = await executeServerGraphQL({
    query: UpdateContactMessageStatusDocument,
    variables: { input: { id, status } },
  });
  revalidatePath("/contact");
  return data.updateContactMessageStatus;
}

export async function markAsReadAction(id: string) {
  const data = await executeServerGraphQL({
    query: MarkContactMessageAsReadDocument,
    variables: { id },
  });
  revalidatePath("/contact");
  return data.markContactMessageAsRead;
}

export async function deleteContactMessageAction(id: string) {
  const data = await executeServerGraphQL({
    query: DeleteContactMessageDocument,
    variables: { id },
  });
  revalidatePath("/contact");
  return data.deleteContactMessage;
}
