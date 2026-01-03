import { observable } from '@legendapp/state';
import { syncObservable } from '@legendapp/state/sync';

import { persistOptions } from '../lib/legend-config';

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

export const chat$ = observable<ChatStore>({
  messages: [],
  images: [],

  addMessage: (message: Omit<ChatMessage, 'id'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
    };
    const currentMessages = chat$.messages.peek();
    chat$.messages.set([...currentMessages, newMessage]);
  },

  addImage: (uri: string, base64?: string): ChatImage => {
    const image: ChatImage = {
      id: Date.now().toString(),
      uri,
      base64,
      timestamp: new Date(),
    };
    const currentImages = chat$.images.peek();
    chat$.images.set([...currentImages, image]);
    return image;
  },

  getImageById: (id: string): ChatImage | undefined => {
    const images = chat$.images.peek();
    return images.find((img: ChatImage) => img.id === id);
  },

  clearChat: () => {
    chat$.messages.set([]);
    chat$.images.set([]);
  },
});

// Set up persistence with AsyncStorage
syncObservable(chat$, persistOptions({
  persist: {
    name: 'chef-chat-storage',
  },
}));
