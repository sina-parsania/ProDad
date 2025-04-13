import {
  ChatMessage,
  getAllChatMessages,
  addChatMessage,
  updateChatReaction,
  clearChatMessages,
} from '@/lib/db/db';

// Export the ChatMessage type for external use
export type { ChatMessage };

// Get all messages using Dexie
export const getStoredMessages = async (): Promise<ChatMessage[]> => {
  if (typeof window === 'undefined') return [];

  try {
    return await getAllChatMessages();
  } catch (error) {
    console.error('Error in getStoredMessages', error);

    // Fallback to localStorage if Dexie fails
    try {
      const storedMessages = localStorage.getItem('prodad-chat-messages');
      return storedMessages ? JSON.parse(storedMessages) : [];
    } catch (fallbackError) {
      console.error('Fallback to localStorage failed', fallbackError);
      return [];
    }
  }
};

// Store messages using Dexie
export const storeMessages = async (messages: ChatMessage[]): Promise<void> => {
  if (typeof window === 'undefined') return;

  try {
    // Clear existing messages
    await clearChatMessages();

    // Add all messages
    for (const message of messages) {
      await addChatMessage(message);
    }
  } catch (error) {
    console.error('Error in storeMessages', error);

    // Fallback to localStorage
    try {
      localStorage.setItem('prodad-chat-messages', JSON.stringify(messages));
    } catch (fallbackError) {
      console.error('Fallback to localStorage failed', fallbackError);
    }
  }
};

export const addReaction = async (
  messageId: string,
  reaction: 'like' | 'dislike',
): Promise<ChatMessage[]> => {
  try {
    const messages = await getAllChatMessages();
    const updatedMessages = messages.map((message) => {
      if (message.id === messageId) {
        const reactions = message.reactions || [];
        const hasReaction = reactions.includes(reaction);

        // Create a new array of reactions
        const newReactions = hasReaction
          ? reactions.filter((r) => r !== reaction) // Remove if already there
          : [...reactions, reaction]; // Add if not there

        // Update the reaction in the database
        updateChatReaction(messageId, newReactions).catch(console.error);

        // Return the updated message
        return {
          ...message,
          reactions: newReactions,
        };
      }
      return message;
    });

    return updatedMessages;
  } catch (error) {
    console.error('Error in addReaction', error);
    return await getAllChatMessages();
  }
};

// Helper function to clear all chat messages
export const clearChatHistory = async (): Promise<void> => {
  if (typeof window === 'undefined') return;

  try {
    await clearChatMessages();
  } catch (error) {
    console.error('Error clearing chat history', error);

    // Fallback to localStorage
    try {
      localStorage.removeItem('prodad-chat-messages');
    } catch (fallbackError) {
      console.error('Fallback to localStorage failed', fallbackError);
    }
  }
};
