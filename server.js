// server.js - BACKEND TIKTOK DOWNLOADER
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// ========== KONFIGURASI API ==========
const API_KEY = "PREMIUM03DYWHDHWHFHAJXSJFHAJS";
const API_URL = "https://hyerls.my.id/api/tiktok.php";

// ========== DATABASE USER (JSON) ==========
const USERS_FILE = path.join(__dirname, 'users.json');

function loadUsers() {
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

function saveUsers(data) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

// ========== ENDPOINT API ==========

// 1. DOWNLOAD TIKTOK
app.get('/api/download', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.json({
            success: false,
            message: "URL TikTok harus diisi!"
        });
    }

    try {
        const response = await axios.get(API_URL, {
            params: {
                key: API_KEY,
                url: url
            },
            timeout: 15000
        });

        res.json(response.data);
    } catch (error) {
        res.json({
            success: false,
            message: "Gagal ambil data dari API: " + error.message
        });
    }
});

// 2. REGISTER
app.post('/api/register', (req, res) => {
    const { nama, password } = req.body;

    if (!nama || !password) {
        return res.json({ success: false, message: "Nama dan password wajib diisi!" });
    }

    const data = loadUsers();

    // Cek user udah ada
    const ada = data.users.find(u => u.nama.toLowerCase() === nama.toLowerCase());
    if (ada) {
        return res.json({ success: false, message: "User udah terdaftar!" });
    }

    // Tambah user baru
    data.users.push({
        nama: nama,
        password: password,
        created: new Date().toISOString()
    });

    saveUsers(data);

    res.json({ success: true, message: "Registrasi berhasil! Silakan login." });
});

// 3. LOGIN
app.post('/api/login', (req, res) => {
    const { nama, password } = req.body;

    if (!nama || !password) {
        return res.json({ success: false, message: "Nama dan password wajib diisi!" });
    }

    const data = loadUsers();

    const user = data.users.find(u =>
        u.nama.toLowerCase() === nama.toLowerCase() &&
        u.password === password
    );

    if (!user) {
        return res.json({ success: false, message: "Nama atau password salah!" });
    }

    res.json({
        success: true,
        message: "Login berhasil!",
        user: { nama: user.nama }
    });
});

// 4. LIST USER (buat admin)
app.get('/api/users', (req, res) => {
    const data = loadUsers();
    res.json(data);
});

// ========== JALANKAN SERVER ==========
app.listen(PORT, () => {
    console.log(`🔥 Server jalan di http://localhost:${PORT}`);
    console.log(`📱 Buka browser: http://localhost:${PORT}`);
});
