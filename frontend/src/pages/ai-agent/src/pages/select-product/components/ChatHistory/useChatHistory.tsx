import { useEffect, useState } from 'react';
import { useSearchParams } from 'ice';
import { useNavigateWithScroll } from '@/hooks/useNavigateWithScroll';

export const useChatHistory = () => {
  const [searchParams] = useSearchParams();
  const [chatHistorySessionId, setChatHistorySessionId] = useState<string>(searchParams.get('__chat_history_session__') || '');
  const [shareCode, setShareCode] = useState<string>(searchParams.get('__share_code__') || '');

  const navigate = useNavigateWithScroll();

  const navigateToChatHistory = (url: string, sessionId: string) => {
    navigate(url, { params: { __chat_history_session__: sessionId }, replace: true });
  };

  const handleHistoryChange = () => {
    const chatHistory = searchParams.get('__chat_history_session__');
    setChatHistorySessionId(chatHistory || '');
    const shareCode = searchParams.get('__share_code__');
    setShareCode(shareCode || '');
  };

  useEffect(() => {
    handleHistoryChange();
  }, [location.search]);

  useEffect(() => {
    handleHistoryChange();
  }, []);

  return {
    chatHistorySessionId,
    shareCode,
    navigateToChatHistory,
  };
};