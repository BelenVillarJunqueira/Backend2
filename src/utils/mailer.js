const nodemailer = require('nodemailer');

const {
MAIL_HOST,
MAIL_PORT,
MAIL_USER,
MAIL_PASS,
NODE_ENV
} = process.env;

let transporter = null;

if (MAIL_USER && MAIL_PASS) {
transporter = nodemailer.createTransport({
    host: MAIL_HOST || 'smtp.gmail.com',
    port: Number(MAIL_PORT) || 587,
    secure: false,
    auth: { user: MAIL_USER, pass: MAIL_PASS }
});
} else {
console.warn('⚠️  Se logueará el resetURL en consola.');
}

async function sendPasswordResetEmail(to, resetURL) {

if (!transporter) {
    console.log(`🔗 [DEV] Password reset link para ${to}: ${resetURL}`);
    return true;
}

try {
    await transporter.sendMail({
    from: MAIL_USER,
    to,
    subject: 'Restablecer contraseña',
    html: `
        <p>Hacé click para restablecer tu contraseña (expira en 1 hora):</p>
        <p><a href="${resetURL}" style="display:inline-block;padding:10px 14px;background:#0d6efd;color:#fff;border-radius:6px;text-decoration:none;">Restablecer</a></p>
        <p>Si no ves el botón, copiá y pegá esta URL:</p>
        <pre>${resetURL}</pre>`
    });
    return true;
} catch (err) {
    console.error('❌ Error enviando email:', err);
    return false;
}
}

module.exports = { sendPasswordResetEmail };