import { ChatArchiveForm } from "@/components/ChatArchiveForm";
import { ArchivesTable } from "@/components/ArchivesTable";
import { UserProfile } from "@/components/UserProfile";

const Index = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-roboto">Менеджер архива чатов</h1>
        <UserProfile />
      </div>
      <ChatArchiveForm />
      <ArchivesTable />
    </div>
  );
};

export default Index;