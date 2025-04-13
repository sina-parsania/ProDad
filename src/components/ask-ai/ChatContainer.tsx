'use client';

import { useRef, useState, useEffect } from 'react';
import { ChatBubble } from '@/components/ask-ai/ChatBubble';
import { ChatInput } from '@/components/ask-ai/ChatInput';
import { Button } from '@/components/ui/button';
import { FiDelete } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Response data - in a real app this would come from an API
const AI_RESPONSES = {
  greeting: "Hello! I'm ProDad AI. How can I help you today?",
  unknown: "I'm not sure about that. Can you ask something else?",
  faq: {
    'how to add reminder':
      "To add a reminder, go to the Reminders section on the dashboard and click the 'Add Reminder' button. Fill in the details and save it.",
    'add document':
      "You can add documents by going to the Documents section and clicking 'Upload'. Select a file from your device and it will be added to your library.",
    'sync data':
      "Your data is currently stored locally. We're working on cloud sync features for a future update.",
    'change theme':
      "You can change the theme by clicking on your profile picture in the top-right corner and selecting 'Settings'. From there, choose your preferred theme under 'Appearance'.",
  },
};

// Define message type
export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  userReaction?: 'like' | 'dislike' | null;
}

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: AI_RESPONSES.greeting,
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock AI response function - in a real app this would be an API call
  const getAIResponse = (message: string): string => {
    const lowercaseMessage = message.toLowerCase();

    // Check if message matches any FAQ keywords
    for (const [keyword, response] of Object.entries(AI_RESPONSES.faq)) {
      if (lowercaseMessage.includes(keyword)) {
        return response;
      }
    }

    // Default response if no matches
    return AI_RESPONSES.unknown;
  };

  const handleSendMessage = (message: string) => {
    if (message.trim() === '') return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(message),
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const handleReaction = (messageId: string, reaction: 'like' | 'dislike') => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === messageId
          ? {
              ...message,
              userReaction: message.userReaction === reaction ? null : reaction,
            }
          : message,
      ),
    );
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        content: AI_RESPONSES.greeting,
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-background rounded-lg border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">ProDad AI Assistant</h2>
        <Button variant="ghost" size="icon" onClick={handleClearChat} title="Clear chat">
          <FiDelete className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            id={message.id}
            content={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
            reactions={{
              liked:
                message.userReaction === 'like'
                  ? true
                  : message.userReaction === 'dislike'
                    ? false
                    : null,
            }}
            onReaction={handleReaction}
          />
        ))}

        {isLoading && (
          <motion.div
            className="flex justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className={cn('flex items-center space-x-2 bg-muted p-4 rounded-lg')}>
              <div className="flex space-x-1">
                <div
                  className="h-2 w-2 rounded-full bg-current animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <div
                  className="h-2 w-2 rounded-full bg-current animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className="h-2 w-2 rounded-full bg-current animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
