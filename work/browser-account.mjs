import fs from 'node:fs';
import bcrypt from '../sentinel-auth/backend/node_modules/bcryptjs/index.js';
import db from '../sentinel-auth/backend/src/config/database.js';
import { User, Session } from '../sentinel-auth/backend/src/models/index.js';
db.options.logging = false;
const file = new URL('./browser-account.json', import.meta.url);
try {
    if (process.argv[2] === 'cleanup') {
        const {id, email} = JSON.parse(fs.readFileSync(file));
        const user = await User.findOne({where: {id, email}});
        if (!user || !email.endsWith('@example.invalid')) throw new Error('Fixture identity mismatch');
        await db.transaction(async transaction => {
            await Session.destroy({where: {user_id: id}, force: true, transaction});
            await user.destroy({force: true, transaction});
        });
        fs.unlinkSync(file);
        console.log('Temporary browser account and sessions removed.');
    } else {
        const email = `codex-browser-${Date.now()}@example.invalid`;
        const user = await User.create({name: 'Browser Verification', email,
            password: await bcrypt.hash('Temporary-Codex-Check-2026!', 12),
            email_verified_at: new Date()});
        fs.writeFileSync(file, JSON.stringify({id: user.id, email}));
        console.log(email);
    }
} finally { await db.close(); }
