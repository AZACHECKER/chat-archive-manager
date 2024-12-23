import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, MessageSquare, Key, Trash2, ArrowRight } from "lucide-react";
import { ChatArchive, MessageArchive } from "@/types/database";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MessageList } from "./MessageList";
import { useToast } from "@/hooks/use-toast";

export const ArchivesTable = () => {
  const [selectedArchive, setSelectedArchive] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: chatArchives, isLoading: isLoadingArchives } = useQuery({
    queryKey: ["chatArchives"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_archives")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ChatArchive[];
    },
  });

  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["messages", selectedArchive],
    queryFn: async () => {
      if (!selectedArchive) return null;
      const { data, error } = await supabase
        .from("message_archives")
        .select("*")
        .eq("chat_archive_id", selectedArchive)
        .order("message_id", { ascending: true });

      if (error) throw error;
      return data as MessageArchive[];
    },
    enabled: !!selectedArchive,
  });

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_archives'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["chatArchives"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("chat_archives")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Успех",
        description: "Архив успешно удален",
      });
    } catch (error) {
      console.error("Ошибка удаления архива:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить архив",
        variant: "destructive",
      });
    }
  };

  const handleForwardMessage = async (archive: ChatArchive, messageId: number) => {
    try {
      const userChatId = localStorage.getItem("userChatId");
      if (!userChatId) {
        toast({
          title: "Ошибка",
          description: "Установите ID вашего чата в профиле",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(
        `https://api.telegram.org/bot${archive.api_key}/forwardMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: userChatId,
            from_chat_id: archive.sender_chat_id,
            message_id: messageId,
          }),
        }
      );

      const data = await response.json();
      if (data.ok) {
        toast({
          title: "Успех",
          description: "Сообщение переслано",
        });
      } else {
        throw new Error(data.description);
      }
    } catch (error) {
      console.error("Ошибка пересылки сообщения:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось переслать сообщение",
        variant: "destructive",
      });
    }
  };

  if (isLoadingArchives) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4 font-roboto">Архивы</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Имя бота</TableHead>
            <TableHead>API ключ</TableHead>
            <TableHead>Отправитель</TableHead>
            <TableHead>Получатель</TableHead>
            <TableHead>Сообщений</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chatArchives?.map((archive) => (
            <TableRow key={archive.id}>
              <TableCell>{archive.bot_name || "—"}</TableCell>
              <TableCell>
                <span className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  ••••••••
                </span>
              </TableCell>
              <TableCell>{archive.sender_chat_id || "—"}</TableCell>
              <TableCell>{archive.receiver_chat_id || "—"}</TableCell>
              <TableCell>{archive.messages_checked || 0}</TableCell>
              <TableCell className="space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedArchive(archive.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Сообщения
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Архив сообщений - {archive.bot_name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <MessageList 
                        messages={messages} 
                        isLoading={isLoadingMessages}
                        onForward={(messageId) => handleForwardMessage(archive, messageId)}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(archive.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};