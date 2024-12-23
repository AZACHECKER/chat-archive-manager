export interface ChatArchive {
  id: string;
  user_id: string;
  chat_id: string;
  api_key: string;
  messages_checked: number | null;
  last_message_id: number | null;
  current_message_id: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface MessageArchive {
  id: string;
  chat_archive_id: string | null;
  message_id: number;
  message_content: string;
  created_at: string | null;
}