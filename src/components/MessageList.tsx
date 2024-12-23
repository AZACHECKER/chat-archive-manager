import { MessageArchive } from "@/types/database";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

interface MessageListProps {
  messages: MessageArchive[] | null;
  isLoading: boolean;
  onForward: (messageId: number) => void;
}

export const MessageList = ({ messages, isLoading, onForward }: MessageListProps) => {
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
        <div key={message.id} className="p-4 rounded-lg bg-gray-50 flex justify-between items-start">
          <div className="flex-1">
            <div className="font-semibold text-sm text-gray-500">
              ID сообщения: {message.message_id}
            </div>
            <div className="mt-2 whitespace-pre-wrap">{message.message_content}</div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onForward(message.message_id)}
            className="ml-4"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};