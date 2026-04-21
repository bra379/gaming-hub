import React, { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './i18n';
import './App.css';
import Wallet from './components/Wallet';
import Crash from './components/Crash';
import Mines from './components/Mines';
import Plinko from './components/Plinko';

function App() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null); // Data dari Telegram SDK
  const [dbUser, setDbUser] = useState(null); // Data dari Database Backend
  const [activeTab, setActiveTab] = useState('home');
  const [activeGame, setActiveGame] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchUserFromDB = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        initData: WebApp.initData
      });
      if (response.data.success) {
        setDbUser(response.data.user);
      }
    } catch (err) {
      console.error('Login Error:', err);
    }
  };

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();

    if (WebApp.initDataUnsafe && WebApp.initDataUnsafe.user) {
      setUser(WebApp.initDataUnsafe.user);
      fetchUserFromDB();
    }
  }, []);

  const changeLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ru' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="user-info">
          {user ? (
            <>
              <img src={user.photo_url || 'https://via.placeholder.com/150'} alt="" className="avatar" />
              <span>{t('welcome', { name: user.first_name })}</span>
            </>
          ) : (
            <span>{t('scanning')}</span>
          )}
        </div>
        <div className="header-actions">
          <button onClick={changeLanguage} className="lang-btn">
            {t('lang_switch')}
          </button>
          <TonConnectButton />
        </div>
      </header>

      <main className="main-content">
        {activeTab === 'home' && !activeGame && (
          <>
            <h1>{t('hub')}</h1>
            <div className="game-grid">
              <div className="game-card" onClick={() => setActiveGame('crash')}>{t('crash')}</div>
              <div className="game-card" onClick={() => setActiveGame('mines')}>{t('mines')}</div>
              <div className="game-card" onClick={() => setActiveGame('plinko')}>{t('plinko')}</div>
              <div className="game-card" onClick={() => setActiveGame('keno')}>{t('keno')}</div>
            </div>
          </>
        )}

        {activeTab === 'home' && activeGame === 'crash' && (
          <Crash dbUser={dbUser} refreshUser={fetchUserFromDB} />
        )}

        {activeTab === 'home' && activeGame === 'mines' && (
          <Mines dbUser={dbUser} refreshUser={fetchUserFromDB} />
        )}

        {activeTab === 'home' && activeGame === 'plinko' && (
          <Plinko dbUser={dbUser} refreshUser={fetchUserFromDB} />
        )}

        {activeTab === 'wallet' && (
          <Wallet user={user} dbUser={dbUser} refreshUser={fetchUserFromDB} />
        )}
      </main>

      <footer className="footer-nav">
        <button onClick={() => { setActiveTab('home'); setActiveGame(null); }} className={activeTab === 'home' ? 'active' : ''}>
          {t('home')}
        </button>
        <button onClick={() => setActiveTab('wallet')} className={activeTab === 'wallet' ? 'active' : ''}>
          {t('wallet')}
        </button>
        <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'active' : ''}>
          {t('profile')}
        </button>
      </footer>
    </div>
  );
}

export default App;
