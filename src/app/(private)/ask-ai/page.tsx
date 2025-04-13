'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import { FiLoader } from 'react-icons/fi';
import { getAiResponse } from '@/lib/ai-responses';
import {
  getStoredMessages,
  storeMessages,
  addReaction,
  clearChatHistory,
  type ChatMessage as StorageChatMessage,
} from '@/lib/storage/chatStorage';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ChatBubble } from '@/components/ask-ai/ChatBubble';
import { ChatInput } from '@/components/ask-ai/ChatInput';

// Animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const childVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

// Interface for our local ChatMessage based on what the components expect
interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  reactions: {
    liked: boolean | null;
  };
}

// Convert from storage format to component format
const convertStorageToComponent = (message: StorageChatMessage): ChatMessage => {
  return {
    id: message.id,
    content: message.content,
    isUser: message.sender === 'user',
    timestamp: new Date(message.timestamp),
    reactions: {
      liked: message.reactions
        ? message.reactions.includes('like')
          ? true
          : message.reactions.includes('dislike')
            ? false
            : null
        : null,
    },
  };
};

// Convert from component format to storage format
const convertComponentToStorage = (message: ChatMessage): StorageChatMessage => {
  return {
    id: message.id,
    content: message.content,
    sender: message.isUser ? 'user' : 'ai',
    timestamp: message.timestamp.getTime(),
    reactions:
      message.reactions.liked !== null ? [message.reactions.liked ? 'like' : 'dislike'] : [],
  };
};

export default function AskAI() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      const storedMessages = await getStoredMessages();
      setMessages(storedMessages.map(convertStorageToComponent));
    };
    fetchMessages();
  }, []);

  const handleSendMessage = async (content: string) => {
    // Create user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      content,
      isUser: true,
      timestamp: new Date(),
      reactions: { liked: null },
    };

    // Add user message to state
    setMessages((prev) => [...prev, userMessage]);

    // Store messages
    const updatedMessages = [...messages, userMessage];
    await storeMessages(updatedMessages.map(convertComponentToStorage));

    // Generate AI response
    setIsGenerating(true);

    // Simulate AI response delay
    setTimeout(async () => {
      const responseContent = getAiResponse(content);

      // Create AI message
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        content: responseContent,
        isUser: false,
        timestamp: new Date(),
        reactions: { liked: null },
      };

      // Add AI message to state
      const newMessages = [...updatedMessages, aiMessage];
      setMessages(newMessages);

      // Store updated messages
      await storeMessages(newMessages.map(convertComponentToStorage));
      setIsGenerating(false);
    }, 1000);
  };

  const handleReaction = (messageId: string, reaction: 'like' | 'dislike') => {
    addReaction(messageId, reaction)
      .then(() => {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === messageId) {
              return {
                ...msg,
                reactions: {
                  liked: reaction === 'like' ? true : false,
                },
              };
            }
            return msg;
          }),
        );
      })
      .catch(console.error);
  };

  const handleClearChat = async () => {
    await clearChatHistory();
    setMessages([]);
    setIsAlertOpen(false);
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Ask AI</h1>
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">
              Clear Chat
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your chat history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearChat}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="space-y-6 pb-24">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChatBubble
                id={message.id}
                content={message.content}
                isUser={message.isUser}
                timestamp={message.timestamp}
                reactions={message.reactions || { liked: null }}
                onReaction={handleReaction}
              />
            </motion.div>
          ))}

          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-3xl rounded-bl-none max-w-[80%] flex items-center space-x-2">
                <FiLoader className="h-4 w-4 animate-spin" />
                <span>ProDad is thinking...</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <ChatInput onSendMessage={handleSendMessage} isLoading={isGenerating} />
    </div>
  );
}
