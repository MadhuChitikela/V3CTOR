const http = require('http');
const fs = require('fs');
const path = require('path');


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

// Resend Configuration from Environment Variables
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

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

// Helper function to send email via Resend HTTP REST API
const sendResendEmail = async (to, subject, html, replyTo = '', inlineLogo = false) => {
    if (!RESEND_API_KEY) {
        throw new Error('Resend API Key is missing.');
    }

    const payload = {
        from: 'V3CTOR Support <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html
    };

    if (replyTo) {
        payload.reply_to = replyTo;
    }

    if (inlineLogo) {
        const logoPath = path.join(__dirname, 'logo.png');
        if (fs.existsSync(logoPath)) {
            const logoBase64 = fs.readFileSync(logoPath).toString('base64');
            payload.attachments = [
                {
                    content: logoBase64,
                    filename: 'logo.png',
                    content_id: 'logo'
                }
            ];
        }
    }

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || `Resend HTTP Error: ${response.status}`);
    }

    return data;
};

// Function to handle email routing via Resend HTTP API
const routeEmails = async (name, email, subject, message) => {
    if (RESEND_API_KEY) {
        console.log(`[RESEND] Attempting connection via Resend HTTP API...`);
        try {
            // 1. Send Notification to Admin
            await sendResendEmail(
                ADMIN_EMAIL,
                `[V3CTOR Inquiry] ${subject} - from ${name}`,
                getAdminEmailTemplate(name, email, subject, message),
                email,
                false
            );
            console.log(`[RESEND] Admin notification sent to ${ADMIN_EMAIL}`);

            // 2. Send Auto-Responder to Client (Commented out for Sandbox Mode)
            // =========================================================================
            // NOTE: Uncomment the block below after you purchase a custom domain,
            // verify it at resend.com/domains, and update 'onboarding@resend.dev'
            // in sendResendEmail() to your custom domain sender (e.g., support@v3ctor.in).
            // =========================================================================
            /*
            try {
                await sendResendEmail(
                    email,
                    `We've received your inquiry: ${subject} - V3CTOR`,
                    getClientEmailTemplate(name, subject, message),
                    '',
                    true
                );
                console.log(`[RESEND] Auto-responder sent to client ${email}`);
            } catch (clientMailError) {
                console.warn(`[RESEND WARNING] Auto-responder failed to send to client ${email}:`, clientMailError.message);
                console.log(`[RESEND] Rerouting client auto-responder to Admin Email for verification...`);
                
                // Reroute to Admin Email
                await sendResendEmail(
                    ADMIN_EMAIL,
                    `[REROUTED TO ADMIN] We've received your inquiry: ${subject} - V3CTOR`,
                    `<div style="background:#fff3cd; color:#856404; padding:12px; margin-bottom:16px; border:1px solid #ffeeba; border-radius:4px; font-family:sans-serif; font-size:13px;">
                        <strong>Sandbox Notice:</strong> This email was rerouted because Resend is in sandbox/free mode and cannot send directly to unverified external emails. Target Client: <strong>${email}</strong>
                     </div>` + getClientEmailTemplate(name, subject, message),
                    '',
                    true
                );
                console.log(`[RESEND] Rerouted client auto-responder sent to ${ADMIN_EMAIL}`);
            }
            */
            
            return { sent: true, mode: 'RESEND' };
        } catch (error) {
            console.error('[RESEND ERROR] Failed to dispatch mail via Resend API:', error.message);
            throw new Error(`Email delivery failure: ${error.message}`);
        }
    } else {
        // Fallback / Development Mode: log details to console
        console.log(`\n=================== [DEV MODE MAIL LOG] ===================`);
        console.log(`[Resend Key Missing - Running in Local Simulation Mode]`);
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

// Helper to validate admin dashboard password
const validateAdminPassword = (req) => {
    const adminPassword = process.env.ADMIN_PASSWORD || 'v3ctor2026';
    const authHeader = req.headers['authorization'];
    let passwordAttempt = '';
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        passwordAttempt = authHeader.substring(7);
    } else {
        try {
            const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
            passwordAttempt = parsedUrl.searchParams.get('password') || '';
        } catch (e) {
            passwordAttempt = '';
        }
    }
    return passwordAttempt === adminPassword;
};

const server = http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
        setCorsHeaders(res);
        res.writeHead(204);
        res.end();
        return;
    }

    // Parse URL pathname & searchParams
    let pathname = '';
    let searchParams = new URLSearchParams();
    try {
        const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        pathname = parsedUrl.pathname;
        searchParams = parsedUrl.searchParams;
    } catch (e) {
        const parts = req.url.split('?');
        pathname = parts[0];
        if (parts[1]) {
            searchParams = new URLSearchParams(parts[1]);
        }
    }

    // 1. POST /api/contact - Public submission endpoint
    if (req.method === 'POST' && pathname === '/api/contact') {
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

    // 2. GET /api/submissions - Retrieve all logs (Secure)
    if (req.method === 'GET' && pathname === '/api/submissions') {
        setCorsHeaders(res);
        res.setHeader('Content-Type', 'application/json');

        if (!validateAdminPassword(req)) {
            res.writeHead(401);
            res.end(JSON.stringify({ status: 'error', message: 'Unauthorized access.' }));
            return;
        }

        let submissions = [];
        if (fs.existsSync(SUBMISSIONS_FILE)) {
            try {
                const fileData = fs.readFileSync(SUBMISSIONS_FILE, 'utf8');
                submissions = JSON.parse(fileData);
            } catch (e) {
                submissions = [];
            }
        }
        res.writeHead(200);
        res.end(JSON.stringify(submissions));
        return;
    }

    // 3. DELETE /api/submissions - Remove a submission log (Secure)
    if (req.method === 'DELETE' && pathname === '/api/submissions') {
        setCorsHeaders(res);
        res.setHeader('Content-Type', 'application/json');

        if (!validateAdminPassword(req)) {
            res.writeHead(401);
            res.end(JSON.stringify({ status: 'error', message: 'Unauthorized access.' }));
            return;
        }

        const idToDelete = searchParams.get('id');
        if (!idToDelete) {
            res.writeHead(400);
            res.end(JSON.stringify({ status: 'error', message: 'Submission ID is required.' }));
            return;
        }

        let submissions = [];
        if (fs.existsSync(SUBMISSIONS_FILE)) {
            try {
                const fileData = fs.readFileSync(SUBMISSIONS_FILE, 'utf8');
                submissions = JSON.parse(fileData);
            } catch (e) {
                submissions = [];
            }
        }

        const filtered = submissions.filter(sub => sub.id !== idToDelete);
        if (submissions.length === filtered.length) {
            res.writeHead(404);
            res.end(JSON.stringify({ status: 'error', message: 'Submission entry not found.' }));
            return;
        }

        try {
            fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(filtered, null, 4), 'utf8');
            console.log(`[ADMIN DELETE] Deleted contact entry ID: ${idToDelete}`);
            res.writeHead(200);
            res.end(JSON.stringify({ status: 'success', message: 'Entry deleted successfully.' }));
        } catch (writeError) {
            res.writeHead(500);
            res.end(JSON.stringify({ status: 'error', message: 'Failed to update database.' }));
        }
        return;
    }

    // 4. POST /api/test-smtp - SMTP Diagnostic verification signal (Secure)
    if (req.method === 'POST' && pathname === '/api/test-smtp') {
        setCorsHeaders(res);
        res.setHeader('Content-Type', 'application/json');

        if (!validateAdminPassword(req)) {
            res.writeHead(401);
            res.end(JSON.stringify({ status: 'error', message: 'Unauthorized access.' }));
            return;
        }

        try {
            console.log(`[SMTP DIAGNOSTIC] Initiating SMTP connection check...`);
            const testResult = await routeEmails(
                'V3CTOR Diagnostics Node', 
                ADMIN_EMAIL, 
                'SMTP Pipeline Diagnostic Success', 
                'This message verifies that the V3CTOR email dispatch pipeline and SMTP authentication credentials are active and healthy. System signal successful.'
            );
            
            res.writeHead(200);
            res.end(JSON.stringify({ 
                status: 'success', 
                message: 'Test email successfully routed.', 
                deliveryMode: testResult.mode 
            }));
        } catch (smtpError) {
            console.error(`[SMTP DIAGNOSTIC ERROR] Failed SMTP handshake:`, smtpError.message);
            res.writeHead(500);
            res.end(JSON.stringify({ 
                status: 'error', 
                message: `SMTP diagnostic failed: ${smtpError.message}` 
            }));
        }
        return;
    }

    // 5. GET /admin - Serve the Admin Dashboard view
    if (req.method === 'GET' && (pathname === '/admin' || pathname === '/admin.html')) {
        setCorsHeaders(res);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(path.join(__dirname, 'admin.html')).pipe(res);
        return;
    }

    // 6. GET Static Files (index.html, style.css, logo, images)
    if (req.method === 'GET') {
        let reqUrl = pathname === '/' ? '/index.html' : (pathname === '/favicon.ico' ? '/logo_symbol.png' : pathname);
        
        // Resolve path securely and block directory traversals
        const safeUrl = path.normalize(reqUrl).replace(/^(\.\.[\/\\])+/, '');
        const filePath = path.join(__dirname, safeUrl);
        
        // Ensure path remains inside the project directory root
        if (!filePath.startsWith(__dirname)) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('Access Forbidden');
            return;
        }

        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes = {
                '.html': 'text/html; charset=utf-8',
                '.css': 'text/css; charset=utf-8',
                '.js': 'application/javascript; charset=utf-8',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
                '.json': 'application/json; charset=utf-8',
                '.ico': 'image/x-icon'
            };
            const contentType = mimeTypes[ext] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType });
            fs.createReadStream(filePath).pipe(res);
            return;
        }
    }

    // fallback 404
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
