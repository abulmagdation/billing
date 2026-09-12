import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState('ar');
  const [loadingLanguage, setLoadingLanguage] = useState(true);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem('app_language');
        if (savedLang === 'en' || savedLang === 'ar') {
          setLangState(savedLang);
        }
      } catch (err) {
        console.log('Failed to load language preference', err);
      } finally {
        setLoadingLanguage(false);
      }
    };
    loadLanguage();
  }, []);

  const setLang = async (newLang) => {
    try {
      setLangState(newLang);
      await AsyncStorage.setItem('app_language', newLang);
    } catch (err) {
      console.log('Failed to save language preference', err);
    }
  };

  const toggleLanguage = () => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  };

  const t = translations[lang] || translations.ar;
  const isRTL = lang === 'ar';
  const flexDirection = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        toggleLanguage,
        t,
        isRTL,
        flexDirection,
        textAlign,
        loadingLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
