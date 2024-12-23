import { useState } from "react";
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
import { Loader2, MessageSquare, Key } from "lucide-react";
import { ChatArchive, MessageArchive } from "@/types/database";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MessageList } from "./MessageList";

export const ArchivesTable = () => {
  const [selectedArchive, setSelectedArchive] = useState<string | null>(null);

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

  if (isLoadingArchives) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Archives</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Chat ID</TableHead>
            <TableHead>API Key</TableHead>
            <TableHead>Messages Checked</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chatArchives?.map((archive) => (
            <TableRow key={archive.id}>
              <TableCell>{archive.chat_id}</TableCell>
              <TableCell>
                <span className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  ••••••••
                </span>
              </TableCell>
              <TableCell>{archive.messages_checked}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedArchive(archive.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Messages
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Message Archive - {archive.chat_id}</DialogTitle>
                    </DialogHeader>
                    <MessageList messages={messages} isLoading={isLoadingMessages} />
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};