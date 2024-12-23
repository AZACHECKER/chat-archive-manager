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
import { User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const UserProfile = () => {
  const [userChatId, setUserChatId] = useState(localStorage.getItem("userChatId") || "");
  const { toast } = useToast();

  const handleSaveProfile = () => {
    if (!userChatId) {
      toast({
        title: "Ошибка",
        description: "Введите ID чата",
        variant: "destructive",
      });
      return;
    }
    localStorage.setItem("userChatId", userChatId);
    toast({
      title: "Успех",
      description: "Профиль сохранен",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <User className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Профиль пользователя</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">ID вашего чата</label>
            <Input
              placeholder="Введите ID чата"
              value={userChatId}
              onChange={(e) => setUserChatId(e.target.value)}
            />
          </div>
          <Button onClick={handleSaveProfile} className="w-full">
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};