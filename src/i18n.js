import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          "welcome": "Welcome, {{name}}!",
          "hub": "Gaming Hub",
          "crash": "Crash",
          "mines": "Mines",
          "plinko": "Plinko",
          "keno": "Keno",
          "home": "Home",
          "wallet": "Wallet",
          "profile": "Profile",
          "connect": "Connect Wallet",
          "scanning": "Memuat data...",
          "lang_switch": "RU",
          "next_round_in": "Next round in",
          "bet_amount": "Bet Amount",
          "balance": "Balance",
          "deposit": "Deposit",
          "withdraw": "Withdraw",
          "insufficient_balance": "Insufficient balance",
          "success": "Success",
          "error": "Error"
          }
          },
          ru: {
          translation: {
          "welcome": "Добро пожаловать, {{name}}!",
          "hub": "Игровой Хаб",
          "crash": "Краш",
          "mines": "Мины",
          "plinko": "Плинко",
          "keno": "Кено",
          "home": "Главная",
          "wallet": "Кошелек",
          "profile": "Профиль",
          "connect": "Подключить",
          "scanning": "Загрузка...",
          "lang_switch": "EN",
          "next_round_in": "Следующий раунд через",
          "bet_amount": "Сумма ставки",
          "balance": "Баланс",
          "deposit": "Депозит",
          "withdraw": "Вывод",
          "insufficient_balance": "Недостаточный баланс",
          "success": "Успех",
          "error": "Ошибка"
          }

      }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
