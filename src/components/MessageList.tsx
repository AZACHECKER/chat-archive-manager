import { MessageArchive } from "@/types/database";
import { Loader2 } from "lucide-react";

interface MessageListProps {
  messages: MessageArchive[] | null;
  isLoading: boolean;
}

export const MessageList = ({ messages, isLoading }: MessageListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!messages?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        Сообщений пока нет
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div key={message.id} className="p-4 rounded-lg bg-gray-50">
          <div className="font-semibold text-sm text-gray-500">
            ID сообщения: {message.message_id}
          </div>
          <div className="mt-2 whitespace-pre-wrap">{message.message_content}</div>
        </div>
      ))}
    </div>
  );
};