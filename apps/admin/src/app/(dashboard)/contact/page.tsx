import { ContactPageHeader } from "./components/ContactPageHeader";
import { ContactMessageTable } from "./components/ContactMessageTable";
import {
  getContactMessages,
  getContactMessageStatistics,
} from "./contact-actions";

export default async function ContactPage() {
  // Fetch statistics and messages server-side for ISR
  const [stats, messages] = await Promise.all([
    getContactMessageStatistics(),
    getContactMessages(),
  ]);

  return (
    <div className="space-y-8">
      <ContactPageHeader statistics={stats} />
      <ContactMessageTable messages={messages.messages} />
    </div>
  );
}
