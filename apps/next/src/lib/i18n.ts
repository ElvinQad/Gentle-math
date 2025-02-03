'use client';

import { useState, useEffect } from 'react';
import en from '../locales/en.json';
import ru from '../locales/ru.json';

type TranslationType = typeof en;

const translations: Record<string, TranslationType> = {
  en,
  ru,
};

export type Language = keyof typeof translations;

// Function to get initial locale from cookies or default to 'en'
const getInitialLocale = (): Language => {
  if (typeof window === 'undefined') return 'en';
  
  // Try to get the locale from localStorage if available
  const savedLocale = window.localStorage.getItem('locale');
  if (savedLocale && (savedLocale === 'en' || savedLocale === 'ru')) {
    return savedLocale;
  }

  // Default to 'en'
  return 'en';
};

export function useTranslation() {
  // Initialize with 'en' for SSR to avoid hydration mismatch
  const [locale, setLocale] = useState<Language>('en');

  useEffect(() => {
    // Update locale based on domain and localStorage after component mounts
    const isRussianDomain = window.location.hostname.endsWith('.ru');
    const newLocale = isRussianDomain ? 'ru' : getInitialLocale();
    
    if (newLocale !== locale) {
      setLocale(newLocale);
      // Save to localStorage for persistence
      window.localStorage.setItem('locale', newLocale);
    }
  }, []);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[locale];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return value as string;
  };

  return {
    t,
    locale,
    translations: translations[locale],
  };
} 