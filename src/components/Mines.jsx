import React, { useState } from 'react';
import axios from 'axios';
import WebApp from '@twa-dev/sdk';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Mines = ({ dbUser, refreshUser }) => {
    const { t } = useTranslation();
    const [betAmount, setBetAmount] = useState(10);
    const [bombCount, setBombCount] = useState(3);
    const [gameStatus, setGameStatus] = useState('idle'); // 'idle', 'playing', 'ended'
    const [grid, setGrid] = useState(Array(25).fill(null)); // null, 'gem', 'bomb'
    const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
    const [allBombs, setAllBombs] = useState([]);

    const startGame = async () => {
        if (betAmount > (dbUser?.balance_ton || 0)) {
            WebApp.showAlert('Saldo tidak cukup!');
            return;
        }

        try {
            const res = await axios.post(`${API_URL}/api/mines/start`, {
                userId: dbUser.id,
                betAmount,
                bombCount
            });
            if (res.data.success) {
                setGameStatus('playing');
                setGrid(Array(25).fill(null));
                setCurrentMultiplier(1.00);
                setAllBombs([]);
                refreshUser();
            }
        } catch (err) {
            WebApp.showAlert(err.response?.data?.message || 'Gagal memulai game');
        }
    };

    const openTile = async (pos) => {
        if (gameStatus !== 'playing' || grid[pos] !== null) return;

        try {
            const res = await axios.post(`${API_URL}/api/mines/open`, {
                userId: dbUser.id,
                tilePos: pos
            });

            const newGrid = [...grid];
            if (res.data.hitBomb) {
                setGameStatus('ended');
                setAllBombs(res.data.allBombs);
                newGrid[pos] = 'bomb';
                WebApp.showAlert('BOOM! Anda kalah.');
            } else {
                newGrid[pos] = 'gem';
                setCurrentMultiplier(res.data.currentMultiplier);
            }
            setGrid(newGrid);
        } catch (err) {
            console.error(err);
        }
    };

    const cashOut = async () => {
        try {
            const res = await axios.post(`${API_URL}/api/mines/cashout`, {
                userId: dbUser.id
            });
            if (res.data.success) {
                setGameStatus('ended');
                setAllBombs(res.data.allBombs);
                WebApp.showAlert(`Selamat! Anda menang ${res.data.winAmount} TON.`);
                refreshUser();
            }
        } catch (err) {
            WebApp.showAlert('Gagal cash out');
        }
    };

    return (
        <div className="mines-game">
            <div className="mines-info">
                <div className="stat">
                    <span>Multiplier</span>
                    <span className="val">{currentMultiplier}x</span>
                </div>
                <div className="stat">
                    <span>Profit</span>
                    <span className="val text-green">{(betAmount * currentMultiplier).toFixed(2)}</span>
                </div>
            </div>

            <div className="mines-grid">
                {grid.map((tile, i) => (
                    <div 
                        key={i} 
                        className={`mine-tile ${tile} ${allBombs.includes(i) ? 'is-bomb' : ''}`}
                        onClick={() => openTile(i)}
                    >
                        {tile === 'gem' && '💎'}
                        {tile === 'bomb' && '💣'}
                        {!tile && allBombs.includes(i) && '💣'}
                    </div>
                ))}
            </div>

            <div className="mines-controls">
                {gameStatus === 'idle' || gameStatus === 'ended' ? (
                    <>
                        <div className="control-group">
                            <label>Bet Amount</label>
                            <input type="number" value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} />
                        </div>
                        <div className="control-group">
                            <label>Bombs (1-24)</label>
                            <input type="number" value={bombCount} onChange={(e) => setBombCount(Number(e.target.value))} />
                        </div>
                        <button className="start-btn" onClick={startGame}>BET</button>
                    </>
                ) : (
                    <button className="cashout-btn" onClick={cashOut}>
                        CASH OUT ({(betAmount * currentMultiplier).toFixed(2)})
                    </button>
                )}
            </div>
        </div>
    );
};

export default Mines;
