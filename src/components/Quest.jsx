import React from 'react';
import axios from 'axios';
import WebApp from '@twa-dev/sdk';

const Quest = ({ dbUser, refreshUser }) => {
    const BOT_NAME = "MyGamingHubBot"; // Ganti dengan username bot Anda

    const completeQuest = async (name) => {
        try {
            await axios.post('http://localhost:5000/api/quest/complete', { userId: dbUser.id, questName: name });
            WebApp.showAlert('Quest completed! +20 Stars');
            refreshUser();
        } catch (e) { WebApp.showAlert('Gagal'); }
    };

    const copyInviteLink = () => {
        const link = `https://t.me/${BOT_NAME}?start=${dbUser.telegram_id}`;
        navigator.clipboard.writeText(link);
        WebApp.showAlert('Link referral disalin!');
    };

    return (
        <div className="quest-container">
            <h3>Daily Tasks</h3>
            <div className="quest-list">
                <button onClick={() => { window.open('https://t.me/group_anda'); completeQuest('join_group'); }}>Join Group (+20⭐)</button>
                <button onClick={() => completeQuest('post_story')}>Post Story (+20⭐)</button>
                <button onClick={copyInviteLink}>Copy Invite Link (+50⭐/user)</button>
            </div>
        </div>
    );
};
export default Quest;
