"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ChatContextValue {
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const ChatContext = createContext<ChatContextValue>({
  selectedConversationId: null,
  setSelectedConversationId: () => {},
  refreshTrigger: 0,
  triggerRefresh: () => {},
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((n) => n + 1);
  }, []);

  return (
    <ChatContext.Provider
      value={{ selectedConversationId, setSelectedConversationId, refreshTrigger, triggerRefresh }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  return useContext(ChatContext);
}
