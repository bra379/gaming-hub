import React, { useState } from 'react';
import axios from 'axios';
import WebApp from '@twa-dev/sdk';
import { useTranslation } from 'react-i18next';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { toNano } from '@ton/ton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Wallet = ({ dbUser, refreshUser }) => {
    const { t } = useTranslation();
    const [tonConnectUI] = useTonConnectUI();
    const userAddress = useTonAddress();
    const [loading, setLoading] = useState(false);
    const [tonAmount, setTonAmount] = useState('0.1');
    const [withdrawAddress, setWithdrawAddress] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');

    const handleTONDeposit = async () => {
        if (!userAddress) {
            WebApp.showAlert(t('connect'));
            return;
        }
        const amount = parseFloat(tonAmount);
        if (isNaN(amount) || amount < 0.1) {
            WebApp.showAlert('Minimal deposit adalah 0.1 TON');
            return;
        }

        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 600,
            messages: [{
                address: 'UQBPgmHJPRs5B049OrkvSiQqG-YI0T5MzVogOpXZaULrRFMp',
                amount: toNano(amount).toString(),
            }]
        };

        try {
            setLoading(true);
            const result = await tonConnectUI.sendTransaction(transaction);
            await axios.post(`${API_URL}/api/deposit/ton`, {
                userId: dbUser.id, 
                txHash: result.boc, 
                amount: amount,
                address: userAddress
            });
            WebApp.showAlert(t('success'));
            refreshUser();
        } catch (e) {
            WebApp.showAlert(t('error'));
        } finally {
            setLoading(false);
        }
    };

    const handleStarsDeposit = async (amount) => {
        try {
            setLoading(true);
            const res = await axios.post(`${API_URL}/api/deposit/stars`, { userId: dbUser.id, amount });
            if (res.data.success) {
                WebApp.openInvoice(res.data.invoiceLink, (status) => {
                    if (status === 'paid') {
                        WebApp.showAlert(t('success'));
                        refreshUser();
                    }
                });
            }
        } catch (e) {
            WebApp.showAlert(t('error'));
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        const amount = parseFloat(withdrawAmount);
        if (isNaN(amount) || amount > dbUser.balance_ton) {
            WebApp.showAlert(t('insufficient_balance'));
            return;
        }
        if (!withdrawAddress) {
            WebApp.showAlert('Alamat wallet harus diisi');
            return;
        }

        try {
            setLoading(true);
            await axios.post(`${API_URL}/api/withdraw/ton`, {
                userId: dbUser.id,
                amount: amount,
                address: withdrawAddress
            });
            WebApp.showAlert(t('success'));
            refreshUser();
        } catch (e) {
            WebApp.showAlert(t('error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="wallet-container">
            <div className="balance-grid">
                <div className="balance-card">
                    <h3>TON</h3>
                    <div className="amount">💎 {dbUser?.balance_ton || 0}</div>
                </div>
                <div className="balance-card stars-card">
                    <h3>Stars</h3>
                    <div className="amount">⭐ {dbUser?.balance_stars || 0}</div>
                </div>
            </div>

            <div className="tabs-container">
                <div className="deposit-section">
                    <h4>{t('deposit')} TON (Min. 0.1)</h4>
                    <div className="input-group">
                        <input 
                            type="number" 
                            step="0.1" 
                            placeholder="Nominal TON" 
                            value={tonAmount} 
                            onChange={(e) => setTonAmount(e.target.value)} 
                        />
                        <button className="deposit-btn" onClick={handleTONDeposit} disabled={loading}>
                            {loading ? 'Processing...' : t('deposit')}
                        </button>
                    </div>
                </div>

                <div className="stars-deposit-section">
                    <h4>Top Up Stars</h4>
                    <div className="stars-grid">
                        {[50, 100, 250, 500].map(amt => (
                            <button key={amt} className="stars-btn" onClick={() => handleStarsDeposit(amt)} disabled={loading}>
                                ⭐ {amt}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="withdraw-section">
                    <h4>{t('withdraw')} TON</h4>
                    <div className="input-group">
                        <input 
                            placeholder="Wallet Address" 
                            value={withdrawAddress} 
                            onChange={(e) => setWithdrawAddress(e.target.value)} 
                        />
                        <input 
                            type="number" 
                            placeholder="Amount" 
                            value={withdrawAmount} 
                            onChange={(e) => setWithdrawAmount(e.target.value)} 
                        />
                        <button className="withdraw-btn" onClick={handleWithdraw} disabled={loading}>
                            {loading ? 'Processing...' : t('withdraw')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Wallet;
