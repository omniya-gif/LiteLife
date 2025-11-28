import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ChatImage {
  id: string;
  uri: string;
  base64?: string;
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'chef';
  timestamp: Date;
  image?: ChatImage;
  type?: 'analysis' | 'suggestion' | 'recipe' | 'conversation' | 'calories' | 'health';
  metadata?: {
    calories?: number;
    healthScore?: number;
    recipes?: {
      title: string;
      image: string;
      link: string;
    }[];
    nutritionalInfo?: {
      protein: string;
      carbs: string;
      fats: string;
      glucoseImpact: 'low' | 'medium' | 'high';
    };
    hasMore?: boolean;
  };
  onSuggestionSelect?: (type: 'calories' | 'health' | 'recipes') => void;
}

interface ChatStore {
  messages: ChatMessage[];
  images: ChatImage[];
  addMessage: (message: Omit<ChatMessage, 'id'>) => void;
  addImage: (uri: string, base64?: string) => ChatImage;
  getImageById: (id: string) => ChatImage | undefined;
  clearChat: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      messages: [],
      images: [],
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, { ...message, id: Date.now().toString() }],
        })),
      addImage: (uri, base64) => {
        const image = {
          id: Date.now().toString(),
          uri,
          base64,
          timestamp: new Date(),
        };
        set((state) => ({
          images: [...state.images, image],
        }));
        return image;
      },
      getImageById: (id) => get().images.find((img) => img.id === id),
      clearChat: () => set({ messages: [], images: [] }),
    }),
    {
      name: 'chef-chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);