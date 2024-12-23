import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const ChatArchiveForm = () => {
  const [chatId, setChatId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [senderChatId, setSenderChatId] = useState("");
  const [receiverChatId, setReceiverChatId] = useState("");
  const [botName, setBotName] = useState("");
  const [isCheckingBot, setIsCheckingBot] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkBotInfo = async () => {
      if (!apiKey) {
        setBotName("");
        return;
      }

      setIsCheckingBot(true);
      try {
        const response = await fetch("https://api.telegram.org/bot" + apiKey + "/getMe");
        const data = await response.json();
        
        if (data.ok) {
          setBotName(data.result.username);
          toast({
            title: "Бот найден",
            description: `Подключен бот: @${data.result.username}`,
          });
        } else {
          setBotName("");
          toast({
            title: "Ошибка",
            description: "Неверный API ключ бота",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Ошибка проверки бота:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось проверить API ключ",
          variant: "destructive",
        });
      } finally {
        setIsCheckingBot(false);
      }
    };

    const debounceTimeout = setTimeout(checkBotInfo, 500);
    return () => clearTimeout(debounceTimeout);
  }, [apiKey, toast]);

  const handleSubmit = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        toast({
          title: "Ошибка",
          description: "Необходимо войти в систему",
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
          bot_name: botName,
          sender_chat_id: senderChatId,
          receiver_chat_id: receiverChatId,
        });

      if (error) throw error;

      toast({
        title: "Успех",
        description: "Архив чата успешно создан",
      });

      setChatId("");
      setApiKey("");
      setSenderChatId("");
      setReceiverChatId("");
    } catch (error) {
      console.error("Ошибка создания архива:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать архив чата",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h2 className="text-2xl font-bold font-roboto">Менеджер архива чатов</h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">API ключ бота</label>
          <div className="relative">
            <Input
              placeholder="Введите API ключ бота"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            {isCheckingBot && (
              <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
            )}
          </div>
          {botName && (
            <p className="text-sm text-green-600">Подключен бот: @{botName}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">ID чата</label>
          <Input
            placeholder="Введите ID чата"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">ID чата отправителя</label>
          <Input
            placeholder="Введите ID чата отправителя"
            value={senderChatId}
            onChange={(e) => setSenderChatId(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">ID чата получателя</label>
          <Input
            placeholder="Введите ID чата получателя"
            value={receiverChatId}
            onChange={(e) => setReceiverChatId(e.target.value)}
          />
        </div>
      </div>
      <Button onClick={handleSubmit} className="w-full">
        Добавить новый архив
      </Button>
    </div>
  );
};