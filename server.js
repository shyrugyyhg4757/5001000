const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const USERS_FILE = path.join(__dirname, 'users.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function getUsers() {
    try {
        if (!fs.existsSync(USERS_FILE)) {
            fs.writeFileSync(USERS_FILE, '[]');
        }
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

app.post('/api/register', (req, res) => {
    const { displayName, username, password } = req.body;

    if (!displayName || !username || !password) {
        return res.status(400).json({ success: false, message: 'يرجى تعبئة جميع الحقول!' });
    }

    const users = getUsers();
    const userExists = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (userExists) {
        return res.status(400).json({ success: false, message: 'اسم الدخول مستخدم بالفعل، اختر اسماً آخر.' });
    }

    const newUser = {
        displayName,
        username: username.toLowerCase(),
        password
    };

    users.push(newUser);
    saveUsers(users);

    res.json({
        success: true,
        message: 'تم إنشاء الحساب بنجاح!',
        user: { displayName: newUser.displayName, username: newUser.username }
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'يرجى إدخال اسم الدخول وكلمة السر!' });
    }

    const users = getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

    if (!user) {
        return res.status(401).json({ success: false, message: 'اسم الدخول أو كلمة السر غير صحيحة!' });
    }

    res.json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح!',
        user: { displayName: user.displayName, username: user.username }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
