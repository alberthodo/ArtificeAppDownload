# Artifice

This repository holds two things:

- **Artifice's installers and update feed**, on the [releases page](https://github.com/alberthodo/ArtificeAppDownload/releases). The app updates itself from `latest.json` there. The app's source code is private.
- **The Artifice website**: a small React site (Vite) deployed on Vercel. It has a quiet home page, downloads, the sign-in page the app opens, docs for the app and its command line, the changelog, privacy and terms.

| Computer | Installer |
|---|---|
| Mac with Apple Silicon (M1 and later) | `Artifice_<version>_aarch64.dmg` |
| Mac with Intel | `Artifice_<version>_x64.dmg` |
| Windows PC (most) | `Artifice_<version>_x64-setup.exe` |
| Windows on ARM (Snapdragon) | `Artifice_<version>_arm64-setup.exe` |

What changed in each version: [CHANGELOG.md](CHANGELOG.md). The website shows only released versions.

## The website

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # into dist/
```

| Path | Page | Source |
|---|---|---|
| `/` | Home: name, one line, download | `src/pages/Home.jsx` |
| `/download` | Every installer for the latest release (read from GitHub) | `src/pages/Download.jsx` |
| `/sign-in` | The page the app and `artifice login` open | `src/pages/SignIn.jsx` |
| `/docs/…` | Docs: using the app, and the command line | `src/docs/*.md`, listed in `src/pages/Docs.jsx` |
| `/changelog` | `CHANGELOG.md`, released versions only | `src/pages/Changelog.jsx` |
| `/privacy`, `/terms` | Privacy policy and terms | `src/pages/Legal.jsx` |

The site is deliberately quiet:
- The docs explain how to use Artifice, never how it works inside.
- `/docs`, `/sign-in` and `/changelog` ask search engines not to index them (`robots.txt` and a `robots` meta tag).

### Deploying on Vercel

1. Import this repository in Vercel. It detects Vite; `vercel.json` sets the build, page routing and security headers.
2. Add the environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Supabase › Project settings › API). The anon key is public by design. Without them, the sign-in page says sign-in isn't open yet.
3. Add your domain. Never use hodo.studio.
4. In Supabase › Authentication › URL Configuration, add `https://<domain>/sign-in**` to the allowed redirect URLs. Turn on these providers:
   - Google;
   - Apple;
   - Azure, for Microsoft;
   - Email, with the magic link email and a sending service such as Resend.
5. Build the app with `ARTIFICE_SIGNIN_URL=https://<domain>/sign-in`, together with `ARTIFICE_SUPABASE_URL` and `ARTIFICE_SUPABASE_ANON_KEY`.
6. Deploy the account deletion function: `supabase functions deploy delete-account` (source in `supabase/functions/delete-account`).

The old GitHub Pages files moved:
- `privacy.html` is now `/privacy`, and `changelog.html` is now `/changelog`. Vercel redirects the old addresses.
- The icons and the link preview image moved to `public/`.
