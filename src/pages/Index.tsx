import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MessageSquare, Key } from "lucide-react";

interface ChatArchive {
  id: string;
  chat_id: string;
  api_key: string;
  messages_checked: number;
  last_message_id: number;
  current_message_id: number;
}

interface MessageArchive {
  id: string;
  message_id: number;
  message_content: string;
  created_at: string;
}

const Index = () => {
  const [chatId, setChatId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [selectedArchive, setSelectedArchive] = useState<string | null>(null);
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

  const handleSubmit = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        toast({
          title: "Error",
          description: "Please sign in to continue",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("chat_archives").insert({
        user_id: session.session.user.id,
        chat_id: chatId,
        api_key: apiKey,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Chat archive created successfully",
      });

      setChatId("");
      setApiKey("");
    } catch (error) {
      console.error("Error creating chat archive:", error);
      toast({
        title: "Error",
        description: "Failed to create chat archive",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <h2 className="text-2xl font-bold">Chat Archive Manager</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Enter Chat ID"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
          />
          <Input
            placeholder="Enter API Key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
        
        <Button onClick={handleSubmit} className="w-full">
          Add New Archive
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Archives</h3>
        
        {isLoadingArchives ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
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
                        {isLoadingMessages ? (
                          <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {messages?.map((message) => (
                              <div
                                key={message.id}
                                className="p-4 rounded-lg bg-gray-50"
                              >
                                <div className="font-semibold text-sm text-gray-500">
                                  Message ID: {message.message_id}
                                </div>
                                <div className="mt-2">{message.message_content}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default Index;