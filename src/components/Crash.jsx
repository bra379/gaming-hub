import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import WebApp from '@twa-dev/sdk';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(API_URL);

const Crash = ({ dbUser, refreshUser }) => {
    const { t } = useTranslation();
    const [status, setStatus] = useState('waiting');
    const [multiplier, setMultiplier] = useState(1.00);
    const [timer, setTimer] = useState(0);
    const [betAmount, setBetAmount] = useState(1);
    const [currency, setCurrency] = useState('TON'); // Default TON
    const [hasBet, setHasBet] = useState(false);
    const [hasCashedOut, setHasCashedOut] = useState(false);

    useEffect(() => {
        socket.on('crash_waiting', (data) => {
            setStatus('waiting');
            setTimer(data.timer);
            setHasBet(false);
            setHasCashedOut(false);
        });
        socket.on('crash_tick', (data) => { setStatus('running'); setMultiplier(data.multiplier); });
        socket.on('crash_end', (data) => { setStatus('crashed'); setMultiplier(data.multiplier); });

        return () => {
            socket.off('crash_waiting');
            socket.off('crash_tick');
            socket.off('crash_end');
        };
    }, []);

    const handlePlaceBet = async () => {
        const balance = currency === 'TON' ? dbUser.balance_ton : dbUser.balance_stars;
        if (betAmount > balance) { WebApp.showAlert('Saldo kurang!'); return; }
        
        try {
            await axios.post(`${API_URL}/api/crash/bet`, {
                userId: dbUser.id, amount: betAmount, currency 
            });
            setHasBet(true);
            refreshUser();
        } catch (err) { WebApp.showAlert('Gagal bertaruh'); }
    };

    return (
        <div className="crash-game">
            <div className="currency-switch">
                <button onClick={() => setCurrency('TON')} className={currency === 'TON' ? 'active' : ''}>💎 TON</button>
                <button onClick={() => setCurrency('STARS')} className={currency === 'STARS' ? 'active' : ''}>⭐ STARS</button>
            </div>
            {/* UI Multiplier & Bet controls sama seperti sebelumnya */}
            <div className="multiplier-display">{multiplier}x</div>
            <input type="number" value={betAmount} onChange={(e)=>setBetAmount(Number(e.target.value))} />
            <button onClick={handlePlaceBet} disabled={hasBet}>BET</button>
        </div>
    );
};
export default Crash;
