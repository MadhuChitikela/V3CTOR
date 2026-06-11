const http = require('http');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Load local .env file if it exists (fallback for running "node server.js" without flags)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const cleanLine = line.trim();
            if (cleanLine && !cleanLine.startsWith('#')) {
                const parts = cleanLine.split('=');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
                    if (!process.env[key]) {
                        process.env[key] = value;
                    }
                }
            }
        });
        console.log(`[SYSTEM] Loaded environment variables from .env file`);
    } catch (e) {
        console.warn(`[SYSTEM] Failed to load .env file:`, e.message);
    }
}

const PORT = process.env.PORT || 3000;
const SUBMISSIONS_FILE = path.join(__dirname, 'submissions.json');

// SMTP Configuration from Environment Variables
const SMTP_CONFIG = {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
    }
};

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'vertexproject.in@gmail.com';

// Helper to set CORS headers
const setCorsHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

// HTML Email Template Generator for Client Auto-Responder
const getClientEmailTemplate = (name, subject, message) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; color: #1a1a2e; margin: 0; padding: 20px; }
            .card { max-width: 600px; background: #ffffff; border-radius: 16px; margin: 0 auto; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03); }
            .header { background: #ffffff; padding: 24px; text-align: center; border-bottom: 1px solid #edf2f7; }
            .logo { font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 2px; text-transform: uppercase; margin: 0; }
            .logo span { color: #C67C4E; }
            .content { padding: 32px 24px; line-height: 1.6; }
            .greeting { font-size: 18px; font-weight: 700; color: #0a2540; margin-bottom: 16px; }
            .payload-box { background: #f8fafc; border-left: 4px solid #C67C4E; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0; }
            .payload-title { font-weight: 700; color: #0a2540; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
            .footer { background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #4A5568; }
            .footer-tagline { font-weight: 700; letter-spacing: 1.5px; color: #0a2540; text-transform: uppercase; margin-bottom: 8px; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="header">
                <img src="cid:logo" alt="V3CTOR" style="height: 80px; width: auto; display: block; margin: 0 auto; object-fit: contain;">
            </div>
            <div class="content">
                <div class="greeting">Hello ${name},</div>
                <p>Thank you for reaching out to V3CTOR. We have successfully received your transmission and logged it into our deployment pipeline.</p>
                <p>Our team is currently reviewing your details and will establish a connection with you shortly.</p>
                
                <div class="payload-box">
                    <div class="payload-title">Your Inquiry Details:</div>
                    <strong>Subject:</strong> ${subject}<br>
                    <strong>Payload:</strong><br>
                    <span style="font-style: italic; white-space: pre-wrap;">"${message}"</span>
                </div>
                
                <p>Best regards,<br><strong>V3CTOR Team</strong></p>
            </div>
            <div class="footer">
                <div class="footer-tagline">design &bull; develop &bull; deploy</div>
                &copy; 2026 V3CTOR. All rights reserved. &bull; India
            </div>
        </div>
    </body>
    </html>
    `;
};

// HTML Email Template Generator for Admin Notification
const getAdminEmailTemplate = (name, email, subject, message) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; color: #1a1a2e; margin: 0; padding: 20px; }
            .card { max-width: 600px; background: #ffffff; border-radius: 16px; margin: 0 auto; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03); }
            .header { background: #C67C4E; padding: 24px; text-align: center; color: white; }
            .title { font-size: 18px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin: 0; }
            .content { padding: 32px 24px; line-height: 1.6; }
            .detail-row { margin-bottom: 12px; }
            .detail-label { font-weight: 700; color: #0a2540; min-width: 100px; display: inline-block; }
            .msg-box { background: #f8fafc; border: 1px dashed #cbd5e1; padding: 16px; margin-top: 16px; border-radius: 8px; font-family: monospace; white-space: pre-wrap; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="header">
                <h1 class="title">New Project Inquiry</h1>
            </div>
            <div class="content">
                <div class="detail-row"><span class="detail-label">Name:</span> ${name}</div>
                <div class="detail-row"><span class="detail-label">Email:</span> <a href="mailto:${email}">${email}</a></div>
                <div class="detail-row"><span class="detail-label">Subject:</span> ${subject}</div>
                
                <div class="detail-row" style="margin-top: 20px;">
                    <span class="detail-label">Message Payload:</span>
                    <div class="msg-box">${message}</div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

// Function to handle email routing
const routeEmails = async (name, email, subject, message) => {
    // Check if SMTP details are provided
    const hasSmtpConfig = SMTP_CONFIG.host && SMTP_CONFIG.auth.user && SMTP_CONFIG.auth.pass;

    if (hasSmtpConfig) {
        console.log(`[SMTP] Attempting connection to ${SMTP_CONFIG.host}:${SMTP_CONFIG.port}...`);
        try {
            const transporter = nodemailer.createTransport({
                ...SMTP_CONFIG,
                connectionTimeout: 5000, // 5 seconds
                greetingTimeout: 5000,   // 5 seconds
                socketTimeout: 5000      // 5 seconds
            });
            
            // 1. Send Notification to Admin
            await transporter.sendMail({
                from: `"${name} via V3CTOR" <${SMTP_CONFIG.auth.user}>`,
                to: ADMIN_EMAIL,
                replyTo: email,
                subject: `[V3CTOR Inquiry] ${subject} - from ${name}`,
                html: getAdminEmailTemplate(name, email, subject, message)
            });
            console.log(`[SMTP] Admin notification sent to ${ADMIN_EMAIL}`);

            // 2. Send Auto-Responder to Client
            await transporter.sendMail({
                from: `"V3CTOR Support" <${SMTP_CONFIG.auth.user}>`,
                to: email,
                subject: `We've received your inquiry: ${subject} - V3CTOR`,
                html: getClientEmailTemplate(name, subject, message),
                attachments: [{
                    filename: 'logo.png',
                    path: path.join(__dirname, 'logo.png'),
                    cid: 'logo',
                    disposition: 'inline'
                }]
            });
            console.log(`[SMTP] Auto-responder sent to client ${email}`);
            
            return { sent: true, mode: 'SMTP' };
        } catch (error) {
            console.error('[SMTP ERROR] Failed to dispatch mail via SMTP:', error.message);
            throw new Error(`Email delivery failure: ${error.message}`);
        }
    } else {
        // Fallback / Development Mode: log details to console
        console.log(`\n=================== [DEV MODE MAIL LOG] ===================`);
        console.log(`[SMTP Config Missing - Running in Local Simulation Mode]`);
        console.log(`-----------------------------------------------------------`);
        console.log(`1. notification email to admin:`);
        console.log(`   Recipient: ${ADMIN_EMAIL}`);
        console.log(`   Subject  : [V3CTOR Inquiry] ${subject} - from ${name}`);
        console.log(`   Reply-To : ${email}`);
        console.log(`-----------------------------------------------------------`);
        console.log(`2. confirmation auto-responder to client:`);
        console.log(`   Recipient: ${email}`);
        console.log(`   Subject  : We've received your inquiry: ${subject} - V3CTOR`);
        console.log(`===========================================================\n`);
        return { sent: true, mode: 'SIMULATION' };
    }
};

const server = http.createServer((req, res) => {
    if (req.method === 'OPTIONS') {
        setCorsHeaders(res);
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/api/contact') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', async () => {
            setCorsHeaders(res);
            res.setHeader('Content-Type', 'application/json');
            
            try {
                const payload = JSON.parse(body);
                const { name, email, subject, message, honeypot } = payload;
                
                if (!name || !email || !subject || !message) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ status: 'error', message: 'Missing required payload parameters.' }));
                    return;
                }
                
                if (honeypot && honeypot.trim() !== '') {
                    console.warn(`[SPAM BLOCKED] Honeypot field filled: "${honeypot}"`);
                    res.writeHead(400);
                    res.end(JSON.stringify({ status: 'error', message: 'Spam submission rejected.' }));
                    return;
                }
                
                const newSubmission = {
                    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
                    timestamp: new Date().toISOString(),
                    name,
                    email,
                    subject,
                    message
                };
                
                // Read and save submissions
                let submissions = [];
                if (fs.existsSync(SUBMISSIONS_FILE)) {
                    try {
                        const fileData = fs.readFileSync(SUBMISSIONS_FILE, 'utf8');
                        submissions = JSON.parse(fileData);
                    } catch (e) {
                        submissions = [];
                    }
                }
                
                submissions.push(newSubmission);
                fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 4), 'utf8');
                console.log(`[SUBMISSION] Saved contact entry from ${name} (${email})`);

                // Dispatch Emails
                try {
                    const mailResult = await routeEmails(name, email, subject, message);
                    res.writeHead(200);
                    res.end(JSON.stringify({ 
                        status: 'success', 
                        message: 'Submission saved and emails processed.', 
                        deliveryMode: mailResult.mode 
                    }));
                } catch (mailError) {
                    // Log the error but save the submission anyway
                    console.error('[EMAIL ERROR] Submissions saved, but mail failed to send:', mailError.message);
                    res.writeHead(200); // We still return 200 since the database saved the query
                    res.end(JSON.stringify({ 
                        status: 'success', 
                        message: 'Submission saved, but email routing failed.', 
                        deliveryMode: 'FAILED' 
                    }));
                }
                
            } catch (err) {
                res.writeHead(400);
                res.end(JSON.stringify({ status: 'error', message: 'Invalid JSON payload.' }));
            }
        });
        return;
    }

    setCorsHeaders(res);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', message: 'Endpoint not found.' }));
});

server.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`  V3CTOR Backend Running on http://localhost:${PORT}`);
    console.log(`  Target JSON file: ${SUBMISSIONS_FILE}`);
    console.log(`  Email Redirects To: ${ADMIN_EMAIL}`);
    console.log(`==================================================`);
});
