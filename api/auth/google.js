export default function handler(req, res) {
    const baseUrl   = process.env.APP_URL;
    const loginHint = req.query?.login_hint || "";
    const state     = req.query?.state || "web";

    const paramObj = {
        client_id:     process.env.GOOGLE_CLIENT_ID,
        redirect_uri:  `${baseUrl}/api/auth/callback`,
        response_type: "code",
        scope:         "openid email profile",
        access_type:   "offline",
        state:         state,
        prompt:        "select_account consent",
    };

    if (loginHint) {
        paramObj.login_hint = loginHint;
    }

    const params = new URLSearchParams(paramObj);
    res.redirect(302, `https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}