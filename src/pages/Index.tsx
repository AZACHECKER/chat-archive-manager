import { ChatArchiveForm } from "@/components/ChatArchiveForm";
import { ArchivesTable } from "@/components/ArchivesTable";

const Index = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <ChatArchiveForm />
      <ArchivesTable />
    </div>
  );
};

export default Index;