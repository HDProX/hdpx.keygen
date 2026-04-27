import { query } from "../_db.js";

export default async function handler(req, res) {
    const { code, error, state } = req.query;

    if (error) {
        try {
            await fetch(
                "http://localhost:9876?error=" + encodeURIComponent(error),
                { mode: "no-cors" }
            );
        } catch (e) {}

        const params = new URLSearchParams({ error: "Login failed.", state: state || "" });
        return res.redirect(302, `/login/popup-google-auth?${params}`);
    }

    try {
        let email  = "";
        let name   = "";
        let avatar = "";

        if (code) {
            const baseUrl = process.env.APP_URL;

            const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    code,
                    client_id:     process.env.GOOGLE_CLIENT_ID,
                    client_secret: process.env.GOOGLE_CLIENT_SECRET,
                    redirect_uri:  `${baseUrl}/api/auth/callback`,
                    grant_type:    "authorization_code",
                }),
            });

            const tokenData = await tokenResp.json();

            if (tokenData.error) {
                const params = new URLSearchParams({ error: tokenData.error, state: state || "" });
                return res.redirect(302, `/login/popup-google-auth?${params}`);
            }

            const userResp = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
                headers: { Authorization: `Bearer ${tokenData.access_token}` },
            });

            const googleUser = await userResp.json();

            email  = googleUser.email?.toLowerCase().trim() || "";
            name   = googleUser.name  || "";
            avatar = googleUser.picture || "";

            if (!email) {
                const params = new URLSearchParams({ error: "no_email" });
                return res.redirect(302, `/login/popup-google-auth?${params}`);
            }

            const existing = await query(
                "SELECT id FROM users WHERE email = ? LIMIT 1", [email]
            );

            if (!existing.length) {
                await query(
                    `INSERT INTO users (name, email, password_hash, salt, is_google,
                     phone, bio, avatar_url, created_at, updated_at)
                     VALUES (?, ?, '', '', true, '', '', ?, NOW(), NOW())`,
                    [name, email, avatar]
                );
            } else {
                await query(
                    `UPDATE users SET avatar_url = ?, last_login = NOW(),
                     is_logged_in = true, updated_at = NOW() WHERE email = ?`,
                    [avatar, email]
                );
            }
        }
        
        const params = new URLSearchParams({ email, name, avatar, state: state || "" });
        return res.redirect(302, `/login/popup-google-auth?${params}`);

    } catch (err) {
        console.error("callback:", err.message);
        const params = new URLSearchParams({ error: err.message, state: state || "" });
        return res.redirect(302, `/login/popup-google-auth?${params}`);
    }
}