## Struktur Project

```
hdpx.keygen/
├── api/
│   ├── auth/
│   │   ├── callback.js
│   │   └── google.js
│   ├── login/
│   │   └── popup-google-auth.js
│   ├── trial.js
│   ├── _db.js          ← shared: DB pool, hash, email,
│   ├── user.js         ← POST /api/send-verify, verify, check-email, get-user, logout
│   └── config.js       ← POST /api/app config
├── public/
│   ├── assets/images/
│   │   └── sorce all.svg
│   ├── css/
│   │   ├── styling.css
│   │   ├── pricing.css
│   │   ├── refer.css
│   │   ├── redeem.css
│   │   ├── support.css
│   │   └── billing.css
│   ├── scripts/
│   │   ├── pages/
│	  │   │   ├── account-settings.js
│	  │   │   ├── pricing-inapp.js
│	  │   │   ├── refer-settings.js
│	  │   │   ├── redeem.js
│	  │   │   ├── support.js
│	  │   │   └── billing-settings.js
│   │	  ├── utils/
│	  │   │   ├── prefile_from_app.js
│	  │   │   ├── switcher.js
│	  │   │   ├── app_settings.js
│	  │   │   ├── navigate.js
│	  │   │   └── data.js
│   │	  └── templates/
│	  │       ├── password.html
│	  │       ├── recover.html
│	  │       ├── login.html
│	  │       ├── redeem.html
│	  │       ├── pricing.html
│	  │       └── support.html
│   └── index.html
├── .gitignore
├── package.json
└── vercel.json
```
