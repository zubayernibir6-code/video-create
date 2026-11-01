# ইনবক্সের মেসেজ আর কমিউনিটি কিট

কেউ ইনবক্সে কিওয়ার্ড (PHONE, PC …) লিখলে তাকে **দুটো মেসেজ** পাঠাবেন:
**মেসেজ ১:** সেই পর্বের ইনস্টল-গাইড (নিচে প্রতিটা পর্বের জন্য তৈরি)। **মেসেজ ২:** গ্রুপের আমন্ত্রণ (সব পর্বে একই)।

⚠️ শুধু একটা জিনিস আপনাকে বসাতে হবে: **`[গ্রুপের লিংক]`**। বাকি সব লিংক আর কমান্ড ৩০ অক্টোবর ২০২৬-এ রিপোর নিজের পাতা থেকে নেওয়া।
কমান্ডগুলো ভিডিও করার আগে আপনার ল্যাপটপে একবার চালিয়ে দেখব, কারণ এগুলো মাঝে মাঝে বদলায়।

---

## মেসেজ ২: গ্রুপের আমন্ত্রণ (সব পর্বে একই)

```
গাইডটা কাজে লাগলে আমাদের গ্রুপে চলে আসুন: [গ্রুপের লিংক]

ওখানে প্রতি সপ্তাহে নতুন ফ্রি টুল দিই, কোথাও আটকে গেলে স্ক্রিনশট দিলেই সবাই মিলে সমাধান করি।
গ্রুপে ঢুকলেই পাবেন "৫০টা GitHub রিপোর বাংলা গাইড", পুরো সিরিজ এক জায়গায়।
```

---

## পর্ব ১ · PHONE

```
আসসালামু আলাইকুম! এই নিন পাঁচটা অ্যাপের লিংক আর ইনস্টলের নিয়ম।

১. LocalSend (ফোন থেকে ল্যাপটপে ফাইল, ইন্টারনেট ছাড়া)
ফোনে: Play Store-এ "LocalSend" খুঁজুন।
ল্যাপটপে: https://github.com/localsend/localsend/releases থেকে Windows-এর .exe ফাইলটা।
দুটো ডিভাইস একই Wi-Fi-তে রাখুন, ফাইল বেছে ল্যাপটপের নামে চাপ দিন, ল্যাপটপে Accept।

২. Fossify Gallery (বিজ্ঞাপন ছাড়া গ্যালারি)
Play Store-এ "Fossify Gallery" খুঁজুন। https://github.com/FossifyOrg/Gallery

৩. Canta + Shizuku (রুট ছাড়া আগে থেকে বসানো অ্যাপ সরানো)
Play Store থেকে আগে Shizuku, তারপর Canta। Android 9 বা তার পরের ফোনে চলে।
Shizuku চালু করতে: Developer options → Wireless debugging → Pair device with pairing code।
শুধু "Recommended/নিরাপদ" লেখা অ্যাপ সরাবেন। ভুল অ্যাপ সরালে ফোন রিসেট লাগতে পারে।
ফোন রিস্টার্ট দিলে Shizuku আবার চালু করতে হয়।

৪. scrcpy (ফোনের স্ক্রিন ল্যাপটপে)
ল্যাপটপে: https://github.com/Genymobile/scrcpy/releases থেকে scrcpy-win64 zip ফাইল, অথবা PowerShell-এ:
winget install --exact Genymobile.scrcpy
ফোনে Developer options → USB debugging চালু করে কেবল লাগান, তারপর scrcpy-noconsole.vbs ডাবল ক্লিক।
অন্য কোনো ওয়েবসাইট থেকে scrcpy নামাবেন না। কাজ শেষে USB debugging বন্ধ করে দিন।

৫. Obtainium (GitHub-এর অ্যাপ আপডেট রাখা)
এটা Play Store-এ নেই। https://github.com/ImranR98/Obtainium/releases থেকে "Latest" লেখা ভার্সনের app-arm64-v8a-release.apk।
Add app চেপে অ্যাপের অফিশিয়াল GitHub লিংক দিন, বাকিটা সে করবে।

একটা নিয়ম মনে রাখবেন: APK নামাবেন শুধু রিপোর নিজের Releases পাতা থেকে, আর "universal" নয়, "arm64-v8a" ফাইলটা (ডেটা কম লাগে)।
```

## পর্ব ২ · PC

```
আসসালামু আলাইকুম! এই নিন পাঁচটা টুল। শুরুর আগে একটাই অনুরোধ: Windows-এ একটা restore point বানিয়ে নিন।

১. Win11Debloat (আগে থেকে বসানো অ্যাপ আর বিজ্ঞাপন সরানো)
PowerShell "Run as administrator" দিয়ে খুলে এটা পেস্ট করুন:
& ([scriptblock]::Create((irm "https://debloat.raphi.re/")))
উইজার্ডে "create a system restore point" বেছে নিন। Microsoft Store বা Edge সরাবেন না।
https://github.com/Raphire/Win11Debloat

২. Bulk Crap Uninstaller (অনেক সফটওয়্যার একসাথে মোছা)
https://github.com/BCUninstaller/Bulk-Crap-Uninstaller/releases থেকে BCUninstaller_..._setup.exe (প্রায় ৯ MB)।
শুধু চেনা প্রোগ্রামগুলোই মুছবেন।

৩. WinDirStat (C ড্রাইভ কে ভরাল)
PowerShell-এ: winget install -e --id WinDirStat.WinDirStat
অথবা Microsoft Store। C ড্রাইভ স্ক্যান করুন, বড় রঙিন ব্লকগুলোই বড় ফাইল।
শুধু নিজের ফাইল মুছবেন (Downloads, পুরোনো ভিডিও)। Windows বা Program Files ফোল্ডারে হাত দেবেন না।

৪. PowerToys (Microsoft-এর বাড়তি টুল)
PowerShell-এ: winget install --id Microsoft.PowerToys --source winget
অথবা Microsoft Store। তারপর Win + Shift + T চেপে স্ক্রিনের যেকোনো ইংরেজি লেখার উপর বক্স টানুন, লেখা কপি হয়ে যাবে।
(বাংলা লেখা এটা পড়তে পারে না।)

৫. NanaZip (WinRAR-এর বদলে)
Microsoft Store: https://www.microsoft.com/store/apps/9N8G7TSCL18R
যেকোনো .zip বা .rar-এ রাইট ক্লিক → NanaZip → Extract।
Windows 10 version 2004 বা তার পরে লাগবে।
```

## পর্ব ৩ · SAFE

```
আসসালামু আলাইকুম! এই নিন পাঁচটা নিরাপত্তার টুল। প্রথম তিনটা ১০ মিনিটেই হয়ে যায়।

১. Bitwarden (পাসওয়ার্ড ম্যানেজার)
https://bitwarden.com/download থেকে ব্রাউজার এক্সটেনশন আর ফোনের অ্যাপ।
একটা শক্ত master password দিন। এটা ভুলে গেলে vault আর খোলা যায় না, তাই কাগজে লিখে নিরাপদে রাখুন।

২. uBlock Origin / uBO Lite (বিজ্ঞাপন আর স্ক্যাম আটকানো)
Chrome-এ: Chrome Web Store-এ "uBlock Origin Lite" (পুরো uBlock Origin Chrome থেকে ৩১ আগস্ট ২০২৬-এ সরানো হয়েছে)।
Firefox বা Edge-এ: ওদের add-on store-এ "uBlock Origin"।
কোনো সাইট ঠিকমতো না চললে শুধু সেই সাইটে বন্ধ করে দিন।

৩. Ente Auth (লগইনের ছয় অঙ্কের কোড)
Play Store বা App Store-এ "Ente Auth"। https://ente.com/auth
Facebook বা Google-এর Security সেটিংসে "Authenticator app" বেছে QR কোড স্ক্যান করুন।
অ্যাকাউন্ট খুলে ব্যাকআপ চালু রাখুন, নইলে ফোন হারালে কোডও হারাবে।

৪. Cryptomator (Google Drive-এ তালা দেওয়া ফোল্ডার)
https://cryptomator.org থেকে Windows অ্যাপ। Add vault → Google Drive ফোল্ডারের ভেতরে বানান → পাসওয়ার্ড দিন।
রিকভারি কী অবশ্যই লিখে রাখবেন। পাসওয়ার্ড আর রিকভারি কী দুটো হারালে ফাইল আর ফেরত পাওয়া যায় না।
ল্যাপটপে পুরোটা ফ্রি। ফোনের অ্যাপ ফ্রিতে শুধু পড়তে দেয়।

৫. PrivateBin (একবার পড়লেই মুছে যাওয়া মেসেজ)
কিছু ইনস্টল লাগে না: https://privatebin.net
লেখা পেস্ট করুন → "Burn after reading" বেছে নিন → লিংকটা পাঠান।
```

## পর্ব ৪ · CREATOR

```
আসসালামু আলাইকুম! রেকর্ড থেকে আপলোড পর্যন্ত পাঁচটা ধাপ, পাঁচটা ফ্রি টুল।

১. OBS Studio (রেকর্ড)
https://obsproject.com অথবা https://github.com/obsproject/obs-studio/releases থেকে Windows Installer।
Sources-এ + চেপে Display Capture আর ক্যামেরা যোগ করুন, তারপর Start Recording।

২. auto-editor (চুপ থাকা অংশ কাটা)
https://github.com/WyattBlue/auto-editor/releases থেকে auto-editor-windows-x86_64.exe নামিয়ে নাম বদলে auto-editor.exe করুন।
ভিডিওর পাশে রেখে টার্মিনালে লিখুন: auto-editor video.mp4
কাটার ফাঁক বদলাতে: auto-editor video.mp4 --margin 0.2sec
(সই করা নয় বলে Windows সতর্ক করতে পারে। pip দিয়ে আর আসে না।)

৩. Subtitle Edit (কথা থেকে সাবটাইটেল)
https://github.com/SubtitleEdit/subtitleedit/releases থেকে SubtitleEdit-Windows-x64-Setup.exe।
ভিডিও খুলুন → Video → Speech to text (Whisper) → ভাষা বেছে নিন → .srt সেভ।
বাংলায় ভুল থাকে, একবার পড়ে ঠিক করে নেবেন। Windows 10 22H2 বা তার পরে লাগবে।

৪. LosslessCut (দ্রুত কাটা)
https://github.com/mifi/lossless-cut/releases/latest/download/LosslessCut-win-x64.7z
খুলে ভিডিও টেনে আনুন, শুরু আর শেষ চিহ্ন দিয়ে Export।

৫. HandBrake (ভিডিও ছোট করা)
আগে Microsoft .NET Desktop Runtime 10 ইনস্টল করুন, তারপর https://github.com/HandBrake/HandBrake/releases থেকে HandBrake-...-x86_64-Win_GUI.exe।
ভিডিও খুলুন → একটা 1080p preset বাছুন → Start Encode। পুরোনো ল্যাপটপে একটু সময় নেয়।
```

## পর্ব ৫ · AI

```
আসসালামু আলাইকুম! ইন্টারনেট ছাড়া ল্যাপটপে AI চালানোর পাঁচটা টুল।
আগে একটা সত্যি কথা: ৮ GB RAM-এ ছোট মডেল চলে (১ থেকে ৪B)। উত্তর ChatGPT-এর চেয়ে দুর্বল হবে, কিন্তু ফ্রি আর ডেটা বাইরে যায় না।

১. Ollama
PowerShell-এ: irm https://ollama.com/install.ps1 | iex
তারপর: ollama run gemma3:1b   (প্রায় ৮০৬ MB নামবে)
README-র উদাহরণ gemma4 ৮ GB ল্যাপটপের জন্য অনেক বড়, ওটা নেবেন না। https://github.com/ollama/ollama

২. Jan (ক্লিক করে চালানো AI অ্যাপ)
https://jan.ai বা https://github.com/janhq/jan/releases থেকে Jan_..._x64-setup.exe।
অ্যাপের ভেতর থেকে ১–৩B-র ছোট মডেল নামান, তারপর চ্যাট।

৩. Buzz (অডিও থেকে লেখা)
README-তে দেওয়া SourceForge লিংক থেকে Windows-এর তিনটা ফাইল (একটা .exe, দুটো .bin) নামিয়ে .exe চালান: https://github.com/chidiwilliams/buzz
সই করা নয়, তাই "More info → Run anyway" চাপতে হবে।
বাংলা লেখায় ভুল থাকে, একবার দেখে নেবেন।

৪. AnythingLLM (PDF-এর সাথে কথা বলা)
https://anythingllm.com/download
"Built-in local LLM" বেছে PDF বা Word ফাইল তুলুন, তারপর প্রশ্ন করুন। ৮ GB-তে উত্তর একটু ধীরে আসবে।

৫. FastSD CPU (গ্রাফিক্স কার্ড ছাড়া ছবি)
আগে Python আর uv লাগবে। তারপর https://github.com/rupeshs/fastsdcpu থেকে নামিয়ে install.bat ডাবল ক্লিক, তারপর start.bat।
এটা পাঁচটার মধ্যে সবচেয়ে কঠিন ইনস্টল। আটকে গেলে গ্রুপে স্ক্রিনশট দিন।
```

## পর্ব ৬ · OFFICE

```
আসসালামু আলাইকুম! ফ্রিল্যান্সিং আর অফিসের পাঁচটা ফ্রি টুল। কোনোটার জন্য সার্ভার লাগে না।

১. Stirling-PDF (PDF-এর সব কাজ, অফলাইন)
https://files.stirlingpdf.com/win-installer.exe
প্রথমবার খুললে "Continue without signing in" চাপুন, তাহলে কিছুই ল্যাপটপের বাইরে যাবে না। Windows 10 বা 11 লাগবে।

২. Excalidraw (হোয়াইটবোর্ড)
কিছু ইনস্টল লাগে না: https://excalidraw.com
Share → live session → লিংক ক্লায়েন্টকে পাঠান। কাজ শেষে ফাইল হিসেবে সেভ করে রাখবেন।

৩. Invoice Ninja (ইনভয়েস)
https://invoiceninja.com থেকে ফ্রি অ্যাকাউন্ট। ফ্রি প্ল্যানে ৫ জন ক্লায়েন্ট, ইনভয়েস যত খুশি।
লোগো আর কারেন্সি বসান → Client যোগ করুন → New Invoice।

৪. Documenso (অনলাইনে কন্ট্রাক্ট সই)
https://documenso.com থেকে ফ্রি অ্যাকাউন্ট। মাসে ৫টা ডকুমেন্ট ফ্রি, কার্ড লাগে না।
PDF তুলুন → ক্লায়েন্টের ইমেইল দিন → সইয়ের ঘর টেনে বসান → Send।

৫. Joplin (নোট আর কাজের তালিকা)
https://joplinapp.org/download থেকে Windows-এর Setup ফাইল, ফোনে Play Store।
Sync সেটিংসে OneDrive বা Dropbox বেছে নিন, encryption চালু করুন। ফোনেও একই sync দিন।
```

## পর্ব ৭ · LEARN

```
আসসালামু আলাইকুম! পাঁচটা ফ্রি স্কুল, কোথা থেকে শুরু করবেন সেটাও দিলাম।

১. free-programming-books
বাংলা বইয়ের তালিকা সরাসরি: https://github.com/EbookFoundation/free-programming-books/blob/main/books/free-programming-books-bn.md
একটা বই বেছে আজ শুধু প্রথম অধ্যায়।

২. freeCodeCamp
https://www.freecodecamp.org/learn
ফ্রি অ্যাকাউন্ট খুলে Responsive Web Design দিয়ে শুরু করুন, পুরোটা ব্রাউজারে।
ইংরেজিতে কথা বলার জন্য ওদের "English for Developers" সার্টিফিকেটও আছে।

৩. Generative AI for Beginners (Microsoft)
বাংলা শুরুর পাতা: https://github.com/microsoft/generative-ai-for-beginners/blob/main/translations/bn/README.md
তারপর 00-course-setup → 01-introduction-to-genai। বাংলাটা AI দিয়ে অনুবাদ, কোথাও খটকা লাগলে ইংরেজিটা দেখে নেবেন।

৪. first-contributions
https://github.com/firstcontributions/first-contributions (বাংলা গাইড আছে: docs/translations/README.bn.md)
Fork → নিজের নাম Contributors.md-তে → Pull request। আধা ঘণ্টায় প্রথম PR।

৫. build-your-own-x
https://github.com/codecrafters-io/build-your-own-x
"Build your own Bot" অংশে গিয়ে একটা Python টিউটোরিয়াল বেছে প্রথম চালু হওয়া পর্যন্ত করুন। এটা একটু কঠিন, ধীরে এগোন।
```

## পর্ব ৮ · BANGLA

```
আসসালামু আলাইকুম! বাংলা ভাষার পাঁচটা ওপেন সোর্স কাজ। প্রথম দুটো আজই ব্যবহার করা যায়, বাকি তিনটা ডেভেলপারদের জন্য।

১. Common Voice (সবাই সাহায্য করতে পারেন)
https://commonvoice.mozilla.org → ভাষা Bengali বাছুন → ৫টা বাক্য রেকর্ড করুন → অন্যদের ২০টা ক্লিপ শুনে মিলিয়ে দিন।
অনেক বাংলা রেকর্ডিং যাচাইয়ের অপেক্ষায় পড়ে আছে, তাই "শুনে মেলানো"-টাই এখন সবচেয়ে বড় সাহায্য।

২. OpenBangla Keyboard (শুধু Linux)
https://github.com/OpenBangla/OpenBangla-Keyboard
Linux-এ টার্মিনালে (BASH-এ):
bash -c "$(wget -q https://raw.githubusercontent.com/OpenBangla/OpenBangla-Keyboard/master/tools/install.sh -O -)"
Avro Phonetic-এর মতো করেই লেখা যায়। (Windows-এ Avro Keyboard-ই চালান, ওটাও ওপেন সোর্স।)

৩. Indic Parler-TTS (বাংলা কণ্ঠ বানানো, ডেভেলপারদের জন্য)
pip install git+https://github.com/huggingface/parler-tts.git
তারপর মডেলের পাতার Python কোড: https://huggingface.co/ai4bharat/indic-parler-tts
CPU-তে ধীরে চলে। কণ্ঠগুলো ভারতের ডেটা থেকে, বাংলাদেশি উচ্চারণ কেমন শোনায় নিজে শুনে দেখবেন।

৪. IndicTrans2 (অনুবাদের মডেল)
https://github.com/AI4Bharat/IndicTrans2
README-তে ডেমো লিংক আর Colab notebook আছে। লাইসেন্স MIT।

৫. bnlp (বাংলা লেখার Python টুলকিট)
pip install bnlp_toolkit
https://github.com/sagorbrur/bnlp
```

## পর্ব ৯ · AUTO

```
আসসালামু আলাইকুম! কাজ অটোমেট করার পাঁচটা টুল। দুটো নিয়ম মানবেন: সবসময় আপডেট রাখবেন, আর নিজের ল্যাপটপে চালানো টুল ইন্টারনেটে খুলে দেবেন না।
AI-এর ধাপগুলোর জন্য সাধারণত একটা AI-এর API key লাগে।

১. n8n
আগে Node.js 22 LTS ইনস্টল করুন। তারপর টার্মিনালে: npx n8n
ব্রাউজারে http://localhost:5678 খুলুন → একটা টেমপ্লেট বাছুন → Gmail বা Sheets যুক্ত করুন → Execute workflow।
নিজের কাজে ফ্রি, তবে n8n-কে অন্যের কাছে সার্ভিস হিসেবে বিক্রি করা যায় না। https://github.com/n8n-io/n8n

২. Nanobrowser
Chrome Web Store-এ "Nanobrowser" (Chrome আর Edge-এ চলে)। https://github.com/nanobrowser/nanobrowser
একটা AI-এর API key দিন (বা নিজের ল্যাপটপের Ollama), তারপর Alt + Shift + N চেপে কাজ লিখুন।
Ask মোড চালু রাখুন, তাহলে কিছু পাঠানোর আগে আপনার অনুমতি নেবে।

৩. Dify
https://dify.ai থেকে ফ্রি Sandbox (২০০ মেসেজ ক্রেডিট, ৫টা অ্যাপ)।
Chatbot বানান → নিজের ডকুমেন্ট তুলুন → চ্যাট করে দেখুন → লিংক শেয়ার করুন।

৪. Activepieces
https://www.activepieces.com থেকে ফ্রি ক্লাউড অ্যাকাউন্ট, কিছু ইনস্টল লাগে না।
Flow বানান → trigger (যেমন নতুন Gmail) → একটা AI ধাপ → Test।

৫. Langflow
https://www.langflow.org/desktop থেকে Langflow Desktop (ফর্ম পূরণ করে ডাউনলোড)।
একটা starter টেমপ্লেট খুলুন, API key দিন, Playground-এ চালিয়ে দেখুন।
```

## পর্ব ১০ · CLAUDE

```
আসসালামু আলাইকুম! Claude Code-এর পাঁচটা ফ্রি জিনিস।
আগে জেনে নিন: Claude Code চলে Pro, Max, Team বা Enterprise প্ল্যানে। ফ্রি claude.ai প্ল্যানে চলে না।
Windows-এ Claude Code ইনস্টল: PowerShell-এ irm https://claude.ai/install.ps1 | iex

১. Superpowers
Claude Code-এর ভেতরে লিখুন: /plugin install superpowers@claude-plugins-official
তারপর কিছু বানাতে বলুন, Claude আগে প্রশ্ন করবে আর প্ল্যান বানাবে। https://github.com/obra/superpowers

২. Anthropic Skills (Word, Excel, PowerPoint, PDF ফাইল)
/plugin marketplace add anthropics/skills
/plugin install document-skills@anthropic-agent-skills
তারপর বলুন "৫ স্লাইডের একটা PowerPoint বানাও"। https://github.com/anthropics/skills

৩. Context7 (আজকের ডকুমেন্টেশন)
টার্মিনালে: npx ctx7 setup   (Node.js 22.13 বা তার পরে লাগবে, ব্রাউজারে একবার লগইন)
তারপর প্রম্পটের শেষে লিখুন: use context7। https://github.com/upstash/context7

৪. Playwright MCP (Claude-এর হাতে ব্রাউজার)
টার্মিনালে: claude mcp add playwright npx @playwright/mcp@latest
তারপর বলুন নিজের সাইট খুলে ফর্মটা পরীক্ষা করতে। ব্যাংকের মতো জরুরি সাইটে এটা চালাবেন না। https://github.com/microsoft/playwright-mcp

৫. ccusage (কত টোকেন গেল)
টার্মিনালে: npx ccusage@latest
এখনকার ৫ ঘণ্টার হিসাব: npx ccusage@latest blocks
ডলারের সংখ্যাটা API দামে আন্দাজ, আপনার আসল বিল নয়। https://github.com/ccusage/ccusage
```

---

# কমিউনিটি কিট

## ১. গ্রুপে ঢোকার প্রশ্ন (যোগ দেওয়ার সময় ৩টা প্রশ্ন)

```
১. কোন ভিডিও দেখে এসেছেন? (PHONE, PC, AI …)
২. আপনি কী করেন? (ছাত্র / ফ্রিল্যান্সার / চাকরি / ব্যবসা / অন্য)
৩. এই মুহূর্তে কোন কাজটা সবচেয়ে বেশি সময় খায়?
```
তৃতীয় প্রশ্নের উত্তরগুলোই বলে দেবে পরের ভিডিও আর পরের প্রোডাক্ট কী হবে।

## ২. স্বাগত পোস্ট (পিন করে রাখবেন)

```
আসসালামু আলাইকুম, স্বাগতম!

এই গ্রুপটা তাদের জন্য, যারা ফ্রি টুল আর AI দিয়ে নিজের কাজ সহজ করতে চান। এখানে আমরা তিনটা কাজ করি:
১. প্রতি সপ্তাহে নতুন কাজের টুল, বাংলায় ধাপে ধাপে।
২. কোথাও আটকে গেলে স্ক্রিনশট দিয়ে পোস্ট করুন, সবাই মিলে সমাধান।
৩. মাঝে মাঝে লাইভে বসে একসাথে সেটআপ।

শুরু করতে: নিচের কমেন্টে নিজের পরিচয় দিন আর বলুন কোন কাজটা সহজ করতে চান।
"৫০টা GitHub রিপোর বাংলা গাইড" এই পোস্টের সাথে দেওয়া আছে।
```

## ৩. গ্রুপের নিয়ম (৫টা)

```
১. ভদ্র থাকুন। নতুনদের প্রশ্ন ছোট মনে হলেও উত্তর দিন।
২. কারো পাসওয়ার্ড, API key, OTP কখনো চাইবেন না, দেবেনও না।
৩. প্রশ্ন করলে স্ক্রিনশট আর কী চেষ্টা করেছেন লিখুন।
৪. অনুমতি ছাড়া বিজ্ঞাপন বা লিংক নয়।
৫. ক্র্যাক বা চুরি করা সফটওয়্যারের কথা নয়।
```

## ৪. সাপ্তাহিক ছন্দ

| দিন | পোস্ট |
| --- | --- |
| শনিবার | "এই সপ্তাহে কোথায় আটকে আছেন?" (সাহায্যের থ্রেড) |
| সোমবার | নতুন পর্বের ভিডিও + গ্রুপের জন্য একটা বাড়তি টিপস |
| বুধবার | সদস্যদের করা কাজ দেখানো ("আমি এটা বানালাম") |
| শুক্রবার | মাসে একবার লাইভ সেটআপ সেশন |

## ৫. ফ্রি উপহার: "৫০টা GitHub রিপোর বাংলা গাইড"

দশ পর্বের পঞ্চাশটা রিপো এক জায়গায়: প্রতিটার কাজ, লিংক, ইনস্টলের নিয়ম, সতর্কতা। উপরের দশটা ইনবক্স-গাইড আর গবেষণা-রিপোর্ট থেকে
আমি এটা একটা সুন্দর PDF বানিয়ে দিতে পারি। গ্রুপে ঢুকলেই পাবে, তাই মানুষ ইনবক্স থেকে গ্রুপে আসার একটা কারণ পায়।

## ৬. প্রোডাক্টের সিঁড়ি (আপনার প্রোডাক্টের তালিকা পেলে নাম আর দাম বসাব)

| ধাপ | কী | কেন কাজ করে |
| --- | --- | --- |
| ফ্রি | ভিডিও, ইনবক্স-গাইড, ৫০ রিপোর PDF, গ্রুপের সাহায্য | বিশ্বাস তৈরি হয় |
| কম দামি | তৈরি প্যাক: প্রম্পট প্যাক, স্কিল প্যাক, বাংলা চেকলিস্ট | প্রথম কেনাটা সহজ হয় |
| মাঝারি | "আপনার ল্যাপটপে সেট করে দেব" সার্ভিস (রিমোটে বসে টুলগুলো ইনস্টল আর শেখানো) | যারা নিজে পারে না, তাদের সময় বাঁচে |
| বেশি দামি | ছোট দলে কোর্স বা মাসিক পেইড মেম্বারশিপ | যারা নিয়মিত শিখতে চায় |

নিয়ম: প্রতিটা প্রোডাক্ট এমন হবে যেটা বিক্রির অধিকার আপনার আছে, আর গ্রুপে যা বলা হবে সেটা প্রোডাক্টে সত্যিই থাকবে।
