import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const ChatArchiveForm = () => {
  const [chatId, setChatId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();

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

      const { error } = await supabase
        .from("chat_archives")
        .insert({
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
  );
};