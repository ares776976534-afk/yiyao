import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'ice';
import queryChatCache from '@/services/studio/queryChatCache';
import createChatCache from '@/services/studio/createChatCache';
import { useNavigateWithScroll } from '@/hooks/useNavigateWithScroll';

export default () => {
  const [chatInput, setChatInput] = useState<any>(null);
  const [isMakeSimilar, setIsMakeSimilar] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigateWithScroll();
  const chatInputIdRef = useRef<string>('');

  const navigateByCache = async ({ chatInput, url, isMakeSimilar = false, target = 'self' }: { chatInput: any, url: any, isMakeSimilar?: boolean, target?: 'self' | 'blank' }) => {
    try {
      setIsMakeSimilar(isMakeSimilar);
      const cacheId = await createChatCache(chatInput);
      if (cacheId) {
        navigate(url, { params: { __chat_input_cache_id__: cacheId, __is_make_similar__: isMakeSimilar, __auto_submit__: true }, target });
      }
    } catch (error) {
      navigate(url, { params: { __chat_input__: JSON.stringify(chatInput), __is_make_similar__: isMakeSimilar, __auto_submit__: true }, target });
    }
  }

  useEffect(() => {
    const chatInputId = searchParams.get('__chat_input_cache_id__') || searchParams.get('__chat_input__');
    const _isMakeSimilar = searchParams.get('__is_make_similar__') === 'true';
    setIsMakeSimilar(_isMakeSimilar);

    if (chatInputIdRef.current === chatInputId && chatInputIdRef.current && chatInputId) {
      return;
    }

    if (chatInputId) {
      queryChatCache(chatInputId).then(res => {
        setChatInput(res || null);
      });
    } else {
      const chatInput = searchParams.get('__chat_input__');
      if (chatInput) {
        setChatInput(JSON.parse(chatInput) || null);
      } else {
        setChatInput(null);
      }
    }

    chatInputIdRef.current = chatInputId || '';
  }, [window.location.search]);

  return {
    chatInput,
    navigateByCache,
    isMakeSimilar,
  };
};