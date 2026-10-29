# প্ল্যান: ৫টা টুলের রিল (উদাহরণ: রেফারেন্স ref-01-এর নিজের ছাঁচ)

<!--
  tools-reel-এর উদাহরণ প্ল্যান। রেফারেন্স রিলটাকে মেপে উল্টো দিক থেকে লেখা, তাই টুলের নাম, কথা আর সংখ্যা ওই
  রিলেরই (নতুন ভিডিওতে নিজের টুল, নিজের কথা, যাচাই করা সংখ্যা)। এখান থেকে নেওয়ার জিনিস হলো আকার:
  ১২টা স্ক্রিপ্ট লাইন, ৩০টা শট (প্রতিটা ৩ সেকেন্ডের কম), প্রতি টুলে পরিচয়-কার্ড → কাজ দেখানো → প্রমাণ।
  কথার শুরুর সময়গুলো ভয়েস ফাইল থেকে মাপা (tools/transcribe.mjs)। দাঁড়ি-ধরা নিয়ম: tools/plan/TEMPLATE.md।
  চালিয়ে দেখা: node tools/plan-check.mjs <প্রজেক্ট ফোল্ডার>
-->

ফরম্যাট: 9:16
দৈর্ঘ্য: 58.5 সেকেন্ড
প্ল্যাটফর্ম: Instagram Reels আর Facebook Reels
ধরন: "৫টা টুল" রিল: হুক, প্রতি টুলে একটা অ্যানিমেটেড দৃশ্য, কমেন্ট-কিওয়ার্ড দিয়ে শেষ
ভয়েস: ইংরেজি পুরুষ-কণ্ঠ (Google AI Studio TTS), প্রতি সেকেন্ডে প্রায় ৩.৫ শব্দ
মিউজিক: BGM (Lyria), প্রায় ১২৮ BPM, assets/music/bgm.mp3
আউটপুট: 9:16, সাথে 1:1
পুরো ভিডিও জুড়ে: ডট-গ্রিড পেছন, নিচের টার্মিনাল, ৩-শব্দের ক্যাপশন (বলা প্রতিটা শব্দ), বর্তমান টুলের রঙে স্টেজের আলো, ফাইনাল আওয়াজ −১৪ LUFS

## লক্ষ্য

দর্শক জানবেন Claude Code-এর আগে কোন ৫টা টুল বসাতে হবে, প্রতিটা কী কাজ করে, আর কমেন্টে TOOLS লিখে লিংক চাইবেন।

## হুক (প্রথম ২ সেকেন্ড)

প্রথম কথাই সতর্কবার্তা: "Don't start vibe coding with Claude code unless you've installed these five tools." পর্দায় নিচের টার্মিনাল আর উপরে ক্যাপশন, ২ সেকেন্ডে লাল ব্যানার "0 of 5 tools installed", নমস্কার-শুভেচ্ছা নেই।

## স্ক্রিপ্ট

১. (০:০০.০) Don't start vibe coding with Claude code unless you've installed these five tools.
২. (০:০৩.৮) The first is REA.
৩. (০:০৫.১) It lets Claude open any app, website, or APK and trace every feature down to the code, so the moment you wonder how something works, it shows you the proof, and you never have to guess.
৪. (০:১৪.১) The second is Agent Reach.
৫. (০:১৫.৭) It lets Claude read Reddit, X, YouTube, and GitHub with zero API fees, which shows you exactly what users hate before you write a line, install it, and build what they want.
৬. (০:২৪.৮) The third is Replica.
৭. (০:২৫.৮) It gives Claude 11 skills that scan the app, plan it, build it, and test it, so you never start from a blank page. One app, start to finish.
৮. (০:৩৩.৯) The fourth is Context 7, from Upstash, with over 60,000 stars.
৯. (০:৩৮.৫) It pulls the current docs for any library you use, so Claude stops writing code that broke two versions ago. Fresh docs, every time.
১০. (০:৪৫.৩) And the fifth is Chrome DevTools MCP, from the Chrome team at Google.
১১. (০:৪৮.৯) It lets Claude open your app in a real browser, so it sees the red errors and fixes them itself.
১২. (০:৫৩.৪) It tests itself. Comment TOOLS, and I'll send you one link with all five.

## শট টেবিল

| সময় | পর্দায় কী | ক্যাপশন / লেখা | শব্দ |
| --- | --- | --- | --- |
| 0–2 | ডট-গ্রিডের উপর নিচে টার্মিনাল ফুটে ওঠে; উপরে ক্যাপশন চলা শুরু | — | `impact-bass-1` `whoosh-short` ভয়েস ১ |
| 2–3.7 | লাল ব্যানার নামে; তার নিচে ৫টা রঙিন প্রোগ্রেস-বারের প্যানেল ভরতে থাকে (নাম ঝাপসা) | Don't start · 0 of 5 tools installed | `whoosh` `pop` ×৫ |
| 3.7–5.1 | প্রথম টুলের পরিচয়-কার্ড আছড়ে পড়ে (নীলচে সবুজ রঙ); টার্মিনালে ইনস্টল কমান্ড, তারপর সবুজ টিক | REA | `whoosh-cinematic` `impact-bass-1` `key-press` ×৩ ভয়েস ২ |
| 5.1–6.9 | একটা ফোনের ছবি; মাসকটের চোখ থেকে লাল লেজার ফোনের উপর | — | `sparkle` ভয়েস ৩ |
| 6.9–8.5 | APP, SITE, APK তিনটা ইনপুট-চিপ একে একে ওঠে | APP · SITE · APK | `pop` ×৩ |
| 8.5–10.3 | ফিচারের সারি Login, Search, Feed, Pay "0 functions" নিয়ে; পাশে সোর্স-কোডের প্যানেল | 0 functions | `click-soft` ×৪ |
| 10.3–12 | লাল ঢেউ-রেখা প্রতিটা ফিচারকে সোর্স-লাইনের সাথে জোড়ে; সংখ্যা বাড়ে | 47 features traced | `typing` `ping` |
| 12–13.7 | চিপ বসে: কোনো আন্দাজ নেই | 47 features · 0 guesses | `impact-bass-1` `ping` |
| 13.7–15.5 | দ্বিতীয় টুলের কার্ড (হলুদ); টার্মিনালে ইনস্টল | Agent Reach | `whoosh-cinematic` `impact-bass-2` ভয়েস ৪ |
| 15.5–17.4 | মাঝখানে মাসকট; চারদিকে Reddit, X, YouTube, GitHub নোড, আলোর রেখায় জোড়া | — | `pop` ×৪ ভয়েস ৫ |
| 17.4–19.3 | চিপ নামে: কোনো API খরচ নেই | API fees $0.00 | `ping` `coin-drop` |
| 19.3–21.7 | লাল চিপ ওঠে; নোডগুলো থেকে অভিযোগের কার্ড উড়ে এসে জমে | 11,977 complaints | `whoosh-short` `glitch-3` |
| 21.7–24.5 | একটা কাল্পনিক ডেমো অ্যাপের কার্ড: রেটিং নামে, তিনটা অভিযোগ; তারপর "building" বার | Demo app | `error` `click-soft` ×৩ |
| 24.5–25.8 | তৃতীয় টুলের কার্ড (বেগুনি) | Replica · 11 skills | `whoosh-cinematic` `impact-bass-1` ভয়েস ৬ |
| 25.8–27.8 | ১১টা স্কিল-চিপ একে একে জ্বলে (recon, architect, design, build…) | 11 skills | `click-soft` ×৬ ভয়েস ৭ |
| 27.8–30 | মাসকট-কর্মীরা অ্যাপ বানায়; ARCHITECTURE আর TESTS প্যানেল ভরে | — | `typing` `pop` ×৩ |
| 30–32 | ফাঁকা পাতা থেকে অ্যাপের স্ক্রিন গড়ে ওঠে | — | `sparkle` `whoosh-short` |
| 32–33.9 | সম্পূর্ণ অ্যাপে পতাকা পোঁতা; এরপর ০.৩ সেকেন্ড সব আওয়াজ বন্ধ | One app, start to finish. | `impact-bass-1` `success` |
| 33.9–35.8 | চতুর্থ টুলের কার্ড (সবুজ) | Context7 · from Upstash | `whoosh-cinematic` `impact-bass-2` ভয়েস ৮ |
| 35.8–38.5 | কার্ডের তারকা-সংখ্যা গোনা বাড়ে; শেষে আবার ০.৫ সেকেন্ড সব আওয়াজ বন্ধ | 60k+ stars | `typing` `ping` |
| 38.5–41 | React, Supabase, Tailwind আইকন থেকে ডক-পাতা উড়ে জাদুকর-টুপি পরা মাসকটের দিকে যায় | — | `whoosh` ×৩ `sparkle` ভয়েস ৯ |
| 41–43.7 | "app.tsx" প্যানেলে ৪টা পুরোনো লাইন, লাল ব্যাজ; মাসকট জাদু ছোড়ে | 4 deprecated | `glitch-3` `click-soft` ×৪ |
| 43.7–45.3 | সাদা ঝলকানি আর বিদ্যুৎ; সব লাইন সবুজ, ব্যাজ শূন্য | Fresh docs, every time. | `boom` `glitch-1` `success` |
| 45.3–47 | পঞ্চম টুলের কার্ড (গোলাপি); নিয়ন গ্রিডের মেঝে | Chrome DevTools MCP | `whoosh-cinematic` `impact-bass-2` ভয়েস ১০ |
| 47–48.9 | কার্ডে মালিকের নাম আর তারকা-সংখ্যা ও লাইসেন্স | from the Chrome team at Google | `ping` |
| 48.9–51.3 | ব্রাউজার-মকআপ, কনসোলে লাল ভুল, কোয়ালিটি-ডায়াল লালচে | 1 errors | `error` `click-soft` ভয়েস ১১ |
| 51.3–53.4 | নাইট-মাসকট তলোয়ারে ভুল কাটে; ডায়াল ১০০, সবুজ | 100 | `whoosh-short` `success` `sparkle` |
| 53.4–55.2 | কমেন্ট-বক্সে TOOLS টাইপ হয়; পাঠানোর বোতাম চাপা | TOOLS | `key-press` ×৫ `click` ভয়েস ১২ |
| 55.2–57.2 | ডিএম-কার্ড আসে, ভেতরে ৫টা রঙিন চিপ | All 5 tools in one link: | `notification` |
| 57.2–58.5 | "Follow for more" বোতাম, তারপর "Following"; শেষ ফ্রেম ধরে রাখা | Follow for more | `click` `chime` |

## যা লাগবে

- ভয়েস: আপনার AI Studio ফাইল (assets/voice/voice.wav)। না থাকলে Claude আপনাকে TTS-এর সেটিং আর স্ক্রিপ্ট দেবে।
- মিউজিক: আপনার BGM (assets/music/bgm.mp3); এখন assets/music ফোল্ডারে কোনো গান নেই।
- সাউন্ড ইফেক্ট: সবই assets/sfx-এ আছে।
- ছবি: সব Claude-এর আঁকা গ্রাফিক্স। কোনো লোগো ফোল্ডারে নেই: টুলের নামের লেখা বা রঙিন আদ্যক্ষর-ব্যাজ।
- ক্রেডিট: Piper বা Noto ইমোজি ব্যবহার না করলে লাগবে না।

## STYLE.md আর LESSONS.md থেকে যা মানছি

- STYLE §৫: প্রতি ২–৩ সেকেন্ডে পর্দায় কিছু বদলায়; প্রথম ২ সেকেন্ডে সবচেয়ে চমকানো কথা।
- STYLE §৬: পড়ার লেখা ১০৮০p-তে অন্তত ২৮ px; ক্যাপশনে অক্ষরের ফাঁক নেই।
- STYLE §৭: প্রতি দৃশ্য বদলে শব্দ, শব্দ ঠিক ছবির মুহূর্তে; ভয়েসের নিচে মিউজিক; ফাইনাল −১৪ LUFS।
- STYLE §১৩: ভুয়া রিভিউ বা টেস্টিমোনিয়াল নয়: ডেমো অ্যাপ স্পষ্ট কাল্পনিক, আসল টুলের সংখ্যা যাচাই করা।
- LESSONS ২০২৬-১০-২৮: ক্যাপশন, টার্মিনাল আর স্টেজের আলো প্রথম ফ্রেম থেকে শেষ ফ্রেম পর্যন্ত (CLAUDE.md §০h)।
- LESSONS ২০২৬-১০-২৬: ভিডিওতে Claude-এর লোগো বা মাসকট নয়: নিজের আলাদা মাসকট।

## আপনার কাছে প্রশ্ন

- ডিএম-কার্ডে আপনার হ্যান্ডেল কী (নাম, @…)?
- Claude-এর কাঁকড়ার মতো মাসকট চান, নাকি নিজের আলাদা (সুপারিশ: আলাদা)?
