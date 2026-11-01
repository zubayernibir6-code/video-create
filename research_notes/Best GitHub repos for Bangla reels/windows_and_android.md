# Themes G and H: Windows-laptop repos and Android-phone repos for "৫টা GitHub রিপো"

Scope: Theme G, "Make your Windows laptop faster and smarter" (old 8 GB Windows 10/11 laptops, non-technical viewers), and Theme H, "Free open-source apps for your Android phone" (mid-range phones, costly mobile data). Everything here was read on 2026-10-30 from github.com pages, release Atom feeds (`/releases.atom`, used to get full dates with the year), `expanded_assets` pages (used to get exact file names), raw READMEs/config files, official docs and F-Droid. api.github.com was never called. Star counts are the figures shown on each repo page today. "Archived: no" means the page showed no archive banner. Difficulty (1 = tap and done, 5 = needs a terminal or developer settings) is my own rating.

---

## Theme G: ranked list, final TOP 5 + 2 backups, with fact sheets

### Takeaway
For an old 8 GB laptop and a non-technical viewer, the best five-repo video is **Win11Debloat → Bulk Crap Uninstaller → WinDirStat → PowerToys → NanaZip**. That runs: remove the ads and bloat, remove unused programs, find what fills the C: drive, add new powers, replace the WinRAR nag. Backups: **Ventoy** (make a USB stick for a fresh Windows install) and **winutil**, which is a swap-in for #1, not an addition (two debloat scripts in one video would repeat). All seven have had a release in the last ~2 months.

### Ranked 8 (Theme G)
1. Raphire/Win11Debloat: biggest visible change, has a revert path. TOP 5
2. Klocman/Bulk-Crap-Uninstaller: bulk-remove unused programs and leftovers. TOP 5
3. windirstat/windirstat: see what is filling the disk. TOP 5
4. microsoft/PowerToys: 31 utilities, a Microsoft project. TOP 5
5. M2Team/NanaZip: modern 7-Zip from the Microsoft Store. TOP 5
6. ventoy/Ventoy: bootable USB for reinstalling Windows. BACKUP
7. ChrisTitusTech/winutil: more powerful and riskier debloat/tweak tool. BACKUP (swap for #1)
8. Flow-Launcher/Flow.Launcher: Alt+Space app/file search (overlaps PowerToys' own launcher)

### Cited Findings

#### G1. Raphire/Win11Debloat (TOP 5 #1)
- URL: https://github.com/Raphire/Win11Debloat
- **What it does:** a PowerShell script with a setup wizard that removes preinstalled apps and turns off Windows settings you pick. **Problem it solves for this viewer:** a slow, cluttered Windows with ads, suggestions and preinstalled junk. "Win11Debloat works for both Windows 10 and Windows 11." — [README](https://github.com/Raphire/Win11Debloat)
- **Stars:** ~61.3k (read 2026-10-30). **Licence:** MIT. **Archived:** no. — [repo page](https://github.com/Raphire/Win11Debloat)
- **Latest release:** 2026.08.24 (published 24 Aug 2026; the tag is the date). Notes: registry backup safety improved, restore now rejects mismatches, WinGet-uninstall timeout added, `ForceRemoveEdge` fixed, `NoRestartExplorer` deprecated in favour of `SkipExplorerRestart`. — [Releases](https://github.com/Raphire/Win11Debloat/releases)
- **Install (exact, from the wiki):** "Open PowerShell or Terminal, preferably as an administrator," paste `& ([scriptblock]::Create((irm "https://debloat.raphi.re/")))`, wait for the download, then follow the on-screen instructions. — [wiki: How-To-Use](https://github.com/Raphire/Win11Debloat/wiki/How-To-Use). The traditional method needs you to "Accept the Windows UAC prompt to run the script as administrator." — [README](https://raw.githubusercontent.com/Raphire/Win11Debloat/master/README.md)
- **First use:** (1) Admin PowerShell → paste the command above. (2) In the setup wizard, "select apps to remove, toggle system settings, and choose a user account." (3) After you select your changes, you can "choose to create a system restore point", then apply. — [wiki: How-To-Use](https://github.com/Raphire/Win11Debloat/wiki/How-To-Use)
- **Hook fact:** "Starting with release 2026.05.10, Win11Debloat creates a backup of your system registry settings before applying any changes." Restore is under Options > Restore backup > Restore Registry Backup. — [wiki: Reverting Changes](https://github.com/Raphire/Win11Debloat/wiki/Reverting-Changes)
- **Caveats (safety):** "Great care went into making sure this script does not unintentionally break any OS functionality, but use at your own risk!" — [README](https://github.com/Raphire/Win11Debloat). The registry backup "does not restore any applications that were uninstalled by the script". "Nearly all" removed apps can be reinstalled from the Microsoft Store, but **the Microsoft Store itself** and `XboxSpeechToTextOverlay` are not easy to get back. A restore point "will however remove apps, drivers, and updates installed after the restore point was made." — [wiki: Reverting Changes](https://github.com/Raphire/Win11Debloat/wiki/Reverting-Changes)
- **Difficulty:** 3/5 (a terminal paste plus many choices).

#### G2. Klocman/Bulk-Crap-Uninstaller (BCUninstaller) (TOP 5 #2)
- URL: https://github.com/Klocman/Bulk-Crap-Uninstaller
- **What it does:** lists every installed program and removes many at once, then cleans what they leave behind. **Problem it solves:** a laptop full of old trial software, toolbars and games that the normal "Apps" page removes one slow click at a time. "It can clean up leftovers, detect orphaned applications, run uninstallers according to premade lists, and much more!" It is "fully compatible with Windows Store Apps, Steam, Windows Features" and handles NSIS, InnoSetup and Msiexec uninstallers. — [README](https://github.com/Klocman/Bulk-Crap-Uninstaller)
- **Stars:** ~22.1k (read 2026-10-30). **Licence:** Apache-2.0. **Archived:** no. — [repo page](https://github.com/Klocman/Bulk-Crap-Uninstaller)
- **Latest release:** v6.3, published 2026-09-07 (earlier: v6.2 2026-06-09, v6.1 2026-03-06, v6.0 2026-03-05). — [releases.atom](https://github.com/Klocman/Bulk-Crap-Uninstaller/releases.atom)
- **Install (exact):** "You can get the latest version from the releases page" (mirrors: SourceForge, FossHub, dAppCDN). — [README](https://github.com/Klocman/Bulk-Crap-Uninstaller). v6.3 files: `BCUninstaller_6.3.0_setup.exe` (8.99 MB), `BCUninstaller_6.3.0_portable.7z` (100 MB), `BCUninstaller_6.3.0_net8.0-windows10.0.18362.0.zip` (11.8 MB), `Localisation_Pack_6.3.0.zip`. — [v6.3 release](https://github.com/Klocman/Bulk-Crap-Uninstaller/releases/tag/v6.3). Requirements for v6: "Earliest supported OS: Windows 10 (may work on Windows 7)" and ".NET 8 desktop runtime (not needed for portable)." The "Portable" build "does not require the .NET runtime to run." — [README](https://github.com/Klocman/Bulk-Crap-Uninstaller). The README does not mention winget.
- **First use (UI flow from the README's feature list; exact button labels not verified):** (1) Run the setup .exe. (2) BCU lists all programs, including Store apps and Steam games. (3) Tick the unused ones → uninstall → let it look for leftovers.
- **Hook fact:** one tool removes desktop programs, Microsoft Store apps, Steam games and Windows Features. — [README](https://github.com/Klocman/Bulk-Crap-Uninstaller)
- **Caveats:** the leftover cleaner deletes files and registry entries, so viewers should remove only programs they recognise (inference; the README gives no specific warning). The setup is the small download (8.99 MB). The portable 7z is 100 MB, which costs data. — [v6.3 release](https://github.com/Klocman/Bulk-Crap-Uninstaller/releases/tag/v6.3)
- **Difficulty:** 2/5.

#### G3. windirstat/windirstat (TOP 5 #3)
- URL: https://github.com/windirstat/windirstat
- **What it does:** "Windows disk usage analyzer and cleanup tool with interactive treemaps." It also finds large and duplicate files. **Problem it solves:** a C: drive that is red and full, where nobody knows what is taking the space. — [README](https://github.com/windirstat/windirstat)
- **Stars:** ~4.4k (read 2026-10-30). **Licence:** GPL-3.0 ("GPL v3 or later", so SPDX GPL-3.0-or-later). **Archived:** no (2,188 commits). — [repo page](https://github.com/windirstat/windirstat)
- **Latest release:** WinDirStat 2.9.3, 2026-10-11 (2.9.2 on 2026-10-08, 2.9.0 on 2026-09-26, with betas almost weekly in Sept 2026). — [releases.atom](https://github.com/windirstat/windirstat/releases.atom)
- **Install (exact):** Microsoft Store (linked in the README); `winget install -e --id WinDirStat.WinDirStat`; GitHub Releases `WinDirStat-x64.msi`. "If you are not sure which file to choose, download the 64-bit MSI installer." Portable builds are `WinDirStat.zip` / `.7z`. Supports Windows 7 through Windows 11. Faster full-drive scanning uses "File > Run Elevated". — [README](https://github.com/windirstat/windirstat)
- **First use (labels partly inferred):** (1) Install from the Store or winget. (2) Choose drive C: and scan. (3) The biggest coloured blocks in the treemap are the biggest files. Click one to see where it is.
- **Hook fact:** the 2.x line can also recover deleted files from local NTFS, exFAT and FAT drives (this needs admin), and shows sunbursts and flame graphs. — [README](https://github.com/windirstat/windirstat)
- **Caveats:** use it to find big files, then delete only your own files (Downloads, old videos), never files inside `C:\Windows` or `Program Files` (inference, not stated by the repo).
- **Difficulty:** 1–2/5.

#### G4. microsoft/PowerToys (TOP 5 #4)
- URL: https://github.com/microsoft/PowerToys
- **What it does:** Microsoft's free set of 31 extra Windows utilities (Text Extractor, FancyZones, Awake, Peek, PowerRename, Image Resizer, Always on Top, Command Palette, ZoomIt and others). **Problem it solves:** everyday chores (copying text from an image or PDF screenshot, keeping a window on top, batch-renaming or resizing photos) that would otherwise need extra paid apps. — [README](https://github.com/microsoft/PowerToys)
- **Stars:** ~140.3k (read 2026-10-30). **Licence:** MIT. **Archived:** no. — [repo page](https://github.com/microsoft/PowerToys)
- **Latest release:** v0.102.3001.0 ("Latest"), 2026-10-27, a hotfix for File Locksmith and Quick Accent crashes. Dev previews v0.103.x came out 2026-10-28/29. — [releases.atom](https://github.com/microsoft/PowerToys/releases.atom), [Releases](https://github.com/microsoft/PowerToys/releases)
- **Install (exact):** Microsoft Store (aka.ms/getPowertoys), or `winget install --id Microsoft.PowerToys --source winget`, or GitHub `PowerToysSetup-0.##.#-x64.exe`. "Per User" installs to `%userprofile%\AppData\Local\Programs`. — [learn.microsoft.com install](https://learn.microsoft.com/en-us/windows/powertoys/install). Current files: `PowerToysUserSetup-0.102.3001.0-x64.exe`, `PowerToysSetup-0.102.3001.0-x64.exe` (+ arm64). The README says "x64 per-user" is right "for most devices". — [Releases](https://github.com/microsoft/PowerToys/releases), [README](https://github.com/microsoft/PowerToys). **Requirements:** "Windows 11 or Windows 10 version 2004 (20H1 / build 19041) or newer"; "64-bit processor: x64 or ARM64"; the WebView2 Runtime is installed by the setup. — [learn.microsoft.com install](https://learn.microsoft.com/en-us/windows/powertoys/install)
- **First use:** (1) Install. In Settings → Home you can "enable or disable individual utilities". (2) Press **Win+Shift+T**, then drag a box over any text on screen (an image, a video, a scanned page). (3) "The text will be saved to your clipboard." Paste it anywhere. — [install page](https://learn.microsoft.com/en-us/windows/powertoys/install), [Text Extractor](https://learn.microsoft.com/en-us/windows/powertoys/text-extractor)
- **Hook fact:** Text Extractor copies text "from anywhere on your Windows screen, including inside images or videos". It is based on Joe Finney's open-source Text Grab. — [Text Extractor docs](https://learn.microsoft.com/en-us/windows/powertoys/text-extractor)
- **Caveats:** Text Extractor "can only recognize languages that have the OCR language pack installed". The docs page does not list Bengali (check with the page's PowerShell command), so promise English OCR only. — [Text Extractor docs](https://learn.microsoft.com/en-us/windows/powertoys/text-extractor). On an 8 GB laptop, turn on only the utilities you use (inference; I found no published RAM figure). 32-bit Windows is not supported (64-bit only, per requirements).
- **Difficulty:** 2/5.

#### G5. M2Team/NanaZip (TOP 5 #5)
- URL: https://github.com/M2Team/NanaZip
- **What it does:** "The 7-Zip derivative intended for the modern Windows experience": opens and makes zip/7z/rar and more, and appears in the Windows 10/11 File Explorer right-click menu. It has dark mode, Mica, and extra codecs (Zstandard, Brotli, LZ4). **Problem it solves:** the "WinRAR trial expired" nag, and 7-Zip hiding under "Show more options" on Windows 11. — [repo page](https://github.com/M2Team/NanaZip)
- **Stars:** ~16.1k (read 2026-10-30). **Licence:** MIT for NanaZip's own code. 7-Zip-derived parts use the 7-Zip License (mainly LGPL-2.1-or-later, with some BSD-3-Clause and the unRAR restriction). The icons are CC BY-ND 4.0. — [License.md](https://github.com/M2Team/NanaZip/blob/main/License.md). **Archived:** no.
- **Latest release:** NanaZip 7.0 (2610.2, build 7.0.1882.0), published 26 Oct. The year 2026 comes from the "2610" version scheme. winget's newest folder is 7.0.1882.0. — [Releases](https://github.com/M2Team/NanaZip/releases), [winget-pkgs](https://github.com/microsoft/winget-pkgs/tree/master/manifests/m/M2Team/NanaZip)
- **Install (exact):** Microsoft Store stable https://www.microsoft.com/store/apps/9N8G7TSCL18R (the preview channel is 9NZL0LRP1BNL). GitHub: "the MSIX package and the corresponding XML license file" (`NanaZip_7.0.1882.0.msixbundle` + `NanaZip_7.0.1882.0.xml`). — [README](https://github.com/M2Team/NanaZip), [Releases](https://github.com/M2Team/NanaZip/releases). The winget id is M2Team.NanaZip, read from the winget-pkgs folder path (not from the manifest text). — [winget-pkgs](https://github.com/microsoft/winget-pkgs/tree/master/manifests/m/M2Team/NanaZip). **Requirements:** "Windows 10, version 2004 (Build 19041) or later", x64 or ARM64 only. — [README](https://github.com/M2Team/NanaZip)
- **First use:** (1) Install from the Microsoft Store (one click, no admin). (2) Right-click any .zip/.rar → NanaZip → Extract (it supports the File Explorer context menu). — [README](https://github.com/M2Team/NanaZip)
- **Hook fact:** NanaZip enables Control Flow Guard on all its binaries ("Provide additional security mitigations"), a hardening plain 7-Zip doesn't advertise. — [repo page](https://github.com/M2Team/NanaZip)
- **Caveats:** none on safety. It will not install on 32-bit Windows or on Windows 10 builds older than 2004. — [README](https://github.com/M2Team/NanaZip)
- **Difficulty:** 1/5.

#### G6. ventoy/Ventoy (BACKUP)
- URL: https://github.com/ventoy/Ventoy
- **What it does:** turns a USB stick into a boot drive where you just copy ISO files (Windows, Linux) and pick one at boot. **Problem it solves:** a truly slow old laptop often needs a clean Windows reinstall, and Ventoy makes the USB without reformatting for each ISO. — [README](https://github.com/ventoy/Ventoy)
- **Stars:** ~80.5k (read 2026-10-30). **Licence:** GPL-3.0. **Archived:** no. — [repo page](https://github.com/ventoy/Ventoy)
- **Latest release:** Ventoy 1.1.18, 2026-10-09 (1.1.17 on 2026-07-24). — [releases.atom](https://github.com/ventoy/Ventoy/releases.atom). Files: `ventoy-1.1.18-windows.zip`, `ventoy-1.1.18-linux.tar.gz`, `ventoy-1.1.18-livecd.iso`. — [Releases](https://github.com/ventoy/Ventoy/releases)
- **Install (exact):** "Download the installation package, like ventoy-x.x.xx-windows.zip and decompress it." "Run `Ventoy2Disk.exe`, select the device and click Install or Update button." — [ventoy.net doc_start](https://www.ventoy.net/en/doc_start.html)
- **First use:** (1) Unzip and run Ventoy2Disk.exe. (2) Pick the USB → Install. (3) "You just need to copy iso files to this partition", then boot from the USB. — [doc_start](https://www.ventoy.net/en/doc_start.html)
- **Hook fact:** "1300+ ISO files are tested." — [README](https://github.com/ventoy/Ventoy)
- **Caveats:** "the USB drive will be formatted and all the data will be lost after install." — [doc_start](https://www.ventoy.net/en/doc_start.html). A Windows reinstall erases the laptop if done wrongly, so it needs a backup first (inference). Secure Boot support is off by default in the CLI options; the doc links a separate Secure Boot page. — [doc_start](https://www.ventoy.net/en/doc_start.html)
- **Difficulty:** 3/5 (the BIOS boot menu is the hard part).

#### G7. ChrisTitusTech/winutil (BACKUP, swap for Win11Debloat, never both)
- URL: https://github.com/ChrisTitusTech/winutil
- **What it does:** an all-in-one Windows utility with four tabs, "Install, Tweaks, Config, and Updates". It bulk-installs apps and applies privacy/performance tweaks. **Problem it solves:** setting up or cleaning a laptop in one place. — [winutil.christitus.com](https://winutil.christitus.com/)
- **Stars:** ~65.3k (read 2026-10-30). **Licence:** MIT. **Archived:** no. — [repo page](https://github.com/ChrisTitusTech/winutil)
- **Latest release:** 26.10.07 stable ("Latest", 2026-10-07). There is also Pre-Release 26.10.28 (2026-10-28). The asset is `winutil.ps1`. — [Releases](https://github.com/ChrisTitusTech/winutil/releases)
- **Install (exact):** "WinUtil must be run as Administrator", stable command `irm https://christitus.com/win | iex` (the dev build `.../windev` is not for beginners). — [README](https://github.com/ChrisTitusTech/winutil). Presets: `Minimal` ("Minimal changes to suit every user"), `Standard` ("Balanced defaults for most users"), `Advanced` ("Deep tweaks for power users"). — [README](https://github.com/ChrisTitusTech/winutil)
- **First use:** (1) Admin PowerShell → stable command. (2) Tweaks tab → tick **"Restore Point - Create"** (category "Essential Tweaks": "Creates a restore point at runtime in case a revert is needed from WinUtil modifications"). (3) Choose the Standard preset, review, and apply. — [tweaks.json](https://github.com/ChrisTitusTech/winutil/blob/main/config/tweaks.json), [README](https://github.com/ChrisTitusTech/winutil)
- **Hook fact:** one of its tweak categories is literally named **"Performance Plans - NOT FOR LAPTOPS"**. — [tweaks.json](https://github.com/ChrisTitusTech/winutil/blob/main/config/tweaks.json)
- **Caveats: what is safe to click.** SAFE: the restore point, the Minimal/Standard presets, the Install tab. AVOID for beginners: the category "z__Advanced Tweaks - CAUTION", which includes "Microsoft Edge - Remove" ("Uninstalls Microsoft Edge by creating dummy MicrosoftEdge.exe file…") and "Microsoft OneDrive - Remove" ("Denies permission to remove OneDrive user files, then uses its own uninstaller…"), and everything under "Performance Plans - NOT FOR LAPTOPS". — [tweaks.json](https://github.com/ChrisTitusTech/winutil/blob/main/config/tweaks.json). The site says "Nearly every tweak can be reverted from the same panel," which means not every one. — [winutil.christitus.com](https://winutil.christitus.com/). Piping a web script into PowerShell (`irm … | iex`) runs whatever that domain serves, so type the domain exactly and never use copies from comments (inference; the README gives no fake-domain warning).
- **Difficulty:** 3–4/5.

#### G8. Flow-Launcher/Flow.Launcher (ranked #8, no full sheet needed)
- Alt+Space search for apps and files ("Open search window (default and configurable)"). ~15.9k stars, MIT, `winget install "Flow Launcher"`, `Flow-Launcher-Setup.exe` / `Flow-Launcher-Portable.zip`, "Windows 10+". — [README](https://github.com/Flow-Launcher/Flow.Launcher). Latest v2.1.4 on 2026-09-20. — [releases.atom](https://github.com/Flow-Launcher/Flow.Launcher/releases.atom). It ranks lower because PowerToys already includes PowerToys Run and Command Palette. — [PowerToys README](https://github.com/microsoft/PowerToys)

### Inferences
- **Order for the Reel:** debloat (biggest "wow") → uninstall → disk map → PowerToys trick (Win+Shift+T is a perfect on-screen moment) → NanaZip (an easy, safe close). Every step frees space or removes nags, which matches "make it faster".
- **Debloat honesty line for the voice-over:** "Create the restore point first. Don't remove the Microsoft Store or Edge. Skip anything marked CAUTION or NOT FOR LAPTOPS." Each part of that is backed by the wiki and tweaks.json findings above.
- Files (files-community/Files) was left out on purpose: as a modern WinUI shell replacement it is likely heavier than Explorer on an 8 GB laptop. This was not measured, so treat it as a judgement.

### Gaps
- Not fetched within budget, so no verified facts: pbatard/rufus, File-New-Project/EarTrumpet, xanderfrangos/twinkle-tray, files-community/Files, ramensoftware/windhawk, TranslucentTB. They are not in the ranking for that reason.
- No published RAM or CPU cost for PowerToys or for debloating. "Faster" claims should be shown on screen (Task Manager before/after) rather than stated as numbers.
- Win11Debloat's exact default selection list is not on the README or How-To-Use page (it is an interactive wizard). Read the wizard on a test machine before scripting the voice-over.
- BCU's winget id and NanaZip's winget manifest contents were not read directly (NanaZip's id comes from the winget-pkgs folder path).

---

## Theme H: ranked list, final TOP 5 + 2 backups, with fact sheets

### Takeaway
The best five are **LocalSend → NewPipe → Canta (+Shizuku) → scrcpy → Obtainium**. That runs: send files without data or a cable, watch and listen while using less data with no ads, remove the bloatware budget phones ship with, show the phone on the PC, and keep all of these updated safely from GitHub. Backups: **Fossify Gallery** (easiest, on Google Play) and **YTDLnis**. YTDLnis replaces the user-suggested **Seal**, whose last real release was **2024-10-16**. Only LocalSend, Canta, Fossify Gallery and Aegis are on Google Play. NewPipe states that Google Play is off-limits.

### Ranked 8 (Theme H)
1. localsend/localsend: phone ↔ PC file sharing over Wi-Fi, no internet. TOP 5
2. TeamNewPipe/NewPipe: ad-free YouTube client with audio-only background play. TOP 5
3. samolego/Canta (+ RikkaApps/Shizuku): uninstall bloatware without root. TOP 5
4. Genymobile/scrcpy: phone screen on the PC (a PC app). TOP 5
5. ImranR98/Obtainium: install and update apps straight from GitHub Releases. TOP 5
6. FossifyOrg/Gallery: ad-free gallery, on Play. BACKUP
7. deniscerri/ytdlnis: yt-dlp downloader for Android (replaces Seal). BACKUP
8. beemdevelopment/Aegis: 2FA authenticator (cross-fit with the privacy theme)

### Cited Findings

#### H1. localsend/localsend (TOP 5 #1)
- URL: https://github.com/localsend/localsend
- **What it does:** shares "files and messages with nearby devices over your local network without needing an internet connection." **Problem it solves:** moving photos or videos between phone and laptop without a cable, without Messenger or WhatsApp compression, and without spending data. — [README](https://github.com/localsend/localsend)
- **Stars:** ~96.6k (read 2026-10-30). **Licence:** Apache-2.0. **Archived:** no. — [repo page](https://github.com/localsend/localsend)
- **Latest release:** v1.18.2, 21 Aug 2026. — [v1.18.2 release](https://github.com/localsend/localsend/releases/tag/v1.18.2)
- **Install (exact):** Android: Play Store `https://play.google.com/store/apps/details?id=org.localsend.localsend_app`, F-Droid `https://f-droid.org/packages/org.localsend.localsend_app`, or the APK from Releases. Windows: winget (README links `winget-pkgs/.../manifests/l/LocalSend/LocalSend`, i.e. id LocalSend.LocalSend), "EXE Installer", portable ZIP, plus Scoop/Chocolatey. — [README](https://github.com/localsend/localsend). v1.18.2 files: `LocalSend-1.18.2-android-arm64v8.apk` (44.4 MB), `LocalSend-1.18.2-android-google-play.apk` (122 MB), `LocalSend-1.18.2-windows-x86-64.exe` (19 MB), `LocalSend-1.18.2-windows-x86-64.zip`, and also `…-windows-x86-64-unsigned.exe`. — [v1.18.2 release](https://github.com/localsend/localsend/releases/tag/v1.18.2)
- **First use:** (1) Install on the phone (Play) and the PC. (2) Connect both to the same Wi-Fi. If Windows asks, allow it through the firewall ("you may need to configure your firewall"). (3) Pick a file → tap the PC's name → accept on the PC. — [README](https://github.com/localsend/localsend) (tap order inferred from the app's purpose)
- **Hook fact:** "All data is sent securely over HTTPS, and the TLS/SSL certificate is generated on the fly on each device." It needs no internet and no third-party servers. — [README](https://github.com/localsend/localsend)
- **Caveats:** both devices must be on the same network (a phone hotspot works as that network; inference). On Windows, pick the signed `…x86-64.exe`, not the `-unsigned` one (inference from the file names). On costly data, the Play install is the easy route. The universal Play APK on GitHub is 122 MB versus 44.4 MB for arm64. — [release](https://github.com/localsend/localsend/releases/tag/v1.18.2)
- **Difficulty:** 1/5.

#### H2. TeamNewPipe/NewPipe (TOP 5 #2)
- URL: https://github.com/TeamNewPipe/NewPipe
- **What it does:** a "Lightweight YouTube frontend" (also PeerTube, Bandcamp, SoundCloud, media.ccc.de) with background play, popup mode and downloads, and no account needed. **Problem it solves:** listening to lectures or waz without keeping the screen on, and saving data: "Listen to audio in the background, only loading the audio stream to save data." — [README](https://github.com/TeamNewPipe/NewPipe), [F-Droid](https://f-droid.org/packages/org.schabi.newpipe/)
- **Stars:** ~40.4k (read 2026-10-30). **Licence:** GPL-3.0-or-later. **Archived:** no. — [repo page](https://github.com/TeamNewPipe/NewPipe), [F-Droid](https://f-droid.org/packages/org.schabi.newpipe/)
- **Latest release:** v0.29.1, 2026-08-15. 0.28.x shipped about monthly through 2026 to keep up with YouTube changes; for example, v0.28.8 dealt with YouTube "enforcing its SABR protocol". — [releases.atom](https://github.com/TeamNewPipe/NewPipe/releases.atom), [Releases](https://github.com/TeamNewPipe/NewPipe/releases). F-Droid has 0.29.1, "Added on Aug 21, 2026", "requires Android 6.0 or newer". — [F-Droid](https://f-droid.org/packages/org.schabi.newpipe/)
- **Install (exact):** F-Droid (main repo, or NewPipe's custom F-Droid repo), or "Download the APK from GitHub Releases" and compare the signing key. — [README](https://github.com/TeamNewPipe/NewPipe). The file is `NewPipe_v0.29.1.apk` (11 MB). — [v0.29.1 assets](https://github.com/TeamNewPipe/NewPipe/releases/tag/v0.29.1). **Not on Google Play** (see hook).
- **First use:** (1) Install the APK. (2) Search a video. (3) Use the background/audio-only player and turn the screen off (feature per the README).
- **Hook fact:** the README says in capitals: "PUTTING NEWPIPE, OR ANY FORK OF IT, INTO THE GOOGLE PLAY STORE VIOLATES THEIR TERMS AND CONDITIONS." So any "NewPipe" on Play is a fake. — [README](https://github.com/TeamNewPipe/NewPipe)
- **Caveats:** "THIS APP IS IN BETA, SO YOU MAY ENCOUNTER BUGS". — [README](https://github.com/TeamNewPipe/NewPipe). F-Droid flags the anti-feature NonFreeNet ("Depends on Youtube for videos"). — [F-Droid](https://f-droid.org/packages/org.schabi.newpipe/). **Legal:** YouTube's Terms bar users from "access, reproduce, download…" content "except: (a) as expressly authorized by the Service; or (b) with prior written permission from YouTube", and allow viewing for "personal, non-commercial use". Downloading is a ToS matter, so say "only content you own or have the right to". — [YouTube Terms](https://www.youtube.com/static?template=terms). Because YouTube keeps changing, the app can break between updates (the 0.28.x hotfix history above).
- **Difficulty:** 2/5 (an APK install).

#### H3. samolego/Canta, with RikkaApps/Shizuku (TOP 5 #3)
- URLs: https://github.com/samolego/Canta · https://github.com/RikkaApps/Shizuku
- **What it does:** "Uninstall any Android app without root (with power of Shizuku)". It "integrates with the Universal Debloat List to provide safe recommendations." **Problem it solves:** budget phones arrive full of preinstalled apps that use storage, RAM and data and cannot be removed normally (the Xiaomi/Realme example is my inference). — [Canta README](https://raw.githubusercontent.com/samolego/Canta/master/README.md)
- **Stars:** Canta ~6.4k, licence LGPL-3.0, archived no. — [Canta repo](https://github.com/samolego/Canta). Shizuku ~32.4k, licence Apache-2.0, archived no. — [Shizuku repo](https://github.com/RikkaApps/Shizuku)
- **Latest release:** Canta 4.1.0, 2026-10-29 (4.0.0 on 2026-10-02). — [Canta releases.atom](https://github.com/samolego/Canta/releases.atom). Shizuku's newest GitHub release is **v13.6.0, 2025-05-25**. — [Shizuku releases.atom](https://github.com/RikkaApps/Shizuku/releases.atom)
- **Install (exact):** Canta is on Google Play `https://play.google.com/store/apps/details?id=io.github.samolego.canta`, F-Droid `io.github.samolego.canta`, IzzyOnDroid, and GitHub Releases. — [Canta README](https://raw.githubusercontent.com/samolego/Canta/master/README.md). The 4.1.0 GitHub file is `androidApp-release.apk` (4.95 MB) with `SHA256SUMS.txt` and `attestation.json`. — [Canta v4.1.0 assets](https://github.com/samolego/Canta/releases/tag/v4.1.0). Shizuku is on Google Play `https://play.google.com/store/apps/details?id=moe.shizuku.privileged.api`, GitHub Releases and IzzyOnDroid. — [Shizuku download](https://shizuku.rikka.app/download/). Requirement: "Works on Android 9.0+ (SDK 28+)". — [Canta README](https://raw.githubusercontent.com/samolego/Canta/master/README.md)
- **First use:** (1) Install Shizuku and start it. On Android 11+: Developer options → Wireless debugging → "Pair device with pairing code" → enter the code in Shizuku's notification → Start. (2) Install Canta and allow Shizuku. (3) "select an app and click the trash button". — [Shizuku setup](https://shizuku.rikka.app/guide/setup/), [Canta README](https://raw.githubusercontent.com/samolego/Canta/master/README.md)
- **Hook fact:** there is even a web version (samolego.github.io/Canta/app/) that works with "a data USB cable and a Chromium-based browser". — [Canta repo](https://github.com/samolego/Canta)
- **Caveats (safety):** "Use at your own risk. I am not responsible for any data loss or damage caused by this app." Removing critical apps "can experience bootloop and have to factory reset". Some OPLUS (Oppo/Realme/OnePlus) apps "don't allow uninstallations". "Android 16 might need forked version" of Shizuku. — [Canta repo](https://github.com/samolego/Canta). Shizuku without root: "the startup steps need to be performed again after each reboot". On MIUI (Xiaomi/POCO) enable "USB debugging (Security options)" and do not run the MIUI Security app's scan, since it "will disable Developer options". On ColorOS, disable "Permission monitoring". — [Shizuku setup](https://shizuku.rikka.app/guide/setup/). Canta "Detects previously uninstalled apps", but the README does not explain restoring. — [Canta repo](https://github.com/samolego/Canta)
- **Difficulty:** 4/5 (developer options plus wireless pairing). In the voice-over, say: remove only what the recommendation list marks as safe.

#### H4. Genymobile/scrcpy (TOP 5 #4)
- URL: https://github.com/Genymobile/scrcpy
- **What it does:** shows and controls the Android screen on a Windows PC over USB or Wi-Fi. "It does not require root access or an app installed on the device." **Problem it solves:** a cracked or small phone screen, typing WhatsApp/bKash-app replies with the PC keyboard, or recording the phone screen for tutorials. — [README](https://github.com/Genymobile/scrcpy)
- **Stars:** ~153.6k (read 2026-10-30). **Licence:** Apache-2.0. **Archived:** no. — [repo page](https://github.com/Genymobile/scrcpy)
- **Latest release:** scrcpy 5.0.1, 2026-10-08 (5.0 on 2026-10-05, 4.1 on 2026-07-12). — [releases.atom](https://github.com/Genymobile/scrcpy/releases.atom)
- **Install (exact):** `scrcpy-win64-v5.0.1.zip` (64-bit) / `scrcpy-win32-v5.0.1.zip`, or `winget install --exact Genymobile.scrcpy`, or `scoop install scrcpy` + `scoop install adb`. — [doc/windows.md](https://github.com/Genymobile/scrcpy/blob/master/doc/windows.md). **Requirements:** "at least API 21 (Android 5.0)"; "Audio forwarding is supported for API >= 30 (Android 11+)"; "Make sure you enabled USB debugging on your device(s)." — [README](https://github.com/Genymobile/scrcpy)
- **First use:** (1) Phone: turn on Developer options → USB debugging, then plug in the cable. (2) PC: unzip, then double-click `scrcpy-noconsole.vbs` (or `open_a_terminal_here.bat` → type `scrcpy`). (3) The phone screen appears in a window you control with the mouse. — [doc/windows.md](https://github.com/Genymobile/scrcpy/blob/master/doc/windows.md). The phone's "allow USB debugging" prompt is standard Android behaviour (not sourced here).
- **Hook fact:** it has more GitHub stars (~153.6k) than Microsoft PowerToys (~140.3k), with "low latency: 35~70ms". — [scrcpy repo](https://github.com/Genymobile/scrcpy), [PowerToys repo](https://github.com/microsoft/PowerToys)
- **Caveats:** "Do not download releases from random websites, even if their name contains scrcpy." — [README](https://github.com/Genymobile/scrcpy). USB debugging lets a connected PC control the phone, so turn it off afterwards (inference). This is a PC app, so it fits "phone ↔ PC" best.
- **Difficulty:** 3/5.

#### H5. ImranR98/Obtainium (TOP 5 #5)
- URL: https://github.com/ImranR98/Obtainium
- **What it does:** "Get Android app updates straight from the source." It "allows you to install and update apps directly from their releases pages" (GitHub, GitLab, Codeberg/Forgejo, F-Droid, IzzyOnDroid and more) and notifies you of new releases. **Problem it solves:** apps installed from GitHub (NewPipe, YTDLnis, Canta) never update themselves, and Obtainium keeps them current from the official page. — [README](https://raw.githubusercontent.com/ImranR98/Obtainium/main/README.md)
- **Stars:** ~21.0k (read 2026-10-30). **Licence:** GPL-3.0. **Archived:** no (3,891 commits). — [repo page](https://github.com/ImranR98/Obtainium)
- **Latest release:** v1.7.3, 25 Oct 2026. — [Releases](https://github.com/ImranR98/Obtainium/releases)
- **Install (exact):** GitHub Releases, IzzyOnDroid, or F-Droid (not on Google Play). — [README](https://raw.githubusercontent.com/ImranR98/Obtainium/main/README.md). Typical file: `app-arm64-v8a-release.apk` (also `app-arm64-v8a-fdroid-release.apk`, `app-armeabi-v7a-…`, each with `.sha256` and `.sha256.sig`). — [Releases](https://github.com/ImranR98/Obtainium/releases). The README gives the package name `dev.imranr.obtainium`, the SHA-256 of its signing certificate and a PGP key, and recommends Privacy Guides' "Verified Apps" tool. — [repo page](https://github.com/ImranR98/Obtainium)
- **First use (the README does not describe it; based on its purpose, not verified on device):** (1) Install the APK. (2) Add app → paste a repo URL such as `https://github.com/TeamNewPipe/NewPipe`. (3) Install, then get update notifications. The README links a crowdsourced config site, apps.obtainium.imranr.dev. — [README](https://raw.githubusercontent.com/ImranR98/Obtainium/main/README.md)
- **Hook fact:** it can even track APKMirror and other stores ("Track-Only"), and "HTML" mode works for any page that links an APK. — [README](https://raw.githubusercontent.com/ImranR98/Obtainium/main/README.md)
- **Caveats:** "For some sources, data is gathered using Web scraping and can easily break due to changes in website design." It installs whatever the URL you add serves, so add only the official repo URL. — [README](https://raw.githubusercontent.com/ImranR98/Obtainium/main/README.md)
- **Difficulty:** 3/5.

#### H6. FossifyOrg/Gallery (BACKUP)
- URL: https://github.com/FossifyOrg/Gallery
- **What it does:** "Browse your memories without any interruptions with this photo and video gallery." It has editing (crop, rotate, filters), a recycle bin, PIN/fingerprint lock, and EXIF stripping ("GPS coordinates and camera details"). "No ads, no unnecessary permissions." **Problem it solves:** stock galleries on budget phones that show ads or push cloud sign-ups (my inference). — [README](https://github.com/FossifyOrg/Gallery)
- **Stars:** ~3.9k (read 2026-10-30). **Licence:** GPL-3.0. **Archived:** no. — [repo page](https://github.com/FossifyOrg/Gallery)
- **Latest release:** 1.14.1, 2026-10-24 (1.14.0 on 2026-10-10). — [releases.atom](https://github.com/FossifyOrg/Gallery/releases.atom)
- **Install (exact):** the README shows Google Play, F-Droid and IzzyOnDroid badges. — [README](https://github.com/FossifyOrg/Gallery). The exact Play package id was not captured.
- **First use:** (1) Install from Play. (2) Allow photo access → it opens straight into your folders. (3) Long-press a photo → lock or share without location data (features per the README; exact menu labels not verified).
- **Hook fact:** Fossify "emerged as a fork of the discontinued SimpleMobileTools… to continue its legacy". The family also includes Calendar, File-Manager, Messages, Phone and Music-Player, all "ad-free". — [FossifyOrg](https://github.com/FossifyOrg)
- **Caveats:** none on safety. Stars are low (3.9k), so it is a weaker "wow" number.
- **Difficulty:** 1/5.

#### H7. deniscerri/ytdlnis (BACKUP, replaces Seal)
- URL: https://github.com/deniscerri/ytdlnis
- **What it does:** "a free and open source video/audio downloader using yt-dlp for Android 7.0 and above", with playlists, queued and scheduled downloads, subtitles and SponsorBlock removal. **Problem it solves:** saving a lecture or audio once on Wi-Fi to play later without data. — [README](https://github.com/deniscerri/ytdlnis)
- **Stars:** ~10.9k (read 2026-10-30). **Licence:** GPL-3.0. **Archived:** no. — [repo page](https://github.com/deniscerri/ytdlnis)
- **Latest release:** 1.9.1.1, 2026-10-19 (1.9.1 on 2026-10-18, 1.9.0 on 2026-09-08). — [releases.atom](https://github.com/deniscerri/ytdlnis/releases.atom)
- **Install (exact):** GitHub Releases, F-Droid, IzzyOnDroid, Uptodown ("Only the links above are the only trusted sources of YTDLnis"). A SHA-256 signing-certificate digest is given. Not on Google Play. — [README](https://github.com/deniscerri/ytdlnis). Files: `YTDLnis-1.9.1.1-arm64-v8a-release-github.apk` (66.7 MB) is right for most phones. Avoid `…-universal-release-github.apk` (208 MB). — [v1.9.1.1 assets](https://github.com/deniscerri/ytdlnis/releases/tag/v1.9.1.1)
- **First use (not verified on device):** (1) Install the arm64 APK. (2) Share a video link to YTDLnis. (3) Pick audio or video → download.
- **Hook fact:** it can cut sponsor segments out automatically with SponsorBlock. — [README](https://github.com/deniscerri/ytdlnis)
- **Caveats (legal):** the same YouTube ToS limits as NewPipe: only content you own or are allowed to download. — [YouTube Terms](https://www.youtube.com/static?template=terms). **Why not Seal:** Seal (~30.2k stars, GPL-3.0) has had no stable release since **v1.13.1 on 2024-10-16**. Its last pre-release was 2024-11-29. — [Seal releases.atom](https://github.com/JunkFood02/Seal/releases.atom). Its 2026 commits are all monthly "docs(readme): update sponsor info". — [Seal commits](https://github.com/JunkFood02/Seal/commits/main)
- **Difficulty:** 2/5.

#### H8. beemdevelopment/Aegis (ranked #8, cross-fit with privacy)
- A 2FA code app. ~13.4k stars, GPL-3.0. On Google Play and F-Droid (`com.beemdevelopment.aegis`). It imports from Google Authenticator, Microsoft Authenticator, Authy, 2FAS and others, and has "Automatic backups of the vault to a location of your choosing". — [README](https://github.com/beemdevelopment/Aegis). Latest v3.4.3, 2026-09-06. — [releases.atom](https://github.com/beemdevelopment/Aegis/releases.atom)

### Inferences
- **APK safety recipe for the series (one shared on-screen card):** (1) Open the repo on github.com → Releases → the version marked "Latest". (2) Download the `arm64-v8a` file for modern phones, not "universal" (half the data or less: YTDLnis 66.7 vs 208 MB, LocalSend 44.4 vs 122 MB). (3) Allow "install unknown apps" only for your browser, only for that install. (4) After that, let Obtainium update it. The repos back this with their own words ("Do not download releases from random websites", "Only the links above are the only trusted sources"). Android's "unknown apps" wording varies by brand and is not sourced here.
- If the video must include one Play-Store-only option for very new viewers, swap scrcpy for Fossify Gallery.
- A Bangladeshi framing angle: LocalSend and Canta both save data and storage, which ties straight to "mobile data is costly". NewPipe's audio-only background play is the third data-saver.

### Gaps
- Not fetched within budget, so unverified and unranked: KDE Connect (kdeconnect-android), Termux, Breezy Weather, Neo Store / Droid-ify, F-Droid client, Fossify File Manager/Calendar.
- Shizuku's Google Play version number and date were not read; only the GitHub release date (2025-05-25) was. Its maintenance pace is unclear, and Canta says Android 16 "might need" a fork (thedjchi/Shizuku), which was not investigated.
- Canta's README does not document the Universal Debloat List's levels or how to restore an uninstalled app. Test on a spare phone before filming.
- Obtainium's and YTDLnis's first-use steps come from their stated purpose, not from a tested device or a documented tutorial.
- Fossify Gallery's exact Play Store URL was not captured.

---

## Which give the biggest visible improvement in under 5 minutes?

### Takeaway
Windows: **Win11Debloat** (ads, suggestions and preinstalled apps gone after one restart) and **PowerToys Text Extractor** (Win+Shift+T copies text out of a picture) give the most "wow" per minute. **WinDirStat** gives the most striking picture (a colour map of the full disk). Android: **LocalSend** (a video arrives on the laptop in seconds, offline) and **NewPipe** (audio-only background play) give instant visible results. **scrcpy** looks spectacular but needs USB debugging first.

### Cited Findings
- Win11Debloat applies all choices from one wizard after a single paste, with an optional restore point. — [wiki: How-To-Use](https://github.com/Raphire/Win11Debloat/wiki/How-To-Use)
- Text Extractor: "With the activation shortcut (default: ⊞ Win+Shift+T)… drag… The text will be saved to your clipboard." — [Microsoft Learn](https://learn.microsoft.com/en-us/windows/powertoys/text-extractor)
- WinDirStat shows "interactive treemaps", sunbursts and flame graphs, and finds large and duplicate files. — [README](https://github.com/windirstat/windirstat)
- NanaZip installs from the Microsoft Store in one click. — [README](https://github.com/M2Team/NanaZip)
- LocalSend works "without needing an internet connection." — [README](https://github.com/localsend/localsend)
- NewPipe: "only loading the audio stream to save data." — [README](https://github.com/TeamNewPipe/NewPipe)
- scrcpy needs USB debugging enabled first. — [README](https://github.com/Genymobile/scrcpy)
- Canta needs Shizuku paired through Wireless debugging, repeated after every reboot. — [Shizuku setup](https://shizuku.rikka.app/guide/setup/)

### Inferences
- Under 5 minutes for a first-timer: NanaZip, WinDirStat, BCU (one uninstall), PowerToys (one shortcut), LocalSend, Fossify Gallery, NewPipe. Over 5 minutes, or risky to rush: Canta + Shizuku, Ventoy, scrcpy (first time), winutil.
- Best on-screen "before → after" shots: the Start menu before and after Win11Debloat, the C: free-space bar before and after BCU + WinDirStat, a photo flying phone → laptop with Wi-Fi data shown at 0.

### Gaps
- No measured speed-up (boot time, RAM) for any Windows repo was found. Measure on the user's own laptop if numbers are wanted.

---

## Which are actively maintained in late 2026?

### Takeaway
All 7 Theme G picks and 7 of the Theme H picks had a release between Aug and Oct 2026. **Seal is the exception:** no release since Oct/Nov 2024, so it was replaced with YTDLnis. **Shizuku** (needed by Canta) last released on GitHub in May 2025. It still works, but it is the weak link.

### Cited Findings
- PowerToys v0.102.3001.0, 2026-10-27; dev preview 2026-10-29. — [releases.atom](https://github.com/microsoft/PowerToys/releases.atom)
- winutil 26.10.07 (2026-10-07); pre-release 26.10.28. — [Releases](https://github.com/ChrisTitusTech/winutil/releases)
- Win11Debloat 2026.08.24. — [Releases](https://github.com/Raphire/Win11Debloat/releases)
- BCU v6.3, 2026-09-07; four releases in 2026. — [releases.atom](https://github.com/Klocman/Bulk-Crap-Uninstaller/releases.atom)
- WinDirStat 2.9.3, 2026-10-11, with near-weekly betas in Sept 2026. — [releases.atom](https://github.com/windirstat/windirstat/releases.atom)
- NanaZip 7.0 (2610.2), 26 Oct (2026 inferred from the version). — [Releases](https://github.com/M2Team/NanaZip/releases)
- Ventoy 1.1.18, 2026-10-09. — [releases.atom](https://github.com/ventoy/Ventoy/releases.atom)
- Flow Launcher v2.1.4, 2026-09-20. — [releases.atom](https://github.com/Flow-Launcher/Flow.Launcher/releases.atom)
- LocalSend v1.18.2, Aug 2026. — [release](https://github.com/localsend/localsend/releases/tag/v1.18.2)
- NewPipe v0.29.1, 2026-08-15; at least 10 releases in 2026 (the feed's 10 entries are all 2026). — [releases.atom](https://github.com/TeamNewPipe/NewPipe/releases.atom)
- Obtainium v1.7.3, 2026-10-25. — [Releases](https://github.com/ImranR98/Obtainium/releases)
- scrcpy 5.0.1, 2026-10-08. — [releases.atom](https://github.com/Genymobile/scrcpy/releases.atom)
- Canta 4.1.0, 2026-10-29. — [releases.atom](https://github.com/samolego/Canta/releases.atom)
- Fossify Gallery 1.14.1, 2026-10-24. — [releases.atom](https://github.com/FossifyOrg/Gallery/releases.atom)
- YTDLnis 1.9.1.1, 2026-10-19. — [releases.atom](https://github.com/deniscerri/ytdlnis/releases.atom)
- Aegis v3.4.3, 2026-09-06. — [releases.atom](https://github.com/beemdevelopment/Aegis/releases.atom)
- Seal v1.13.1, 2024-10-16 (last stable); 2026 commits are README sponsor updates only. — [releases.atom](https://github.com/JunkFood02/Seal/releases.atom), [commits](https://github.com/JunkFood02/Seal/commits/main)
- Shizuku v13.6.0, 2025-05-25 (latest GitHub release). — [releases.atom](https://github.com/RikkaApps/Shizuku/releases.atom)
- No repo in either list showed an "archived" banner on its page today. — repo pages linked above

### Inferences
- Seal may still download (it can update its bundled yt-dlp; not verified), but a series about "the best repos" should not feature a 2-year-old release.
- The api.github.com final check should confirm `archived: false` and `pushed_at` for Seal and Shizuku in particular.

### Gaps
- Atom-feed "updated" timestamps can differ slightly from the "published" date. The dates are right to the day in the cases cross-checked against the release pages (PowerToys, Ventoy, BCU), but not every one was cross-checked.

---

## Which install paths are current and safe (verified against the README today)?

### Takeaway
The safest paths are **Microsoft Store / winget** on Windows (PowerToys, NanaZip, WinDirStat, LocalSend) and **Google Play / F-Droid** on Android (LocalSend, Canta, Shizuku, Fossify, Aegis on Play; NewPipe, Obtainium, YTDLnis on F-Droid/IzzyOnDroid/GitHub only). The two debloat scripts are official one-liners from their own domains, safe only when typed exactly and run with a restore point. For any APK: the repo's own Releases page, the arm64-v8a file, and the signing checks the repo publishes.

### Cited Findings
- PowerToys: Store, `winget install --id Microsoft.PowerToys --source winget`, or `PowerToysSetup-0.##.#-x64.exe` from GitHub. Microsoft recommends GitHub or the Store. — [Microsoft Learn](https://learn.microsoft.com/en-us/windows/powertoys/install)
- WinDirStat: Store, `winget install -e --id WinDirStat.WinDirStat`, `WinDirStat-x64.msi`. — [README](https://github.com/windirstat/windirstat)
- NanaZip: Store 9N8G7TSCL18R, or GitHub msixbundle + license XML. — [README](https://github.com/M2Team/NanaZip)
- BCU: Releases `BCUninstaller_6.3.0_setup.exe`. — [v6.3](https://github.com/Klocman/Bulk-Crap-Uninstaller/releases/tag/v6.3)
- Win11Debloat: `& ([scriptblock]::Create((irm "https://debloat.raphi.re/")))`. — [wiki](https://github.com/Raphire/Win11Debloat/wiki/How-To-Use)
- winutil: `irm https://christitus.com/win | iex` (stable, "recommended"). — [README](https://github.com/ChrisTitusTech/winutil)
- Ventoy: `ventoy-x.x.xx-windows.zip` → `Ventoy2Disk.exe`. — [doc_start](https://www.ventoy.net/en/doc_start.html)
- LocalSend: Play `org.localsend.localsend_app`, F-Droid, winget, EXE. — [README](https://github.com/localsend/localsend)
- NewPipe: F-Droid or GitHub APK, never Play ("VIOLATES THEIR TERMS"). — [README](https://github.com/TeamNewPipe/NewPipe)
- Obtainium: GitHub, IzzyOnDroid, F-Droid; certificate SHA-256 and PGP key published. — [repo page](https://github.com/ImranR98/Obtainium)
- Canta: Play `io.github.samolego.canta`, F-Droid, IzzyOnDroid, GitHub. — [README](https://raw.githubusercontent.com/samolego/Canta/master/README.md); Shizuku: Play `moe.shizuku.privileged.api`. — [download](https://shizuku.rikka.app/download/)
- scrcpy: `winget install --exact Genymobile.scrcpy` or `scrcpy-win64-v5.0.1.zip`; "Do not download releases from random websites". — [windows.md](https://github.com/Genymobile/scrcpy/blob/master/doc/windows.md), [README](https://github.com/Genymobile/scrcpy)
- YTDLnis: "Only the links above are the only trusted sources" (GitHub, F-Droid, IzzyOnDroid, Uptodown). — [README](https://github.com/deniscerri/ytdlnis)
- Aegis: "APK releases on Google Play and GitHub are signed using the same key." — [README](https://github.com/beemdevelopment/Aegis)

### Inferences
- **Belongs elsewhere (cross-fits for the other researchers):** ShareX (screenshot and screen recording → content-creator theme); Seal / YTDLnis (downloaders; the brief allows Seal on Android, but they also fit content-creator); Aegis (privacy & security; kept here only as #8); Termux (coding / Claude Code theme); password managers and ad blockers such as KeePassDX, Bitwarden or AdGuard-style tools (privacy theme); OBS and Upscayl (content-creator).
- In the voice-over, give the exact source (Store, Play, or "the GitHub page → Releases → Latest") rather than "search for it". Search results for NewPipe, scrcpy and LocalSend are full of look-alike sites, which is why scrcpy and YTDLnis put warnings in their READMEs.

### Gaps
- LocalSend's Microsoft Store listing (if any) was not verified. The localsend.org download page did not render its options to the fetcher.
- BCU's and Flow Launcher's winget manifests were not opened (Flow's README gives `winget install "Flow Launcher"` by name).
