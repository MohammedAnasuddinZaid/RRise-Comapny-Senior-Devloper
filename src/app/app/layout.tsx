import { AppLayout } from "../../components/layout/AppLayout";
import { ChatProvider } from "../../contexts/ChatContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <AppLayout>{children}</AppLayout>
    </ChatProvider>
  );
}
