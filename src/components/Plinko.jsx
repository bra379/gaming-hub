import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import WebApp from '@twa-dev/sdk';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Plinko = ({ dbUser, refreshUser }) => {
    const canvasRef = useRef(null);
    const [betAmount, setBetAmount] = useState(10);
    const [rows, setRows] = useState(12);
    const [loading, setLoading] = useState(false);
    const balls = useRef([]); // Menyimpan bola yang sedang jatuh

    const multipliers = {
        8: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
        12: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
        16: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.2, 0.5, 1, 1.5, 3, 5, 10, 41, 110]
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const render = () => {
            updatePhysics();
            draw(ctx);
            animationFrameId = window.requestAnimationFrame(render);
        };

        render();
        return () => window.cancelAnimationFrame(animationFrameId);
    }, [rows]);

    const updatePhysics = () => {
        balls.current.forEach((ball, index) => {
            if (ball.finished) return;

            // Gravitasi sederhana
            ball.y += 4; 

            // Cek jika sampai di baris paku tertentu
            const spacingY = 300 / (rows + 1);
            const currentRow = Math.floor((ball.y - 40) / spacingY);

            if (currentRow > ball.lastRow && currentRow < rows) {
                ball.lastRow = currentRow;
                // Geser bola ke kiri atau kanan sesuai data server
                const direction = ball.path[currentRow] === 1 ? 1 : -1;
                ball.targetX += (direction * (320 / (rows + 4)) / 2);
            }

            // Lerp X untuk pergerakan halus
            ball.x += (ball.targetX - ball.x) * 0.15;

            // Cek jika sampai bawah
            if (ball.y > 340) {
                ball.finished = true;
                balls.current.splice(index, 1);
                // Trigger efek visual di bucket bisa ditambahkan di sini
            }
        });
    };

    const draw = (ctx) => {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        ctx.clearRect(0, 0, width, height);

        const spacing = width / (rows + 4);
        const startX = width / 2;
        const startY = 50;

        // Draw Pegs
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        for (let r = 0; r <= rows; r++) {
            const rowY = startY + r * (300 / (rows + 1));
            const rowStartX = startX - (r * spacing) / 2;
            for (let c = 0; c <= r; c++) {
                ctx.beginPath();
                ctx.arc(rowStartX + c * spacing, rowY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw Active Balls
        ctx.fillStyle = "#ffeb3b";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ffeb3b";
        balls.current.forEach(ball => {
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, 6, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.shadowBlur = 0;
    };

    const dropBall = async () => {
        if (betAmount > (dbUser?.balance_ton || 0)) {
            WebApp.showAlert('Saldo tidak cukup!');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/api/plinko/play`, {
                userId: dbUser.id,
                betAmount,
                rows
            });

            if (res.data.success) {
                // Tambahkan bola baru ke sistem animasi
                balls.current.push({
                    x: 175,
                    y: 20,
                    targetX: 175,
                    path: res.data.path,
                    lastRow: -1,
                    finished: false
                });
                
                // Refresh saldo setelah animasi mulai (atau bisa di akhir)
                setTimeout(() => {
                    refreshUser();
                    setLoading(false);
                }, 2000);
            }
        } catch (err) {
            WebApp.showAlert('Gagal bermain');
            setLoading(false);
        }
    };

    return (
        <div className="plinko-game">
            <div className="plinko-board-container">
                <canvas 
                    ref={canvasRef} 
                    width={350} 
                    height={380} 
                    className="plinko-canvas"
                />
                <div className="multiplier-row">
                    {multipliers[rows].map((m, i) => (
                        <div key={i} className={`bucket ${m > 1 ? 'win' : 'lose'}`}>
                            {m < 1 ? m : Math.floor(m)}
                        </div>
                    ))}
                </div>
            </div>

            <div className="plinko-controls">
                <div className="control-group">
                    <label>Bet Amount</label>
                    <input type="number" value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} />
                </div>
                <div className="control-group">
                    <label>Rows</label>
                    <select value={rows} onChange={(e) => setRows(Number(e.target.value))}>
                        <option value={8}>8 Rows</option>
                        <option value={12}>12 Rows</option>
                        <option value={16}>16 Rows</option>
                    </select>
                </div>
                <button className="drop-btn" onClick={dropBall} disabled={loading}>
                    {loading ? 'WAIT...' : 'DROP BALL'}
                </button>
            </div>
        </div>
    );
};

export default Plinko;
