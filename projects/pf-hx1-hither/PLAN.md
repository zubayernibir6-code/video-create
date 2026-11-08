# HX1 · How-It-Works Explainer — Hither (concept)

ফরম্যাট: 16:9
দৈর্ঘ্য: 33 সেকেন্ড
প্ল্যাটফর্ম: ল্যান্ডিং পেজ, অনবোর্ডিং, YouTube / LinkedIn (স্টুডিওর পোর্টফোলিও নমুনা)
ধরন: কীভাবে কাজ করে — ব্যাখ্যা (HX1)
ভয়েস: Gemini AI ভয়েস (Achird, ইংরেজি), assets/voice/vo.wav, ভিডিওর ০.৩ সেকেন্ডে শুরু
মিউজিক: bright-future (ট্র্যাকের ৩.৭২ সে. থেকে, গেইন ০.৩৫, ভয়েসের নিচে অর্ধেক; ট্র্যাকের ড্রপ পড়ে লোগোর উপর)
আউটপুট: 16:9
পুরো ভিডিও জুড়ে: হালকা দানা (grain), নরম ভিনিয়েট, মিন্ট আলো ধীরে শ্বাস নেয়

## লক্ষ্য

প্রথমবার আসা দর্শক ৩০ সেকেন্ডে বুঝবেন Hither-এ ডাক্তার দেখানোর তিনটা ধাপ (বলুন → মিলিয়ে দিই → ভিডিওতে চিকিৎসা), তথ্য গোপন আর এক জায়গায় থাকে — তারপর "Get the app" চাপবেন।

## হুক (প্রথম ২ সেকেন্ড)

সাদা ক্যালেন্ডারে "On hold", "Busy", "Call back" কল-চিপ জমতে থাকে, উপরে ভয়েসের সাথে শব্দে শব্দে শিরোনাম: "Booking a doctor shouldn’t take a week." (৭ শব্দ)। কোনো সম্ভাষণ নেই — সমস্যাটা সাথে সাথে।

## স্ক্রিপ্ট

ভয়েস আগেই রেকর্ড করা; বন্ধনীতে লাইনের মাপা শুরু (ভিডিওর সময় = ভয়েসের সময় + ০.৩ সে.)। ASR "Here’s how it works." লাইনটা বাদ দিয়েছিল; আলাদা ASR আর শব্দের শক্তি মেপে ০:০৮.২-এ পাওয়া গেছে।

1. (0:00.6) Booking a doctor shouldn’t take a week of phone calls.
2. (0:03.8) With Hither, you see a real doctor in minutes, from wherever you are.
3. (0:08.2) Here’s how it works.
4. (0:09.4) One. Tell us what’s going on, in your own words.
5. (0:12.5) Two. Hither matches you with the right clinician, usually in under ten minutes.
6. (0:17.7) Three. Talk by video, get your prescription sent to your pharmacy, and follow up any time in chat.
7. (0:24.0) Your records stay private, and your care stays in one place.
8. (0:27.4) Hither. Care that comes to you.

## শট টেবিল

| সময় | পর্দায় কী | ক্যাপশন / লেখা | শব্দ |
| --- | --- | --- | --- |
| 0–2 | মিন্ট পটভূমিতে সাদা ক্যালেন্ডার কার্ড উঠে আসে; শিরোনাম শব্দে শব্দে ভয়েসের সাথে; কল-চিপ জমতে শুরু করে | Booking a doctor shouldn’t take a week. · This week · No appointment yet | `whoosh-short`, `pop` ×৩, ভয়েস 1 |
| 2–3.8 | পাঁচ দিনের কলামে ১৫টা কল-চিপ জমে সপ্তাহ ভরে যায়; "calls" শেষে কালো মোটা দাগে ক্যালেন্ডার কাটা, রং ফিকে | On hold · Busy · Call back · Voicemail · No slots · Try again | `pop` ×২, `whoosh-short` |
| 3.8–5.5 | ক্যালেন্ডার নেমে যায়; সবুজ চ্যাট-বাবল লোগো (সাদা প্লাস) লাফিয়ে বসে, আলোর রিং ছড়ায়, "Hither" অক্ষর উঠে আসে; লোগো বাঁয়ে সরে, ডানে ফোন উঠে আসে | Hither | `whoosh`, `impact-bass-2`, `sparkle`, `whoosh-short`, ভয়েস 2 |
| 5.5–8.2 | ফোনে বিমূর্ত ডাক্তার (মুখ নেই), "Doctor in 8 min", প্রগ্রেস বার ভরে; "wherever"-এ ডানে তিনটা চিপ | YOUR VISIT · Doctor in 8 min · Join visit · At home · At work · On the go | `ping`, `click-soft` ×৩ |
| 8.2–9.4 | "HOW IT WORKS" আর আইকনসহ ১-২-৩ তিনটা সাদা টাইল | HOW IT WORKS | `whoosh`, `pop` ×৩, ভয়েস 3 |
| 9.4–11.6 | টাইল ১-এর সংখ্যাটা বড় হয়ে বাঁ কলামে উড়ে যায় (অধ্যায়ের নোঙর); "Tell us"; ডানে চ্যাট উইন্ডো, কম্পোজারে লক্ষণ টাইপ হয় | Tell us · what’s going on, in your own words. · New visit · Care team online · Hi! What’s going on today? · Sore throat and a fever since Tuesday. | `whoosh-short`, `pop`, `typing`, ভয়েস 4 |
| 11.6–12.6 | পাঠানোর বোতাম চাপে, বার্তা সবুজ বাবল হয়ে থ্রেডে ওঠে, কেয়ার টিমের টাইপিং ডট | — | `click`, `whoosh-short`, `pop` |
| 12.6–14.8 | সংখ্যা ১ থেকে ২-এ ঘোরে (ওডোমিটার); "Get matched"; তিনটা ডাক্তার-কার্ড আসে, দুবার এলোমেলো হয় | Get matched · with the right clinician. · General practice · Dermatology · Pediatrics · Available now | `whoosh-short` ×৩, ভয়েস 5 |
| 14.8–17.6 | মাঝের কার্ডে সবুজ রিং আঁকা হয়, "Matched" ব্যাজ; বাকি দুটো ফিকে; নিচে টাইমার রিং আঁকা হয়, কাঁটা ঘোরে | Matched · < 10 min · typical wait | `ping`, `pop`, `click-soft`, `pop` |
| 17.6–19.5 | সংখ্যা ৩; "Get care" আর তিন সারির তালিকা; ভিডিও কল উইন্ডো (মিলে যাওয়া ডাক্তার, Live, ঘড়ি চলে, নিজের ছোট টাইল) | Get care · Video visit · Prescription sent · Follow-up in chat · Live | `whoosh-short`, `notification`, ভয়েস 6 |
| 19.5–21.4 | Rx কার্ড ভিডিও থেকে বেরিয়ে বাঁকা পথে ফার্মেসি ম্যাপের পিনে উড়ে যায়, পিন লাফায়, টিক বসে | Rx · Prescription · Pharmacy | `pop`, `whoosh-short`, `pop`, `click-soft` |
| 21.4–23.7 | ফলো-আপ চ্যাট: ডাক্তারের প্রশ্ন, রোগীর উত্তর | How are you feeling today? · Much better, thanks! | `pop` ×২ |
| 23.7–25.3 | রেকর্ড কার্ড উঠে আসে; সবুজ ঢাল উপর থেকে ভাঁজ খুলে কার্ড ঢেকে দেয়, তালা বন্ধ হয় | Private by design. · Your records · Updated today · Visit notes · Prescriptions · Messages · Video visits | `whoosh`, `whoosh-short`, `click`, ভয়েস 7 |
| 25.3–27.4 | ঢাল ছোট হয়ে কার্ডের মাথায় ব্যাজ হয়ে বসে; চার সারিতে একে একে সবুজ টিক | All in one place. | `click-soft` ×৩ |
| 27.4–29.4 | শেষ পর্দা: লোগো লাফিয়ে বসে, "Hither", তারপর ট্যাগলাইন | Hither · Care that comes to you. | `whoosh`, `sparkle`, ভয়েস 8 |
| 29.4–31 | "Get the app" বোতাম আসে, আলোর রেখা বয়ে যায় | Get the app · Concept work · fictional brand | `pop`, `chime` |
| 31–33 | দম: শেষ পর্দা স্থির, সবুজ আভা শ্বাস নেয়, মিউজিক মিলিয়ে যায় | — | মিউজিক |

## যা লাগবে

- ভয়েস: তৈরি আছে (assets/voice/vo.wav, ২৯.৯৬ সে.)। শব্দের সময় vo.words.json থেকে, বাক্যের শুরু শব্দের শক্তি মেপে ঠিক করা (ASR প্রায় ০.১–০.২ সে. আগে ধরে)।
- মিউজিক: bright-future (studio-music, sound.mjs কপি করে assets/music-এ)। ড্রপ (ট্র্যাক ৭.৬ সে.) পড়ে ভিডিওর ৩.৮৮ সে.-এ লোগোর উপর।
- শব্দ: সব assets/sfx-এ আছে; sound.mjs প্রতিটার লিড-ইন বাদ দিয়ে বসায়।
- ছবি / ফুটেজ লাগবে না: সব আঁকা আকার (বিমূর্ত মানুষ — গোল মাথা আর কাঁধ, মুখ নেই), আইকন Lucide (ISC)।
- ব্র্যান্ড কাল্পনিক; শেষ পর্দায় "Concept work · fictional brand"।

## STYLE.md আর LESSONS.md থেকে যা মানছি

- লেখা ২৮ px-এর বেশি, কিকার ২৪ px+; ডিসপ্লে টাইপ −0.03…−0.05 em; শিরোনামে text-wrap: balance (CLAUDE.md §0d)।
- টিক আর তীর ফন্টে নয়, SVG-তে আঁকা (§0d.11); প্রতিটা ফন্টের নাম উদ্ধৃতিতে (§0d.10)।
- প্রতিটা দৃশ্য বদলে whoosh, UI ঘটনায় হালকা ক্লিক; ১.৫ সে.-এর বেশি নীরব স্থির ছবি নেই (§0d.7–8)।
- প্যানেল বড় হয়ে ঢোকে (শুধু অস্বচ্ছতা নয়); প্রতিটা লেখা কমপক্ষে max(1.5 সে., 0.3 সে. × শব্দ) দেখা যায়।
- রেন্ডারের আগে check.mjs, প্রতিটা স্থির মুহূর্তের ছবি দেখা (§0d.9, §0i)।

## আপনার কাছে প্রশ্ন

- নেই — পোর্টফোলিও নমুনা, ব্রিফ সম্পূর্ণ। শুধু দেখার বিষয়: শেষ পর্দার "Get the app" ছাড়া অন্য কোনো CTA চান কি না।
