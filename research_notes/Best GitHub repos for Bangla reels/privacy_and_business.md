# Themes I + J: privacy & security for normal people; free open-source apps for freelancers, small businesses and offices

Research date: 2026-10-30. All star counts were read from the github.com repo page on 2026-10-30 (WebFetch of github.com pages and READMEs; api.github.com was NOT called). Many GitHub release lists show only "day month" without a year; where the year is shown (asset timestamps or changelog) it is stated, otherwise it is marked "year not shown" and any year is an inference.

Audience filter used for ranking: Bangladeshi phone-first viewers, Windows laptop with 8 GB RAM, no Docker or server. "Usable without self-hosting" (desktop installer, browser extension, phone app, or official free hosted tier) was weighted most heavily, then money saved / risk avoided, then maintenance, then variety (one tool per job inside a 5-repo video).

---

## Q1. Theme I (privacy & security): ranked 8, final Top 5 + 2 backups, fact sheets

### Takeaway
Top 5: **Bitwarden** (password manager, free cloud), **uBlock Origin / uBO Lite** (ad, tracker and malware-site blocker), **Ente Auth** (2FA codes with encrypted backup, has a Windows app), **Cryptomator** (encrypt Google Drive/OneDrive files), **VeraCrypt** (encrypted drive / USB, hidden volume). Backups: **KeePassXC** (offline password manager) and **PrivateBin** (self-destructing secret links on public instances). Everything in this set runs without a server. Vaultwarden, AdGuard Home and Pi-hole were dropped because each needs a server that is always on.

### Cited Findings

#### Ranked list of 8 (rank = value for this viewer; the Top 5 also covers five different jobs)
1. Bitwarden (bitwarden/clients): 14.1k★, GPL-3.0. TOP 5.
2. uBlock Origin (gorhill/uBlock): 68.9k★, GPL-3.0, plus uBO Lite (uBlockOrigin/uBOL-home): 4.0k★, GPL-3.0. TOP 5.
3. Ente Auth (ente/ente monorepo): 29.8k★, AGPL-3.0. TOP 5.
4. Cryptomator (cryptomator/cryptomator): 16.4k★, GPL-3.0. TOP 5.
5. VeraCrypt (veracrypt/VeraCrypt): 12.0k★, Apache-2.0 + TrueCrypt License 3.0. TOP 5.
6. KeePassXC (keepassxreboot/keepassxc): 29.6k★, GPL-2.0 or GPL-3.0. BACKUP 1.
7. PrivateBin (PrivateBin/PrivateBin): 8.7k★, Zlib. BACKUP 2.
8. Aegis (beemdevelopment/Aegis): 13.4k★, GPL-3.0. Android only, so it may belong in the Android theme.
(Sources are in each fact sheet below.)

Considered and ranked out (each needs a server, has too few stars, or is platform-limited):
- Vaultwarden (dani-garcia/vaultwarden): 69.9k★, AGPL-3.0. It is "An alternative server implementation of the Bitwarden Client API, written in Rust". Its install is a `docker run … vaultwarden/server:latest` command with a `DOMAIN="https://…"` setting, the web vault "requires the use of HTTPS and a secure context for the Web Crypto API", and "This project is not associated with Bitwarden or Bitwarden, Inc." — [GitHub](https://github.com/dani-garcia/vaultwarden)
- AdGuard Home (AdguardTeam/AdGuardHome): 37.9k★, GPL-3.0. "network-wide ads & trackers blocking DNS server". The automated installer (a `curl … install.sh | sh` command) covers Linux, Unix, macOS, FreeBSD and OpenBSD. Windows appears only through a third-party Chocolatey package. Its README comparison table (AdGuard's own view) marks Pi-hole as not cross-platform and lacking encrypted upstream DNS and parental control by default — [GitHub](https://github.com/AdguardTeam/AdGuardHome)
- Pi-hole (pi-hole/pi-hole): 61.6k★. "Network-wide ad blocking via your own Linux hardware"; install `curl -sSL https://install.pi-hole.net | bash`. The licence name was not visible on the page — [GitHub](https://github.com/pi-hole/pi-hole)
- 2FAS Android (twofas/2fas-android): 1.6k★, GPL-3.0. The README says "the official Android app for the Open Source 2FAS project" and links to 2fas.com for download — [GitHub](https://github.com/twofas/2fas-android)

#### TOP 1. Bitwarden: bitwarden/clients
- URL: https://github.com/bitwarden/clients. About text: "Bitwarden client apps (web, browser extension, desktop, and cli)." — [GitHub](https://github.com/bitwarden/clients)
- What it does: a password manager that keeps every password in one encrypted vault and fills it in on the browser, PC and phone.
- Problem it solves for this viewer: one reused password (Facebook = Gmail = bKash-linked email) means one leak opens every account. With a manager, each site gets its own strong password and you only have to remember one master password.
- Replaces: paid password managers (1Password, Dashlane, LastPass paid tiers; their prices were not checked).
- Stars ~14.1k (read 2026-10-30). Only the client apps are in this repo; the server code lives elsewhere. Licence GPL-3.0. No archive notice — [GitHub](https://github.com/bitwarden/clients)
- Latest releases: desktop-v2026.10.2 (29 Oct, marked Latest), browser-v2026.10.1 (29 Oct), cli-v2026.10.1 (29 Oct), web-v2026.10.1 (28 Oct). The version numbers fix the year as 2026 — [Releases](https://github.com/bitwarden/clients/releases)
- Install (official, for non-coders): bitwarden.com/download offers a Windows "Standard installer", a Portable build ("doesn't auto-update"), the Microsoft Store (store id 9PJSDV0VPK04) and `choco install bitwarden`. There is an Edge add-on, and Chrome and Firefox are named. Phones: App Store and Google Play (com.x8bit.bitwarden); an F-Droid repo also exists, but push sync does not work in that build — [Bitwarden download](https://bitwarden.com/download/)
- Free plan: "Get basic password management today. Always free." Core features: "Unlimited devices, unlimited passwords", "Passkey management and usage", "Free sharing with another user", "Advanced two-step login". Premium costs "$1.65" per month, "Billed annually at $19.80". It adds an integrated authenticator, file attachments, emergency access, security reports, 5 GB storage and vault health alerts — [Bitwarden pricing](https://bitwarden.com/pricing/)
- First use [UI labels not page-verified; confirm while screen-recording]: (1) Add the extension from the Edge/Chrome store and create an account with a master password. (2) Log in to any site; Bitwarden offers to save that login. (3) Next time, click the Bitwarden icon or the autofill prompt and the password is filled in.
- Hook (verifiable): the free plan already gives "Unlimited devices, unlimited passwords" and passkeys; the paid plan is only $19.80 a year — [Bitwarden pricing](https://bitwarden.com/pricing/)
- Caveats: the vault is stored in Bitwarden's cloud (an account is needed; see the Inferences section on master-password loss). Self-hosting is optional (through Vaultwarden, which is a different project) and not needed.
- Beginner difficulty: 1/5.

#### TOP 2. uBlock Origin: gorhill/uBlock (+ uBO Lite: uBlockOrigin/uBOL-home for Chrome)
- URL: https://github.com/gorhill/uBlock. A "wide-spectrum content blocker" that also blocks trackers, coin miners, popups and malware sites; "CPU and memory-efficient" — [README](https://github.com/gorhill/uBlock/blob/master/README.md)
- What it does: a browser extension that stops ads, trackers and known malware/scam sites from loading.
- Problem it solves for this viewer: fake "download" buttons, scam pop-ups and trackers on free-movie, news and APK sites, and slow pages on a cheap phone or an 8 GB laptop.
- Replaces: paid or "freemium" ad blockers (prices not checked).
- Stars ~68.9k (read 2026-10-30). Licence GPL-3.0. No archive notice; 14,425 commits — [GitHub](https://github.com/gorhill/uBlock). uBO Lite: ~4.0k★, GPL-3.0 — [GitHub](https://github.com/uBlockOrigin/uBOL-home)
- Latest release: 1.75.0 (16 Sep, marked Latest; year not shown). Pre-releases 1.75.1rc0, rc1 and rc3 came on 26, 28 and 29 Oct — [Releases](https://github.com/gorhill/uBlock/releases)
- Install, by browser:
  - Firefox (desktop and Android): Firefox Add-ons. "uBO works best on Firefox and is available for desktop and Android versions." — [GitHub](https://github.com/gorhill/uBlock)
  - Edge: Microsoft Edge Add-ons. The README also quotes Microsoft: "Beginning in August 2026, Microsoft Edge will start the consumer transition away from Manifest Version 2 (MV2)" — [GitHub](https://github.com/gorhill/uBlock)
  - **Chrome: the full uBO is gone.** README: "Chrome Web Store: Removed on 2026-08-31"; timeline: "Aug 31st 2026: All remaining Manifest V2 extensions removed from the Chrome Web Store" — [GitHub](https://github.com/gorhill/uBlock). Chrome users install **uBO Lite** instead: https://chromewebstore.google.com/detail/ublock-origin-lite/ddkjiahejlhfcafbddmgiahcphecmpfh. It is also on Edge, Firefox and the Safari App Store — [uBOL-home](https://github.com/uBlockOrigin/uBOL-home)
- What uBO Lite is: "an efficient content blocker based on the MV3 API"; it "operates entirely declaratively, meaning no permanent process is required for filtering". Default lists: uBO's own, EasyList, EasyPrivacy, Peter Lowe's list — [uBOL-home](https://github.com/uBlockOrigin/uBOL-home)
- First use [UI not page-verified]: (1) Click "Add to Chrome/Edge/Firefox" in the store. (2) Open a news site; the toolbar icon shows the count of blocked items. (3) If a site breaks, click the icon and turn blocking off for that site.
- Hook (verifiable): "No donations sought." — [README](https://github.com/gorhill/uBlock/blob/master/README.md). Alternative hook: Google removed it from the Chrome Web Store on 2026-08-31 — [GitHub](https://github.com/gorhill/uBlock)
- Caveats: Chrome users only get Lite, which is less configurable (the details were not checked); Edge's MV2 phase-out started in August 2026, so the full uBO on Edge may go away too. Some sites refuse to work when they detect a blocker. Do not promise "YouTube ad-free" (not checked).
- Beginner difficulty: 1/5.

#### TOP 3. Ente Auth: ente/ente (monorepo; Auth releases are tagged auth-v4.x)
- URL: https://github.com/ente/ente. The fetch of github.com/ente-io/ente displayed the repo as "ente/ente" with links under github.com/ente/ente, so the old address appears to redirect — [GitHub](https://github.com/ente/ente)
- What it does: a two-factor (2FA) code app, with an end-to-end encrypted backup that syncs the codes across phone, PC and web.
- Problem it solves for this viewer: a stolen password alone can no longer open Facebook, Gmail, Upwork or Fiverr. And if the phone is lost, the 2FA codes come back from the encrypted backup instead of locking you out of your own accounts.
- Replaces: closed-source authenticators (Google Authenticator, Authy). This is mainly risk avoided, not money saved.
- Stars ~29.8k (read 2026-10-30). The count is for the whole monorepo, which includes Ente Photos. Licence AGPL-3.0. No archive notice — [GitHub](https://github.com/ente/ente)
- Latest Auth releases: auth-v4.4.26 (19 Oct), auth-v4.4.25 (03 Aug), auth-v4.4.24 (06 Jul). The year is not shown — [Auth releases](https://github.com/ente/ente/releases?q=tag%3Aauth-v4)
- Install: apps for iOS (App Store), Android (Play Store, F-Droid), Web (auth.ente.com), macOS, Linux and **Windows (EXE)**. "Cloud backups are end-to-end encrypted"; you can "use Auth without an account, though without backups"; bulk import from other 2FA apps, plus QR or manual entry — [ente.com/auth](https://ente.com/auth)
- First use [UI not page-verified]: (1) Install it on the phone; optionally create an account to turn on encrypted backup. (2) In Facebook or Google security settings, choose "authenticator app", then tap + in Ente Auth and scan the QR code. (3) A 6-digit code appears; type it into the site to finish.
- Hook (verifiable): "Ente Auth is free, and will remain free forever." Also, the source code and cryptography "have been externally audited by Cure53" (Symbolic Software and Fallible are named too; the audits cover the project in general) — [GitHub README](https://github.com/ente/ente)
- Caveats: without an account there is no backup, so losing the phone loses the codes. AGPL does not limit normal use.
- Beginner difficulty: 2/5.

#### TOP 4. Cryptomator: cryptomator/cryptomator
- URL: https://github.com/cryptomator/cryptomator. "Cryptomator for Windows, macOS, and Linux: Secure client-side encryption for your cloud storage" — [GitHub](https://github.com/cryptomator/cryptomator)
- What it does: creates a locked "vault" folder inside Google Drive, OneDrive or Dropbox. Files are encrypted on your own PC before they are uploaded.
- Problem it solves for this viewer: NID or passport scans, client contracts, salary sheets and tax files sitting readable in Google Drive. If the account is hacked or shared, those files stay unreadable.
- Replaces: paid cloud-encryption add-ons (prices not checked).
- Stars ~16.4k (read 2026-10-30). Licence GPL-3.0; the README adds a commercial licence for ISVs and resellers. No archive notice — [GitHub](https://github.com/cryptomator/cryptomator)
- Latest release: **1.19.6, 30 Oct 2026** (Latest). 1.20.0-beta1 (macOS only, pre-release) came out the same day; 1.19.5 on 28 Oct 2026 — [Releases](https://github.com/cryptomator/cryptomator/releases)
- Install: "Download native binaries of Cryptomator" on cryptomator.org (the README; building from source needs JDK 26 and is for developers) — [GitHub](https://github.com/cryptomator/cryptomator)
- Price: "All functional and encryption features are absolutely free to use on the desktop." On Android and iOS the app is free but read-only; full access is a one-time purchase, "€29.99", on sale for "€19.99" until 31 Oct. A supporter certificate (€29.99 / sale €19.99) only unlocks dark mode on desktop — [Cryptomator pricing](https://cryptomator.org/pricing/)
- Security facts: each file has its own key ("file specific keys"); file names are stored as "ciphertext filenames"; files are "transparently en- and decrypted" with no unencrypted copies on disk; scrypt derives the key from the password. The page does not say the password is ever sent to a server — [Security architecture](https://docs.cryptomator.org/security/architecture/)
- First use [UI not page-verified]: (1) Click "Add vault", create a new one inside the Google Drive folder on the PC, set a password and save the recovery key. (2) Unlock it; it opens as a drive in File Explorer. (3) Drag files in. In Google Drive's web view only scrambled names and data are visible.
- Hook (verifiable): even the file names get scrambled in the cloud ("ciphertext filenames") — [docs](https://docs.cryptomator.org/security/architecture/); the desktop app is completely free — [pricing](https://cryptomator.org/pricing/)
- Caveats: it needs the cloud's sync app (for example Google Drive for desktop) on the PC; writing to the vault from a phone is paid; losing both the password and the recovery key means losing the data (see Inferences).
- Beginner difficulty: 2/5.

#### TOP 5. VeraCrypt: veracrypt/VeraCrypt
- URL: https://github.com/veracrypt/VeraCrypt. "Disk encryption with strong security based on TrueCrypt"; "based on the original TrueCrypt 7.1a with security enhancements and modifications" — [GitHub](https://github.com/veracrypt/VeraCrypt)
- What it does: makes an encrypted container (one file that opens as a password-locked drive letter), or encrypts a whole USB stick or disk.
- Problem it solves for this viewer: a lost pen drive or laptop carrying office or client files. Without the password the files cannot be read.
- Replaces: paid disk/USB encryption tools (prices not checked).
- Stars ~12.0k (read 2026-10-30). No archive notice — [GitHub](https://github.com/veracrypt/VeraCrypt). Licence: "multi-licensed under Apache License 2.0 and the TrueCrypt License version 3.0"; the product as a whole is governed by the TrueCrypt License. The TrueCrypt License is not an OSI licence, so this needs flagging — [License.txt](https://github.com/veracrypt/VeraCrypt/blob/master/License.txt)
- Latest release: GitHub shows VeraCrypt_1.26.30 (24 Oct 2026, Latest) and 1.26.29 (12 Jun; changelog date 9 June 2026) — [Releases](https://github.com/veracrypt/VeraCrypt/releases). **However, the official download page says the Windows 1.26.30 EXE and MSI installers were "withdrawn due to reported upgrade issues"**, so Windows is on 1.26.29 (9 June 2026) and only macOS/Linux are on 1.26.30 (24 Oct 2026) — [Downloads](https://veracrypt.jp/en/Downloads.html)
- Install (Windows): "VeraCrypt Setup 1.26.29.exe" (x64 + ARM64), MSI installers, and "VeraCrypt Portable 1.26.29.exe". The site asks other sites to link to the page rather than host the files — [Downloads](https://veracrypt.jp/en/Downloads.html)
- First use [UI labels not page-verified]: (1) Create Volume, then "Create an encrypted file container"; pick a size and a password. (2) Select a free drive letter, choose the container and click Mount. (3) Copy files to that drive, then Dismount.
- Hook (verifiable): the **hidden volume**. A second volume sits inside the first, behind a decoy password, and "it should be impossible to prove whether there is a hidden volume within it or not"; the decoy files "will be there for anyone who would force you to hand over the password" — [Hidden Volume docs](https://veracrypt.jp/en/Hidden%20Volume.html)
- Caveats: the most steps of the five; a forgotten password means the data is gone; whole-system encryption is risky for beginners (see Inferences). Tell viewers to download from veracrypt.jp, not from random mirrors, and to stay on 1.26.29 for Windows until 1.26.30 comes back.
- Beginner difficulty: 3/5.

#### BACKUP 1. KeePassXC: keepassxreboot/keepassxc
- URL: https://github.com/keepassxreboot/keepassxc. "a cross-platform community-driven port of the Windows application 'KeePass Password Safe'" — [GitHub](https://github.com/keepassxreboot/keepassxc)
- What it does: an offline password manager. All passwords live in one encrypted file on your own PC; there is no account and no company cloud.
- Problem it solves for this viewer: the same as Bitwarden, for people who do not want their vault on anyone's server.
- Replaces: paid password managers.
- Stars ~29.6k (read 2026-10-30). Licence "GPL-2 or GPL-3" (README). No archive notice — [GitHub](https://github.com/keepassxreboot/keepassxc)
- Latest release: **2.8.0, 21 Oct 2026** (Latest); 2.8.0-beta1 on 23 Sep; 2.7.12 on 10 Mar — [Releases](https://github.com/keepassxreboot/keepassxc/releases)
- Install: "Installer (x64, Windows 10 / 11)" KeePassXC-2.8.0-x64.msi ("Requires MSVC Redistributable"), a Portable ZIP, the Microsoft Store, `winget install -e --id KeePassXCTeam.KeePassXC`, or `choco install keepassxc`. The KeePassXC-Browser extension is on the Firefox, Chrome and Edge stores. Windows 7/8 stopped at 2.7.12 — [Download](https://keepassxc.org/download/)
- Features: browser integration, TOTP storage and generation, passkeys through the browser integration, password-health and HIBP reports, Auto-Type, YubiKey/OnlyKey — [GitHub](https://github.com/keepassxreboot/keepassxc)
- First use [UI not page-verified]: (1) Create a new database and set a master password. (2) Add an entry, or let KeePassXC-Browser save one. (3) Run the reports to see weak or leaked passwords.
- Hook (verifiable): it can check your passwords against Have I Been Pwned from inside the app (the "Reports (password health, HIBP…)" feature) — [GitHub](https://github.com/keepassxreboot/keepassxc)
- Caveats: syncing between PC and phone is your job (for example, keep the file in Google Drive); the phone needs another KeePass-compatible app (not checked). It overlaps with Bitwarden, so do not put both in the same 5-repo video.
- Beginner difficulty: 2–3/5.

#### BACKUP 2. PrivateBin: PrivateBin/PrivateBin
- URL: https://github.com/PrivateBin/PrivateBin. "A minimalist, open source online pastebin where the server has zero knowledge of pasted data." Data is encrypted and decrypted in the browser with 256-bit AES-GCM; it offers password protection and "Expiration times, including a 'forever' and 'burn after reading' option" — [GitHub](https://github.com/PrivateBin/PrivateBin)
- What it does: paste a password or private text and get a link that can delete itself after it is read once.
- Problem it solves for this viewer: freelancers send passwords, API keys or bank details to clients over Messenger or WhatsApp, where they stay in the chat history forever.
- Replaces: nothing paid directly; this is risk avoided.
- Stars ~8.7k (read 2026-10-30). No archive notice. The README says "Current version: 2.1.0" — [GitHub](https://github.com/PrivateBin/PrivateBin). Licence: Zlib/libpng — [LICENSE.md](https://github.com/PrivateBin/PrivateBin/blob/master/LICENSE.md)
- Use without self-hosting: the official directory lists **187 public instances** (some are duplicate hosts). Examples on v2.1.0 with an A+ Observatory rating: 0bin.ch (Switzerland), **privatebin.net** (Switzerland), p.bittenbyt.es (Netherlands) — [Instance directory](https://privatebin.info/directory/)
- First use [UI labels not page-verified]: (1) Open privatebin.net. (2) Paste the text, choose "Burn after reading" or an expiry time, and optionally add a password. (3) Create the paste and send the link; it is gone once the client opens it.
- Hook (verifiable): the server "has zero knowledge" of what you paste, because encryption happens in your browser — [GitHub](https://github.com/PrivateBin/PrivateBin)
- Caveats: you trust whoever runs the instance to serve the genuine code, and the directory page carries no disclaimer about that — [Instance directory](https://privatebin.info/directory/). Running your own copy needs a PHP web server.
- Beginner difficulty: 1/5.

#### Rank 8. Aegis: beemdevelopment/Aegis (also fits the Android theme)
- URL: https://github.com/beemdevelopment/Aegis. "a free, secure and open source 2FA app for Android"; an AES-256-GCM vault unlocked by password or fingerprint; "Automatic backups of the vault to a location of your choosing"; imports from Google Authenticator and Authy; on Google Play and F-Droid; Android only (no iOS or Windows) — [GitHub](https://github.com/beemdevelopment/Aegis)
- Stars ~13.4k (read 2026-10-30), GPL-3.0. Latest release v3.4.3 (06 Sep, Latest; year not shown) — [Releases](https://github.com/beemdevelopment/Aegis/releases)

### Inferences
- Bitwarden + uBO/uBO Lite + Ente Auth makes a "10-minute" trio: each is a store install with no command line. Cryptomator and VeraCrypt are 15–30 minute jobs and are harder to show in a Reel, so put them in places 4–5.
- If the Android-phone researcher takes Aegis, Ente Auth is a better fit here anyway, because it has a Windows desktop app and a web app; Aegis is Android only.
- Loss risk applies to every tool in this theme: a forgotten master password (Bitwarden, KeePassXC), a lost vault password plus recovery key (Cryptomator) or a lost VeraCrypt password generally means the data is gone for good. The video should say "write down your recovery key". This follows from how they are designed; no single page here states it in those words.
- The Chrome story (uBO removed on 2026-08-31, uBO Lite as the replacement) is a strong, timely hook, but the script must say "Chrome users install uBO Lite" or viewers will search and find nothing.
- VeraCrypt's withdrawn Windows 1.26.30 build is a real trap in late October 2026: a viewer who grabs the "Latest" asset from GitHub gets the withdrawn version. Point them to veracrypt.jp.

### Gaps
- PrivateBin's latest release date was not captured (the README only says "2.1.0").
- The year on the Ente Auth, Aegis and uBO stable release dates is not shown on GitHub. The release sequences suggest 2026 for Ente and uBO, but this is not confirmed.
- How uBO Lite's filtering differs from full uBO was not checked in detail.
- Signal Desktop, Privacy Badger and online "privacy checker" tools were not checked this session (run out of tool budget); they are not in the list.
- I found no verified source for prices of the paid tools these replace (1Password, LastPass, Dashlane, paid ad blockers), so none are quoted.
- The first-use click paths are from general product knowledge, not from pages read this session; confirm the button labels while screen-recording.

---

## Q2. Theme J (free apps for freelancers, small businesses and offices): ranked 8, final Top 5 + 2 backups, fact sheets

### Takeaway
Top 5: **Stirling-PDF** (60+ PDF tools, Windows desktop app that works offline, free plan), **Excalidraw** (whiteboard, nothing to install), **Invoice Ninja** (hosted free plan: unlimited invoices for 5 clients; source-available Elastic licence, not OSI open source), **Plane** (Jira/ClickUp-style projects, free cloud for 12 users), **Joplin** (Evernote-style notes, Windows and phone, end-to-end encrypted sync through your own OneDrive or Dropbox). Backups: **BentoPDF** (PDF tools that run in the browser and never upload your files) and **Documenso** (DocuSign alternative, free for 5 documents a month). **Cal.com is no longer a fit:** its public repo became `calcom/cal.diy`, which is self-host only ("There is no hosted/managed version"), and the hosted Cal.com product is now closed source.

### Cited Findings

#### Ranked list of 8
1. Stirling-PDF (Stirling-Tools/Stirling-PDF): 95.4k★, open-core (core MIT). TOP 5.
2. Excalidraw (excalidraw/excalidraw): 134.9k★, MIT. TOP 5.
3. Invoice Ninja (invoiceninja/invoiceninja): 10.4k★, Elastic License (source-available). TOP 5.
4. Plane (makeplane/plane): 61.7k★, AGPL-3.0. TOP 5.
5. Joplin (laurent22/joplin): 56.9k★, AGPL-3.0-or-later. TOP 5.
6. BentoPDF (alam00000/bentopdf): 16.2k★, AGPL-3.0 (or a paid commercial licence). BACKUP 1.
7. Documenso (documenso/documenso): 15.6k★, AGPL-3.0. BACKUP 2.
8. AFFiNE (toeverything/AFFiNE): 74.0k★, MIT Community Edition; or AppFlowy (AppFlowy-IO/AppFlowy): 78.0k★, AGPL-3.0. Notion-style workspaces; swap one in for Joplin if the video wants a "Notion alternative" hook.
(Sources are in each fact sheet below.)

Considered and ranked out:
- **Cal.com → cal.diy**: github.com/calcom/cal.com now shows **calcom/cal.diy**, 49.5k★, MIT; "There is no hosted/managed version. You run it on your own infrastructure." — [GitHub](https://github.com/calcom/cal.com). Cal.com's blog says the production codebase "went from a public repository to a private one". The public repo was renamed cal.diy, with Teams/Organizations, SAML/SSO, Insights and API v1 removed and the licence moved from AGPL-3.0 to MIT. I read this in the search-result summary of the post, not by fetching it — [Cal.com blog](https://cal.com/blog/cal-diy-open-source-to-closed-source)
- Rallly (lukevella/rallly): 5.3k★, AGPL-3.0. "an open-source scheduling tool that helps you find the best date and time to meet"; the hosted rallly.co has a "Try Rallly free" link (plan details not shown). This is the open-source scheduling option if one is wanted — [GitHub](https://github.com/lukevella/rallly)
- Paperless-ngx (paperless-ngx/paperless-ngx): 47.4k★, GPL-3.0. "The easiest way to deploy paperless is `docker compose`". Warning: it "should never be run on an untrusted host because information is stored in clear text without encryption" — [GitHub](https://github.com/paperless-ngx/paperless-ngx). Great for an office archive, but it needs Docker.
- Twenty CRM (twentyhq/twenty): 60.1k★. "The open alternative to Salesforce, designed for AI"; cloud at twenty.com (whether it is free or a trial is not stated); self-host with Docker Compose — [GitHub](https://github.com/twentyhq/twenty). Licence: "mostly AGPLv3", but files marked `/* @license Enterprise */` "may only be used in production" under a commercial agreement — [LICENSE](https://github.com/twentyhq/twenty/blob/main/LICENSE)
- ERPNext (frappe/erpnext): 40.8k★, GPL-3.0. The Docker quick start (`docker compose -f pwd.yml up -d`, login `Administrator`/`admin`) is labelled "Disposable demo only"; the hosted Frappe Cloud has no price on the page — [GitHub](https://github.com/frappe/erpnext)
- Akaunting (akaunting/akaunting): 10.3k★. "BSL license" (source-available; flag it). Needs PHP 8.2+, a database and Node 18/20; no hosted option is mentioned in the README — [GitHub](https://github.com/akaunting/akaunting)
- InvoiceShelf (InvoiceShelf/InvoiceShelf): 1.9k★, AGPL-3.0, self-host only (a public demo resets itself). The default 3.x branch is an alpha "not for production data" — [GitHub](https://github.com/InvoiceShelf/InvoiceShelf)
- tldraw (tldraw/tldraw): 51.2k★. Under the "tldraw license": "Production use requires a license key" (for the SDK). The README does not call tldraw.com free — [GitHub](https://github.com/tldraw/tldraw)

#### TOP 1. Stirling-PDF: Stirling-Tools/Stirling-PDF
- URL: https://github.com/Stirling-Tools/Stirling-PDF. "a powerful, open-source PDF editing platform"; it lets you "Edit, sign, redact, convert, and automate PDFs without sending documents to external services" — [GitHub](https://github.com/Stirling-Tools/Stirling-PDF)
- What it does: merge, split, compress, convert, sign and redact PDFs in a free app that also works offline.
- Problem it solves for this viewer: accountants and office staff upload salary sheets, bank statements and NID scans to free PDF websites, and hit daily limits or paywalls there.
- Replaces: Adobe Acrobat Pro and paid PDF websites (prices not checked).
- Stars ~95.4k (read 2026-10-30); 10.6k forks. No archive notice; 6,432 commits — [GitHub](https://github.com/Stirling-Tools/Stirling-PDF)
- Licence: **open-core**. The core is MIT, but `app/proprietary/`, `app/saas/`, `engine/`, `frontend/src/editor/desktop/`, `…/proprietary/`, `…/saas/`, `…/cloud/` and `frontend/src/processor/` each have their own LICENSE file, whose terms were not visible — [LICENSE](https://github.com/Stirling-Tools/Stirling-PDF/blob/main/LICENSE)
- Latest release: **v3.2.2, 24 Oct 2026** (Latest). Assets include Stirling-PDF-windows-x86_64.msi and Stirling-PDF-windows-arm64-setup.exe. v3.2.1 came out on 21 Oct and v3.2.0 on 15 Oct — [Releases](https://github.com/Stirling-Tools/Stirling-PDF/releases)
- Install (Windows, official docs): (1) Download the installer from `https://files.stirlingpdf.com/win-installer.exe` (the link text says "Stirling-PDF-windows-x86_64.msi"). (2) Run it and approve the administrator prompt; it "installs for all users". (3) Open Stirling PDF from the Start menu. It also installs through winget or Scoop and "Requires Windows 10 or 11". At first launch, "Continue without signing in" gives Local Only mode — [Desktop install](https://docs.stirlingpdf.com/Desktop/Install/). The desktop app "Works offline" — [Docs](https://docs.stirlingpdf.com/). For a server: `docker run -p 8080:8080 docker.stirlingpdf.com/stirlingtools/stirling-pdf` — [GitHub](https://github.com/Stirling-Tools/Stirling-PDF)
- Price: the "Free" plan is "$0/month", "No card required", with 60+ PDF tools on web, desktop and self-hosted, and "1,000 monthly credits". The Team plan is $99/month for 100 users (single sign-on, team workspace) — [Pricing](https://stirling.com/pricing)
- First use [UI not page-verified]: (1) Pick a tool, for example Merge or Compress. (2) Drop the PDFs in. (3) Download the result; with Local Only mode nothing leaves the PC.
- Hook (verifiable): ~95k GitHub stars, and it works offline on Windows ("Works offline") — [GitHub](https://github.com/Stirling-Tools/Stirling-PDF), [Docs](https://docs.stirlingpdf.com/)
- Caveats: open-core licence; the free plan has "credits" (what uses them, and whether Local Only desktop use does, was not found); the README says "50+ PDF tools" while the pricing page says "60+" (conflicting counts). Windows on ARM may need the WebView2 Runtime — [Desktop install](https://docs.stirlingpdf.com/Desktop/Install/)
- Beginner difficulty: 1–2/5.

#### TOP 2. Excalidraw: excalidraw/excalidraw
- URL: https://github.com/excalidraw/excalidraw. "Virtual whiteboard for sketching hand-drawn like diagrams"; "Collaborative and end-to-end encrypted"; "Local-first support (autosaves to the browser)"; exports PNG, SVG and clipboard, and saves an open JSON format — [GitHub](https://github.com/excalidraw/excalidraw)
- What it does: a whiteboard in the browser for flowcharts, process maps and quick diagrams, with live drawing together.
- Problem it solves for this viewer: explaining a workflow, website plan or invoice process to a client or colleague without buying Miro or Visio.
- Replaces: paid whiteboard and diagram tools (prices not checked).
- Stars ~134.9k (read 2026-10-30), the most-starred repo in either theme. Licence MIT. No archive notice — [GitHub](https://github.com/excalidraw/excalidraw)
- Latest tagged release: v0.18.1 (21 Apr, Latest; year not shown), v0.18.0 (2025-03-11), v0.17.3 (2024-02-09). These are tags of the developer package; the app at excalidraw.com is built from this repo ("Its source code is in this repository") — [Releases](https://github.com/excalidraw/excalidraw/releases), [GitHub](https://github.com/excalidraw/excalidraw)
- Install: none. Open excalidraw.com; "The app hosted at excalidraw.com is a minimal showcase of what you can build with Excalidraw" — [GitHub](https://github.com/excalidraw/excalidraw)
- First use [UI labels not page-verified]: (1) Open excalidraw.com on the laptop. (2) Draw boxes and arrows from the toolbar. (3) Click Share and start a live collaboration session; send the link, and the client draws on the same board.
- Hook (verifiable): live collaboration is end-to-end encrypted, and the repo has ~135k stars — [GitHub](https://github.com/excalidraw/excalidraw)
- Caveats: autosave lives in the browser, so clearing browser data can lose drawings that were not saved to a file (see Inferences); Excalidraw+ is the paid tier (price not checked).
- Beginner difficulty: 1/5.

#### TOP 3. Invoice Ninja: invoiceninja/invoiceninja
- URL: https://github.com/invoiceninja/invoiceninja. "A source-available invoice, quote, project and time-tracking app built with Laravel" — [GitHub](https://github.com/invoiceninja/invoiceninja)
- What it does: professional invoices and quotes, recurring invoices, expenses, a client portal and online payments.
- Problem it solves for this viewer: invoicing foreign clients from Word or Excel, chasing unpaid invoices, and handling several currencies.
- Replaces: paid invoicing SaaS such as FreshBooks or QuickBooks invoicing (prices not checked).
- Stars ~10.4k (read 2026-10-30). **Licence: "released under the Elastic License"**, which is source-available and not OSI open source; flag it on screen. No archive notice — [GitHub](https://github.com/invoiceninja/invoiceninja)
- Latest release: v5.13.51 (30 Oct, Latest), v5.13.50 (21 Oct), v5.13.49 (18 Oct). The year is not shown — [Releases](https://github.com/invoiceninja/invoiceninja/releases)
- Use without self-hosting: the hosted SaaS, which the README says takes under 5 minutes to set up. There are desktop apps for Windows, macOS and Linux, and mobile apps for iPhone, Android and F-Droid — [GitHub](https://github.com/invoiceninja/invoiceninja)
- Free plan: "5 Clients + Unlimited Invoicing", 11 invoice templates, "Brand Invoices with Your Logo", online payments, recurring invoices, projects, vendor and expense tracking, client portal, automatic currency conversion. Removing Invoice Ninja's branding is not included. Pro is $14/month or "$140 billed annually"; Enterprise runs "from $18/month for 1–2 users" — [Pricing](https://invoiceninja.com/pricing-plans/)
- First use [UI not page-verified]: (1) Sign up for the hosted version and add your logo and currency. (2) Add a client, then New Invoice and add line items. (3) Email it or share the client-portal link; the status changes when the client views or pays it.
- Hook (verifiable): unlimited invoices free for up to 5 clients — [Pricing](https://invoiceninja.com/pricing-plans/)
- Caveats: Elastic License; the 5-client cap; Invoice Ninja branding on the free plan; self-hosting needs PHP/Laravel. Which payment gateways work for Bangladeshi accounts was not checked.
- Beginner difficulty: 2/5.

#### TOP 4. Plane: makeplane/plane
- URL: https://github.com/makeplane/plane. "Open-source Jira, Linear, Monday, and ClickUp alternative"; the README calls a "free account on Plane Cloud" the fastest way to start — [GitHub](https://github.com/makeplane/plane)
- What it does: task and project boards, sprints ("cycles"), modules and pages for a small team.
- Problem it solves for this viewer: an agency or office team tracking work in WhatsApp groups and Excel; a freelancer juggling several client projects.
- Replaces: Jira, ClickUp and Monday paid seats.
- Stars ~61.7k (read 2026-10-30). Licence AGPL-3.0. No archive notice — [GitHub](https://github.com/makeplane/plane)
- Latest release: v1.4.3 (28 Oct, Latest), after v1.4.3-rc2 (23 Oct) and rc1 (06 Oct). The year is not shown — [Releases](https://github.com/makeplane/plane/releases)
- Free cloud: "12 users"; projects and work items, cycles and modules, layouts and views, intake, estimates and pages are included. Wiki, dashboards, time tracking and integrations are not. Pro costs "$8/user/mo (monthly) · $6/user/mo (annually)" — [Pricing](https://plane.so/pricing)
- First use [UI not page-verified]: (1) Sign up for Plane Cloud and create a workspace. (2) Create a project and add work items. (3) Invite teammates and drag items across the board.
- Hook (verifiable): a team of up to 12 people uses it free on the cloud — [Pricing](https://plane.so/pricing)
- Caveats: self-hosting is Docker/Kubernetes (developers.plane.so) — [GitHub](https://github.com/makeplane/plane); the free tier has no time tracking or integrations.
- Beginner difficulty: 2/5.

#### TOP 5. Joplin: laurent22/joplin
- URL: https://github.com/laurent22/joplin. "the privacy-focused note taking app with sync capabilities for Windows, macOS, Linux, Android and iOS"; notes sync with "end-to-end encryption with various cloud services including Nextcloud, Dropbox, OneDrive and Joplin Cloud"; it imports Evernote exports with formatting, resources and metadata (converted to Markdown) — [GitHub](https://github.com/laurent22/joplin)
- What it does: notes, to-dos and notebooks on PC and phone, synced through a cloud you already have.
- Problem it solves for this viewer: office notes, client briefs and meeting minutes scattered across WhatsApp, paper and email; moving off Evernote's limits.
- Replaces: Evernote paid tiers and Notion paid tiers (prices not checked).
- Stars ~56.9k (read 2026-10-30). No archive notice — [GitHub](https://github.com/laurent22/joplin). Licence: "All code in this repository is licensed under the AGPL-3.0-or-later License"; subfolders with their own LICENSE file (for example packages/server) are under that file instead — [LICENSE](https://github.com/laurent22/joplin/blob/dev/LICENSE)
- Latest release: **v3.7.22, 28 Oct 2026** (Latest); v3.7.21 on 25 Sep — [Releases](https://github.com/laurent22/joplin/releases)
- Install: the Windows installer "Joplin-Setup-3.7.22.exe", plus Google Play and the App Store. Joplin Cloud is offered with a link to its plans (price not shown) — [Download](https://joplinapp.org/download/)
- First use [UI not page-verified]: (1) Install it and create a notebook and a note. (2) In Synchronisation settings, pick OneDrive or Dropbox and turn on encryption. (3) Install the phone app with the same sync target, and the notes appear there.
- Hook (verifiable): it imports Evernote exports, and syncs end-to-end encrypted through your own OneDrive or Dropbox — [GitHub](https://github.com/laurent22/joplin)
- Caveats: Joplin Cloud is a paid service (price not checked), but free sync works through your own cloud.
- Beginner difficulty: 2/5.

#### BACKUP 1. BentoPDF: alam00000/bentopdf
- URL: https://github.com/alam00000/bentopdf. "powerful, privacy-first, client-side PDF toolkit that is self-hostable"; "Your files are never uploaded to a server, guaranteeing 100% privacy"; hosted at bentopdf.com; the docs say "50+ tools" — [GitHub](https://github.com/alam00000/bentopdf)
- Problem and replacement: the same as Stirling-PDF, but with nothing to install. Use one of the two per video, not both.
- Stars ~16.2k (read 2026-10-30). AGPL-3.0, with a commercial licence ($79 lifetime) for proprietary use. No archive notice — [GitHub](https://github.com/alam00000/bentopdf)
- Latest release: v2.8.10 (19 Oct, Latest), v2.8.9 (18 Oct), v2.8.8 (29 Aug). The year is not shown — [Releases](https://github.com/alam00000/bentopdf/releases)
- First use [UI not page-verified]: open bentopdf.com, pick a tool, drop the file in, and download the result.
- Hook (verifiable): "Your files are never uploaded to a server" — [GitHub](https://github.com/alam00000/bentopdf)
- Caveats: the page itself says some code (WASM modules) loads from the jsDelivr CDN, and the Digital Signature tool may need a CORS proxy. There is no desktop app — [GitHub](https://github.com/alam00000/bentopdf)
- Beginner difficulty: 1/5.

#### BACKUP 2. Documenso: documenso/documenso
- URL: https://github.com/documenso/documenso. "The Open Source DocuSign Alternative"; you can self-host it or sign up at documenso.com — [GitHub](https://github.com/documenso/documenso)
- What it does: send a contract or NDA and the client signs it online; everyone gets the signed PDF.
- Problem it solves for this viewer: printing, signing, scanning and emailing contracts back and forth with clients abroad.
- Replaces: DocuSign and similar paid e-signature tools.
- Stars ~15.6k (read 2026-10-30). AGPL-3.0. No archive notice — [GitHub](https://github.com/documenso/documenso)
- Free plan: "Free forever", "5 documents per month", "Up to 10 recipients per document", no card required. Individual is $25/month or $300 a year; Teams is $40/month or $480 a year — [Pricing](https://documenso.com/pricing)
- First use [UI not page-verified]: upload a PDF, add the signer's email, drag a signature field onto the page and send.
- Hook (verifiable): 5 documents a month free, forever — [Pricing](https://documenso.com/pricing)
- Caveats: self-hosting needs Docker or Node.js v24 with PostgreSQL — [GitHub](https://github.com/documenso/documenso). Whether these signatures count legally in Bangladesh was not checked.
- Beginner difficulty: 1–2/5.

#### Rank 8. AFFiNE / AppFlowy (Notion-style workspaces)
- AFFiNE: 74.0k★. Community Edition "free for self-host under the MIT license"; an Enterprise Edition is "yet to be published". It calls itself "a privacy-focused, local-first, open-source, and ready-to-use alternative for Notion & Miro", with a web app (app.affine.pro) and downloads at affine.pro/download. Whether a free cloud plan exists is not stated — [GitHub](https://github.com/toeverything/AFFiNE)
- AppFlowy: 78.0k★, AGPL-3.0, "The leading open source Notion alternative". Desktop builds for Windows, macOS and Linux are on GitHub Releases; Android needs 10 or above ("ARMv7 is not supported"); iOS is iPhone only — [GitHub](https://github.com/AppFlowy-IO/AppFlowy)

### Inferences
- The Top 5 gives one tool per office job (PDF, diagrams, invoices, team tasks, notes), and every one has an official no-server route: a desktop app, a web app or a free hosted plan.
- For this audience, Stirling-PDF's desktop app is the strongest privacy-plus-savings item, because office PDFs (salary sheets, bank statements, NID scans) are exactly what people now upload to random PDF websites.
- Excalidraw's browser autosave can disappear if browser data is cleared, so the video should say "save to file". This follows from "autosaves to the browser" and is not a documented warning.
- Invoice Ninja is the best invoice option for someone who cannot self-host, but say "source-available (Elastic License)" rather than "open source" to stay accurate.
- If the series wants an accounting tool for the accountant persona specifically, every candidate seen (Akaunting = BSL, ERPNext = Docker or a paid cloud, InvoiceShelf = self-host alpha) fails the "10 minutes, no server" test. Invoice Ninja covers the freelancer invoicing need.

### Gaps
- Documenso's latest release date was not captured (the releases page was not fetched).
- The year is not shown on GitHub for the Invoice Ninja, Plane, BentoPDF and Excalidraw release dates. Excalidraw's last package tag (v0.18.1, 21 Apr) is the weakest "recent release" signal in the set, although its hosted app is the main product.
- Stirling-PDF: what uses up the "1,000 monthly credits" on the free plan, and the terms of its proprietary folders, were not found.
- Formbricks, HeyForm, Docmost, Logseq and Focalboard were not checked this session; they are left out rather than guessed.
- Plane's exact sign-up URL and Invoice Ninja's hosted app URL were not captured; use the links on plane.so and invoiceninja.com.
- Prices of the paid products replaced (Acrobat, Miro, FreshBooks, Jira, DocuSign) were not checked; only the open tools' own paid tiers are cited.

---

## Q3. Which give the most money saved or risk avoided for the least setup?

### Takeaway
Least setup with the biggest benefit: **uBO / uBO Lite** (one click, blocks malware and scam sites), **Bitwarden** (free tier with unlimited devices; the paid plan is $19.80 a year), **Ente Auth** (prevents account takeover and lockout), **Excalidraw** (no install) and **Stirling-PDF** (free plan, offline desktop). The biggest measurable cash savings against each tool's own paid tier: **Plane** (a 12-user team avoids $6–8 per user per month), **Documenso** (avoids $300 a year), **Invoice Ninja** (avoids $140 a year).

### Cited Findings
- Bitwarden: free = "Unlimited devices, unlimited passwords"; Premium = "$19.80" a year — [Bitwarden pricing](https://bitwarden.com/pricing/)
- uBO: a "wide-spectrum content blocker" against trackers, coin miners, popups and malware sites; "No donations sought" — [README](https://github.com/gorhill/uBlock/blob/master/README.md)
- Ente Auth: "free, and will remain free forever" — [GitHub](https://github.com/ente/ente)
- Cryptomator: desktop features "absolutely free"; mobile full access is a one-time €29.99 (€19.99 sale) — [Cryptomator pricing](https://cryptomator.org/pricing/)
- Stirling-PDF Free plan: "$0/month", 60+ tools, 1,000 monthly credits; Team $99/month — [Stirling pricing](https://stirling.com/pricing)
- Invoice Ninja Free: "5 Clients + Unlimited Invoicing"; Pro "$140 billed annually" — [Invoice Ninja pricing](https://invoiceninja.com/pricing-plans/)
- Plane Free: "12 users"; Pro "$8/user/mo (monthly) · $6/user/mo (annually)" — [Plane pricing](https://plane.so/pricing)
- Documenso Free: "5 documents per month"; Individual "$300 billed yearly" — [Documenso pricing](https://documenso.com/pricing)

### Inferences
- Plane: 12 users × $6 × 12 months = $864 a year at Plane's own annual Pro price (or $1,152 at the monthly price). That is the largest "your own paid tier avoided" figure in the set, but it only applies to teams.
- For a solo Bangladeshi freelancer, the realistic savings are Invoice Ninja (~$140 a year), Documenso (~$300 a year if 5 documents a month are enough) and Bitwarden (~$19.80 a year; the free tier is enough for most people). These compare each tool with its own paid tier, not with competitors.
- Risk avoided matters more in Theme I than money. The strongest "risk for minutes" items are uBO/uBO Lite (one install), Ente Auth (2FA on Facebook, Gmail and Upwork) and Bitwarden (unique passwords).

### Gaps
- No sourced prices for the competing paid products (LastPass, 1Password, Acrobat, Miro, FreshBooks, Jira, DocuSign), so savings against competitors cannot be stated.
- Local BDT prices or regional pricing were not checked (Cryptomator notes that checkout prices vary by region — [pricing](https://cryptomator.org/pricing/)).

---

## Q4. Which are actively maintained in late 2026?

### Takeaway
None of the 16 fact-sheet repos is archived. Releases in October 2026 (year confirmed on the page): Cryptomator, Bitwarden, Joplin, Stirling-PDF, VeraCrypt (macOS/Linux) and KeePassXC. October releases where GitHub shows no year: uBO pre-releases, Invoice Ninja, Plane, BentoPDF and Ente Auth. The weakest release signals are Excalidraw's last package tag (21 Apr), Aegis (06 Sep) and PrivateBin/Documenso (dates not captured).

### Cited Findings
- Cryptomator 1.19.6, 30 Oct 2026 — [Releases](https://github.com/cryptomator/cryptomator/releases)
- Invoice Ninja v5.13.51, 30 Oct (year not shown) — [Releases](https://github.com/invoiceninja/invoiceninja/releases)
- Bitwarden desktop-v2026.10.2 and browser-v2026.10.1, 29 Oct — [Releases](https://github.com/bitwarden/clients/releases)
- uBlock Origin 1.75.1rc3, 29 Oct (pre-release); stable 1.75.0, 16 Sep (year not shown) — [Releases](https://github.com/gorhill/uBlock/releases)
- Plane v1.4.3, 28 Oct (year not shown) — [Releases](https://github.com/makeplane/plane/releases)
- Joplin v3.7.22, 28 Oct 2026 — [Releases](https://github.com/laurent22/joplin/releases)
- Stirling-PDF v3.2.2, 24 Oct 2026 — [Releases](https://github.com/Stirling-Tools/Stirling-PDF/releases)
- VeraCrypt 1.26.30, 24 Oct 2026 (Windows installers withdrawn; Windows is on 1.26.29 of 9 Jun 2026) — [Releases](https://github.com/veracrypt/VeraCrypt/releases), [Downloads](https://veracrypt.jp/en/Downloads.html)
- KeePassXC 2.8.0, 21 Oct 2026 — [Releases](https://github.com/keepassxreboot/keepassxc/releases)
- BentoPDF v2.8.10, 19 Oct (year not shown) — [Releases](https://github.com/alam00000/bentopdf/releases)
- Ente Auth auth-v4.4.26, 19 Oct (year not shown) — [Auth releases](https://github.com/ente/ente/releases?q=tag%3Aauth-v4)
- Aegis v3.4.3, 06 Sep (year not shown) — [Releases](https://github.com/beemdevelopment/Aegis/releases)
- Excalidraw v0.18.1, 21 Apr (year not shown); v0.18.0 on 2025-03-11 — [Releases](https://github.com/excalidraw/excalidraw/releases)
- PrivateBin: README "Current version: 2.1.0" (no date) — [GitHub](https://github.com/PrivateBin/PrivateBin)
- Change in ownership or licence to flag: Cal.com moved its production code to a private repo; the public repo is now calcom/cal.diy (MIT, self-host only) — [GitHub](https://github.com/calcom/cal.com), [Cal.com blog](https://cal.com/blog/cal-diy-open-source-to-closed-source)

### Inferences
- Version numbers like 2026.10.x (Bitwarden) and the run of releases a few days apart (Invoice Ninja 18, 21 and 30 Oct; BentoPDF 18 and 19 Oct) strongly suggest that the "year not shown" October dates are October 2026.
- Excalidraw's GitHub "release" is the developer package. Its hosted app is the product viewers use, so a slow package cadence does not by itself mean it is abandoned. Still, this is the one place where "actively maintained" rests on indirect evidence.

### Gaps
- Commit dates (last commit) were not captured for Excalidraw, PrivateBin, Documenso or Aegis; a final api.github.com check should confirm `pushed_at` for these four.

---

## Q5. Which are usable without self-hosting?

### Takeaway
All 7 picks in Theme I and all 7 in Theme J run without a server: a store install, a Windows installer, a web app or an official free hosted tier. Tools that need Docker or a server, and so are wrong for this audience as a "10-minute" tip: Vaultwarden, AdGuard Home, Pi-hole, Paperless-ngx, cal.diy, InvoiceShelf, Akaunting, ERPNext (or paid Frappe Cloud) and self-hosted Twenty.

### Cited Findings
No server needed:
- Bitwarden: Windows installer, Microsoft Store, browser stores, phone apps, free cloud — [Download](https://bitwarden.com/download/), [Pricing](https://bitwarden.com/pricing/)
- uBO: Firefox and Edge add-ons; uBO Lite on the Chrome Web Store — [uBlock](https://github.com/gorhill/uBlock), [uBOL-home](https://github.com/uBlockOrigin/uBOL-home)
- Ente Auth: Windows EXE, phone apps, web, or no account at all — [ente.com/auth](https://ente.com/auth)
- Cryptomator: free desktop app — [Pricing](https://cryptomator.org/pricing/)
- VeraCrypt: Windows EXE, MSI or Portable — [Downloads](https://veracrypt.jp/en/Downloads.html)
- KeePassXC: MSI, ZIP, Microsoft Store, winget — [Download](https://keepassxc.org/download/)
- PrivateBin: 187 public instances, e.g. privatebin.net — [Directory](https://privatebin.info/directory/)
- Stirling-PDF: Windows desktop app ("Continue without signing in", "Works offline") and a browser cloud version — [Desktop install](https://docs.stirlingpdf.com/Desktop/Install/), [Docs](https://docs.stirlingpdf.com/)
- Excalidraw: excalidraw.com — [GitHub](https://github.com/excalidraw/excalidraw)
- Invoice Ninja: hosted free plan plus Windows, Android and iOS apps — [Pricing](https://invoiceninja.com/pricing-plans/), [GitHub](https://github.com/invoiceninja/invoiceninja)
- Plane: free Plane Cloud — [Pricing](https://plane.so/pricing)
- Joplin: Windows installer plus phone apps — [Download](https://joplinapp.org/download/)
- BentoPDF: bentopdf.com, runs in the browser — [GitHub](https://github.com/alam00000/bentopdf)
- Documenso: free hosted plan — [Pricing](https://documenso.com/pricing)

Server or Docker needed:
- Vaultwarden: docker run, plus HTTPS required — [GitHub](https://github.com/dani-garcia/vaultwarden)
- AdGuard Home: install script for Linux/macOS/BSD — [GitHub](https://github.com/AdguardTeam/AdGuardHome)
- Pi-hole: "your own Linux hardware" — [GitHub](https://github.com/pi-hole/pi-hole)
- Paperless-ngx: docker compose — [GitHub](https://github.com/paperless-ngx/paperless-ngx)
- cal.diy: "There is no hosted/managed version" — [GitHub](https://github.com/calcom/cal.com)
- InvoiceShelf and Akaunting: self-host only — [InvoiceShelf](https://github.com/InvoiceShelf/InvoiceShelf), [Akaunting](https://github.com/akaunting/akaunting)
- ERPNext: Docker demo is "Disposable demo only" — [GitHub](https://github.com/frappe/erpnext)

### Inferences
- **Belongs elsewhere (cross-fits for the other researchers):** Aegis and 2FAS Android → the Android phone apps theme (Aegis is Android only); LocalSend and NewPipe → Android theme (as assigned, not researched here); PDF and office desktop tools that are really Windows utilities (for example ONLYOFFICE or LibreOffice, not researched) → the Windows PC utilities theme. Excalidraw could also suit the student/career theme, and Joplin the student theme; keep them here because the business angle (client diagrams, office notes) is stronger.
- Self-hosting security (for any later "advanced" video): Paperless-ngx stores documents "in clear text without encryption" and must not run on an untrusted host — [GitHub](https://github.com/paperless-ngx/paperless-ngx); Vaultwarden needs HTTPS set up correctly — [GitHub](https://github.com/dani-garcia/vaultwarden). Both are risky for beginners who would open them to the internet.

### Gaps
- Whether Twenty's cloud (twenty.com) or AFFiNE's cloud has a lasting free tier was not verified.
- RAM use of the desktop apps (Stirling-PDF, Joplin, AppFlowy, AFFiNE) on an 8 GB laptop was not measured or sourced.
