# ভিডিওর স্টাইল-তালিকা (VARIANTS)

প্রতিটা স্টাইলের একটা **নাম** আর একটা **কোড** আছে (যেমন **AB2 বাবল কাট**)।
আপনি শুধু কোড বা নাম বললেই আমি বুঝব কেমন ভিডিও চান।
নতুন স্টাইল তৈরি হলে এই ফাইলে নতুন লাইন যোগ হবে। তাই কী কী পাওয়া যায়, সবসময় এখানেই দেখবেন।
(মেশিনের জন্য একই তালিকা থাকে `tools/variants.json`-এ।)

---

## ১. আপনি কী করবেন

1. ভিডিওর সব কাঁচা ফাইল একটা ফোল্ডারে রাখুন। যেমন রেকর্ডিং, আলাদা ভয়েস, মিউজিক, B-roll ক্লিপ, ছবি।
2. আমাকে ফোল্ডারটা দিন আর এক লাইনে বলুন ভিডিওটা কী নিয়ে।
   চাইলে স্টাইলের নামও বলতে পারেন। যেমন: "AB2 স্টাইলে বানাও" বা "শুরুতে AB3, বাকিটা AB1"।
3. আমি আগে ফোল্ডারটা মেপে দেখব ফাইলগুলো কোন **ধাঁচের** (নিচে ২ নম্বর অংশ)। তারপর কোন কোন স্টাইল মানাবে, সেটা বলব।
4. আমি পরিকল্পনা (PLAN) দেখাব: কোন সেকেন্ডে পর্দায় কী আসবে। আপনি OK দিলে তবেই বানানো শুরু।
5. ভিডিও দেখে আপনার মতামত দেবেন। আপনার মতামত থেকেই পরের ভিডিও আরও ভালো হয়।

ফোল্ডার মাপার কাজটা করে এই যন্ত্র:
`node tools/route.mjs <ফোল্ডার>`

এটা প্রতিটা ভিডিও ফাইলের কোন অংশে **ক্যামেরা (মুখ)**, কোন অংশে **স্ক্রিন**, কোন অংশে **গ্রাফিক্স** আছে, তা বের করে।
আর প্রতিটা অডিও ফাইলে **মানুষের কথা** আছে না **মিউজিক**, সেটাও বলে।

## ২. ফাইলের ধাঁচ: কোন ধাঁচে কোন স্টাইল

| ধাঁচ | আপনার ফাইল দেখতে কেমন | মানানসই স্টাইল |
| --- | --- | --- |
| S1 | একটা রেকর্ডিং: শুরু/শেষে আপনার মুখ, মাঝে স্ক্রিন। ভয়েস আলাদা ফাইলে | TUT1 |
| S2 | শুধু স্ক্রিন রেকর্ডিং, ভয়েস আলাদা ফাইলে | ছোট হলে PROMO1, বড় হলে TUT1 |
| S3 | স্ক্রিন রেকর্ডিং, রেকর্ড করতে করতেই কথা বলেছেন | এখন EDIT1 (TUT2 পরিকল্পনায় আছে) |
| S4 | পুরোটা আপনার মুখ, কথা বলছেন | বড় হলে EP1 বা AB1–AB5, ছোট হলে AB3 |
| S5 | শুধু ভয়েস (আর মিউজিক), কোনো ভিডিও নেই | REEL1 |
| S6 | কথা ছাড়া ক্লিপ (B-roll, AI ক্লিপ) | কোন কথার সাথে যাবে, আমি জিজ্ঞেস করব |
| S7 | শুধু ছবি | স্লাইডশো |

অস্বাভাবিক মিশ্রণ থাকলে যন্ত্রটা আন্দাজ করে না, "S?" বলে প্রশ্ন করে।

## ৩. স্টাইলগুলো

অবস্থার মানে:
- **তৈরি**: আসল ভিডিওতে ব্যবহার হয়ে প্রমাণিত।
- **বেটা**: ইঞ্জিন বানানো আর ডেমো ভিডিও হয়েছে, কিন্তু আসল কাজে এখনো ব্যবহার হয়নি।
- **পরিকল্পনা**: নকশা আছে, বানানো হয়নি।

### স্ক্রিন রেকর্ডিং থেকে

| কোড | নাম | কী লাগে | দেখতে কেমন | অবস্থা |
| --- | --- | --- | --- | --- |
| TUT1 | ফ্লোটিং মনিটর টিউটোরিয়াল | মুখ+স্ক্রিন রেকর্ডিং, আলাদা ভয়েস, BGM | কাচের ফ্রেমে মুখ আর কার্ড; ভাসমান মনিটরে স্ক্রিন; জুম, লেবেল, টিক, ক্লিকের ঢেউ, কার্সরের আলো, ব্যক্তিগত তথ্য ঝাপসা | তৈরি |
| PROMO1 | গোল্ড কমার্শিয়াল | ছোট স্ক্রিন রেকর্ডিং, ভয়েস, মিউজিক | অ্যাপের বিজ্ঞাপন: জুম, ৩D হেলানো, ক্লিকে ঝলক, সোনালি শেষ কার্ড | তৈরি |
| TUT2 | লাইভ-ভয়েস টিউটোরিয়াল | কথা বলতে বলতে করা স্ক্রিন রেকর্ডিং | TUT1-এর মতো, শুধু আলাদা ভয়েসের বদলে আপনার নিজের বিরতিগুলো ছাঁটা | পরিকল্পনা |

### স্ক্রিন রেকর্ডিং ছাড়া (রোবট নিজে সফটওয়্যার চালায়)

কোনো ফোল্ডার লাগে না। শুধু বলুন কী শেখাতে চান আর কোন সফটওয়্যারে। রোবট নিজে ক্লিক আর টাইপ করে ঝকঝকে ছবি তোলে।
আপনি চাইলে ফোনে মুখ রেকর্ড করবেন, না চাইলে আপনার ক্লোন গলা। পুরো পরিকল্পনা: `docs/auto-tutorial-plan.md`।
claude.ai, ChatGPT, Facebook-এর মতো সাইট নিয়মে বট নিষেধ করে। সেখানে আপনি নিজে কয়েকটা ক্লিক করবেন, যন্ত্র ছবি তুলে নেবে (সহায়ক মোড)।

| কোড | নাম | কী লাগে | দেখতে কেমন | অবস্থা |
| --- | --- | --- | --- | --- |
| AT1 | স্টুডিও জানালা | বিষয় + সফটওয়্যারের লিংক; চাইলে মুখের ভিডিও বা ক্লোন গলা | অন্ধকার পটভূমিতে ব্রাউজার জানালা, উপরে আসল ঠিকানা; ক্যামেরা নিজে বোতামে জুম করে; কার্সর মসৃণ বাঁকা পথে চলে, বলা শব্দেই ক্লিক; ধাপের নম্বরসহ ক্যাপশন; শেষে দরকারি জায়গায় সোনালি ফ্রেম; শুরুতেই সেই ফলাফল দেখিয়ে রিওয়াইন্ড করে প্রথম পাতায় ফেরা; মুখ গোল বাবলে | বেটা (প্রমাণ: projects/autotut-proof, আপনার ক্লোন গলা + হুক, ২০২৬-১১-০১; মুখ এখনো যোগ হয়নি) |
| AT2 | পাশাপাশি ডেস্ক | AT1-এর মতো + মুখের ভিডিও | বাঁ দিকে লম্বা কাচের কার্ডে আপনি, ডানে জানালা; শেষ হওয়া ধাপগুলো আপনার নিচে টিক পায় | পরিকল্পনা |
| AT3 | ফুল জুম | AT1-এর মতো | স্ক্রিন পুরো পর্দা জুড়ে, গভীর জুম আর দ্রুত কাট; শুরু-শেষে আপনি পুরো পর্দায় | পরিকল্পনা |
| AT4 | খাড়া স্ট্যাক | AT1-এর মতো | খাড়া 9:16 রিল: উপরে স্ক্রিন (সাইটের মোবাইল চেহারা থাকলে সেটাই), নিচে আপনি, শব্দে-শব্দে ক্যাপশন | পরিকল্পনা |
| AT5 | ধাপ কার্ড | AT1-এর মতো | প্রতিটা ধাপের আগে বড় নম্বর-কার্ড; যে বোতাম চাপতে হবে সেটা কেটে বড় করে দেখানো | পরিকল্পনা |

### আপনার মুখ (কথা বলা) থেকে

| কোড | নাম | কী লাগে | দেখতে কেমন | অবস্থা |
| --- | --- | --- | --- | --- |
| EP1 | কার্ড স্প্লিট পর্ব | লম্বা কথা-বলা ভিডিও | ইউটিউব পর্ব: পাশে কার্ড, মোশন গ্রাফিক্স, শব্দে-শব্দে বাংলা ক্যাপশন, সাথে রিলস | তৈরি |
| EDIT1 | ক্লিন কাট | যেকোনো নিজের ফুটেজ | চুপ থাকা অংশ কাটা, ক্যাপশন, মিউজিক, রিলস/শর্টসের মাপ | তৈরি |
| AB1 | গ্লাস স্প্লিট | মুখের ভিডিও + B-roll | আপনি পুরো পর্দা থেকে মসৃণভাবে বাঁ দিকের কাচের ফ্রেমে সরে যান; ডান দিকে একটা ভাসমান জানালায় B-roll | বেটা |
| AB2 | বাবল কাট | মুখের ভিডিও + পুরো-পর্দা B-roll | B-roll পুরো পর্দায়; আপনি কোণে একটা গোল বাবলে, যার রিং আপনার গলার সাথে দোলে; দরকারি শব্দে বিশাল সোনালি লেখা ধাক্কা দিয়ে আসে | বেটা |
| AB3 | পাঞ্চ টাইপ | শুধু মুখের ভিডিও | পুরো পর্দায় আপনি; বড় বড় ক্যাপশন; মূল শব্দে মুখে জুম + আইকনসহ স্টিকার; আগের বিকল্প লাল দাগে কাটা পড়ে | বেটা |
| AB4 | কার্ড ফ্যান | মুখের ভিডিও + প্রতিটা বিষয়ের ছবি/ক্লিপ | তালিকা বলার সময়: আপনি ফ্রেমে, পাশে প্রতিটা বিষয়ের কার্ড তার শব্দে পাখার মতো খুলে যায় | বেটা |
| AB5 | ডেটা স্টেজ | মুখের ভিডিও + আপনার বলা সংখ্যা | আপনি ঝাপসা হয়ে পেছনে চলে যান (কোণে ছোট ছবি); সামনের মঞ্চে সংখ্যা গুনে ওঠে, বার-চার্ট বাড়ে, পেছনে আকার বদলানো নকশা | বেটা |

### ভয়েস থেকে (ক্যামেরা ছাড়া)

| কোড | নাম | কী লাগে | দেখতে কেমন | অবস্থা |
| --- | --- | --- | --- | --- |
| REEL1 | টুলস রিল | বিষয়/টুলের তালিকা + ভয়েস + BGM | খাড়া রিল: হুক, প্রতিটা টুলের দৃশ্য, টার্মিনাল, ক্যাপশন, কমেন্ট-কিওয়ার্ড CTA | তৈরি |
| REEL2 | পকেট গ্লাস | ৩–৫টা টুল + ভয়েস + BGM | কাচের ভাসমান ফোন; প্রতিটা রিপোর অ্যাপ-আইকন লাফিয়ে বেরিয়ে কাচের কার্ড খোলে, সুইচ অন হওয়া সারি, টোস্ট; শেষে ৫টা কার্ড আর ইনবক্সের শব্দ (GitHub সিরিজ পর্ব ১) | বেটা |
| REEL3 | স্পিডরান | ৩–৫টা টুল + ভয়েস + BGM | রেসের HUD: প্রতিটা রিপোতে স্পিড-মিটারের কাঁটা এক ধাপ ওঠে, পাশাপাশি ঝটকা প্যান আর আলোর রেখা, নিচে ছুটে চলা রাস্তা (পর্ব ২) | বেটা |
| REEL4 | ভল্ট | ৩–৫টা টুল + ভয়েস + BGM | ঘষা ইস্পাত: ৫টা ডায়াল-তালা একে একে বন্ধ হয়, পাসওয়ার্ড ভেঙে টুকরো, ভল্টের দরজার মতো ঘুরে বন্ধ হওয়া প্লেট, সিলমোহর (পর্ব ৩) | বেটা |
| REEL5 | ফিল্ম রিল | ৩–৫টা টুল + ভয়েস + BGM | এডিটিং ঘর: REC আর টাইমকোডসহ মনিটর, প্রতিটা রিপো টাইমলাইনের একটা ক্লিপ, প্লেহেড এগোয়, ৩-২-১, বিটে কাট আর আলোর ঝলক (পর্ব ৪) | বেটা |
| REEL6 | অফলাইন রাত | ৩–৫টা টুল + ভয়েস + BGM | রাতের আকাশ: প্রতিটা রিপোতে একটা তারা জ্বলে তারামণ্ডল হয়, Wi-Fi বন্ধ তবু চ্যাট উত্তর দেয়, ধীরে ভেসে ওঠা কাচের প্যানেল (পর্ব ৫) | বেটা |
| REEL7 | কাগজের টেবিল | ৩–৫টা টুল + ভয়েস + BGM | উপর থেকে দেখা কাঠের টেবিল: সাবস্ক্রিপশনের বিলে লাল "বাতিল" স্ট্যাম্প, প্রতিটা রিপো ওয়াশি-টেপ লাগানো কাগজ হয়ে পিছলে আসে, কলমের দাগ, রাবার-স্ট্যাম্প প্রমাণ, কাগজ স্তূপে যায় (পর্ব ৬) | বেটা |
| REEL8 | জ্ঞানের সিঁড়ি | ৩–৫টা টুল + ভয়েস + BGM | রাতের লাইব্রেরি উপরে ওঠে: বইয়ের সিঁড়িতে "লেভেল ১–৫", টুপির টোকেন ধাপে ধাপে লাফায়, কার্ড বইয়ের পাতার মতো উল্টে আসে, শুরুতে বইয়ের মলাট খোলে (পর্ব ৭) | বেটা |
| REEL9 | আলপনা | ৩–৫টা টুল + ভয়েস + BGM | মেরুন মাটিতে চালের-গুঁড়োর আলপনা নিজে আঁকা হয়ে ধীরে ঘোরে, ৫টা পদ্মের পাপড়ি রঙে ভরে, "অ" কলমের টানে লেখা হয়, নাম ক্যালিগ্রাফির মতো ফোটে (পর্ব ৮) | বেটা |
| REEL10 | ব্লুপ্রিন্ট | ৩–৫টা টুল + ভয়েস + BGM | নীল নকশার গ্রিড: এলোমেলো কাজের চিপ সারিতে সাজে, ৫টা যন্ত্র-বাক্স তারে জোড়া, সংকেত ছুটে একটা করে জ্বলে, প্যানেল রেখা থেকে খোলে, PART প্লেট (পর্ব ৯) | বেটা |
| REEL1S | টার্মিনাল (সিরিজ) | ৩–৫টা টুল + ভয়েস + BGM + প্রতিটার ইনস্টল কমান্ড | REEL1-এর ডার্ক UI সিরিজ ইঞ্জিনে: উপরে কার্ড, নিচে টার্মিনাল প্রতিটা রিপোর কমান্ড টাইপ করে, বার ভরে, সবুজ টিক, "ইনস্টল" গোনা, নামে হিট-স্টপ (পর্ব ১০; reel.json-এ style "REEL1") | বেটা |

### ফুটেজ ছাড়া ব্যাখ্যা ভিডিও (সব কোডে আঁকা)

| কোড | নাম | কী লাগে | দেখতে কেমন | অবস্থা |
| --- | --- | --- | --- | --- |
| EXP1 | ব্যাখ্যা বোর্ড | বিষয় (কোনো ধারণা বা অ্যাপ, যেটা রেকর্ড করা যায় না) + আপনার ক্লোন গলা + BGM | আড়াআড়ি 16:9 টিউটোরিয়াল, কোনো ফুটেজ নেই: উষ্ণ অন্ধকার বোর্ডে সরল করে আঁকা অ্যাপের জানালা, চ্যাট, ফোল্ডার আর কোডের ফাইল, টেবিল-আর-তাকের ডায়াগ্রাম, সুইচ চালু হওয়া, কার্ড; প্রতিটা জিনিস ঠিক বলা শব্দে আসে; উপরে অধ্যায়ের নাম আর দাগ; নিচে বাক্য-ধরে ক্যাপশন, বলা শব্দ সোনালি; শেষে ইনবক্স-কিওয়ার্ডের ৩ ধাপ | বেটা (প্রমাণ: projects/claude-skills-tutorial, ৫ মিনিট, ২০২৬-১১-০২) |

### মোশন-গ্রাফিক্স B-roll (কোডে বানানো, কোনো ফুটেজ লাগে না)

| কোড | নাম | কী লাগে | দেখতে কেমন | অবস্থা |
| --- | --- | --- | --- | --- |
| MG1 | সিগন্যাল কোর | কিছুই না | ৬ সেকেন্ড, 4K ৬০ fps: আলোর রেখা সোনালি সর্পিল বেয়ে আসে, ৩৪টা বিন্দু সূর্যমুখীর নকশায় স্প্রিংয়ে ফোটে, শক্তি কেন্দ্রে জমে, ষড়ভুজ খোলস খট করে বসে যায়। শব্দসহ আর শব্দ ছাড়া, দুটোই আছে | বেটা |
| MG2 | উন্নতির রেখা | কিছুই না | ৬ সেকেন্ড, 4K ৬০ fps: উজ্জ্বল রেখা নিচে থেকে উঠতে থাকে, ৯টা বিন্দুর উচ্চতা ফিবোনাচি সংখ্যা (১, ২, ৩, ৫ … ৫৫), গতি বাড়তে বাড়তে রেখা চূড়ায় পৌঁছায়। ক্যামেরা রেখার মাথার পিছু নেয়, তারপর পিছিয়ে পুরো ছবি দেখায়। চূড়ায় ঝলক আর ষড়ভুজ চিহ্ন, নিচের বিন্দুগুলো ঢেউয়ের মতো একবার লাফায়। ডান দিক ফাঁকা থাকে, সেখানে শিরোনাম বসানো যায়। শব্দসহ আর শব্দ ছাড়া, দুটোই আছে | বেটা |

<!-- studio:start -->
### মোশন স্টুডিও: ক্লায়েন্টের জন্য, কোডে আঁকা (২০২৬-১১-০৭ থেকে)

ক্লায়েন্ট বা আপনি শুধু কোড বলবেন। দাম আর বিস্তারিত: `docs/business/CATALOG.md`। স্কিল: `motion-studio`।

| কোড | নাম | দেখতে কেমন | কার জন্য | অবস্থা |
| --- | --- | --- | --- | --- |
| PL1 | প্রোডাক্ট লঞ্চ ফিল্ম | The hero video for a launch day: a big kinetic-type promise, the product UI floating in 3D space with a slow camera, three benefit beats, a light sweep and a logo lockup. Keynote-style. | Funded SaaS / AI startups launching or relaunching; Product Hunt and X launch posts; the landing-page hero. | বেটা (নমুনা: `renders/portfolio/PL1_Lumen.mp4`) |
| FD1 | নতুন ফিচারের ঘোষণা | One new feature in 15 seconds: a hook line, the cursor walks to the feature, a smooth punch-in on the UI moment, the result, a CTA. | SaaS teams that ship every week and post updates on X / LinkedIn; changelog emails. | বেটা (নমুনা: `renders/portfolio/FD1_Relay.mp4`) |
| UT1 | থ্রিডি অ্যাপ-ভ্রমণ | The app's screens as glass-edged panels in 3D space; the camera dollies from panel to panel (dashboard → pipeline → report) with parallax and depth of field. | Product pages, sales decks, investor demos — when the product has 3–5 key screens. | বেটা (নমুনা: `renders/portfolio/UT1_AtlasCRM.mp4`) |
| AP1 | অ্যাপ স্টোরের প্রিভিউ | A vertical phone-first preview: taps, swipes and screen changes inside a phone, short benefit captions, made to the App Store / Play Store preview limits (15–30 s). | Mobile app makers — App Store and Google Play listings, Reels and TikTok ads. | বেটা (নমুনা: `renders/portfolio/AP1_Habitly.mp4`) |
| CL1 | রিলিজ নোটের ভিডিও | "What's new in v3.0" — 4–6 updates in quick cuts: version stamp, icon + one line + a tiny UI snippet per update, a closing lockup. | Dev tools and SaaS with monthly releases; community and newsletter posts. | বেটা (নমুনা: `renders/portfolio/CL1_Ingot.mp4`) |
| IH1 | ইন্টিগ্রেশন দেখানো | The product as a glowing hub; app icons orbit in, beams connect them, data packets travel, a count of integrations lands. | Automation, API and platform companies announcing integrations or a marketplace. | বেটা (নমুনা: `renders/portfolio/IH1_Nimbus.mp4`) |
| AI1 | এআই এজেন্টের ডেমো | An AI agent at work: a prompt is typed, a labelled agent cursor clicks through a clean UI, status chips tick from 'working' to 'done', the result lands. The 2026 launch format for AI products. | AI startups showing an agent or copilot doing a real task; launch posts on X. | বেটা (নমুনা: `renders/portfolio/AI1_Deftly.mp4`) |
| HX1 | কীভাবে কাজ করে — ব্যাখ্যা | A voiced 45–90 s explainer: the problem, the turn, three simple steps with friendly flat illustration and icons, proof, CTA. Script, voice-over and music included. | Landing pages, onboarding, sales calls — health, fintech, B2B services that need clarity. | বেটা (নমুনা: `renders/portfolio/HX1_Hither.mp4`) |
| WF1 | কাজের ধাপের ডায়াগ্রাম | A process as a living diagram: nodes draw in, packets travel the paths, a branch splits on a condition, failures retry, success lights up the end. | Automation, fintech ops, logistics and B2B tools whose value is the workflow. | বেটা (নমুনা: `renders/portfolio/WF1_Ledgerly.mp4`) |
| IA1 | থ্রিডি স্তর-ভাগ ডায়াগ্রাম | Real 3D: the system's layers (edge, API, compute, data, encryption) float apart in an isometric stack with labels, data runs through them, they lock back together. | Infrastructure, security and developer platforms explaining 'how it is built'. | বেটা (নমুনা: `renders/portfolio/IA1_Vaultline.mp4`) |
| DS1 | ডেটার গল্প | Bloomberg / FT-style: a line chart draws itself, the key point is annotated, numbers count up, a comparison resolves — calm editorial type, one accent colour. | Research firms, fintech, reports, investor letters, LinkedIn thought leadership. | বেটা (নমুনা: `renders/portfolio/DS1_MeridianResearch.mp4`) |
| KP1 | বিনিয়োগকারীর জন্য মেট্রিক্স | A funding or milestone announcement: big KPI count-ups (ARR, growth, customers, countries), a growth curve, a donut, a lockup — confident and exact. | Startups announcing a round or a milestone; annual reviews; investor updates. | বেটা (নমুনা: `renders/portfolio/KP1_Northwind.mp4`) |
| MP1 | ম্যাপের গল্প | A world map: hubs light up, routes draw as arcs, a counter runs, the camera pushes into a region — for reach, logistics and expansion stories. | Logistics, travel, global SaaS expansion, NGOs showing reach. | বেটা (নমুনা: `renders/portfolio/MP1_Portolan.mp4`) |
| NW1 | সংবাদ-ধাঁচের ব্যাখ্যা | Vox-style: paper textures, headline cards, highlighter strokes over key lines, a document zoom, a hand-drawn arrow, a voiced narration on a real topic. | Media brands, newsletters, YouTube explainer channels, think tanks. | বেটা (নমুনা: `renders/portfolio/NW1_TheBrief.mp4`) |
| LG1 | থ্রিডি লোগো স্টিং | A 5–7 s logo reveal in real 3D: beveled letters flip up, light runs across the bevels, one sub-bass hit and a sparkle on the lock. | Every brand: video intros/outros, YouTube channels, event openers, ads. | বেটা (নমুনা: `renders/portfolio/LG1_Orbit.mp4`) |
| KT1 | নাচন্ত লেখার ম্যানিফেস্টো | A brand belief told in big moving type cut to the beat: words slam, split, swap and morph; colour blocks wipe; it ends on the brand line. | Brand campaigns, hiring videos, event openers, social posts with no footage. | বেটা (নমুনা: `renders/portfolio/KT1_Driftwood.mp4`) |
| BS1 | ব্র্যান্ড-গাইডলাইনের অ্যানিমেশন | The identity animated: logo construction, palette swatches, type specimen, pattern and real applications (cards, app icon, signage) — a living brand book. | Branding agencies presenting work; companies launching a rebrand. | বেটা (নমুনা: `renders/portfolio/BS1_Solace.mp4`) |
| SA1 | খাড়া সোশ্যাল বিজ্ঞাপন | A 15 s vertical ad built for the feed: the hook in the first second, three benefit beats, a big CTA, voice-over and captions inside the platform safe zones. | Performance marketers and DTC / app brands running Meta, TikTok and YouTube Shorts ads. | বেটা (নমুনা: `renders/portfolio/SA1_Pocket.mp4`) |
| EV1 | ইভেন্ট বা ওয়েবিনারের প্রোমো | Date, venue or link, speakers as clean monogram cards (no faces needed), the agenda in three beats, a countdown and a register button. | Conferences, webinars, launches, community meetups, workshops. | বেটা (নমুনা: `renders/portfolio/EV1_BuildersSummit.mp4`) |
| GH1 | থ্রিডি কাচের হিরো টাইটেল | Real 3D glass: a refracting glass form turns in front of a giant headline so the type bends through it, then the tagline lands — the most premium 8–10 seconds a brand can open with. | Landing-page heroes, keynote openers, premium product teasers. | বেটা (নমুনা: `renders/portfolio/GH1_Prism.mp4`) |
| CD1 | ডেভেলপার টুলের লঞ্চ | Syntax-highlighted code on a lit 3D slab rotating into a readable rest, a terminal run, the result — for developer products. | Dev tools, APIs, SDKs, open-source launches. | বেটা (নমুনা: `renders/portfolio/CD1_Kerf.mp4`) |
| LT1 | লোয়ার-থার্ড ও টাইটেল প্যাক | A matched set of name bars, section titles, callouts and end cards on a transparent background, in the client's brand, ready to drop on any edit. | YouTubers, podcasts, corporate video teams, event streams. | পরিকল্পনা |
<!-- studio:end -->

### তৈরি ভিডিও থেকে, সব প্ল্যাটফর্মের জন্য (রিলিজ)

| কোড | নাম | কী লাগে | দেখতে কেমন | অবস্থা |
| --- | --- | --- | --- | --- |
| UREEL1 | ইউনিভার্সাল রিল | একটা তৈরি মূল ভিডিও | খাড়া 9:16 রিল, একই ফাইল Facebook, Instagram, X আর YouTube Shorts-এ চলে। সব লেখা চার প্ল্যাটফর্মের নিরাপদ জায়গায়, শব্দে-শব্দে বাংলা ক্যাপশন, শেষ কার্ডে "আমার প্রোফাইলে দেখুন", নরম ছায়া, ৩ সেকেন্ডের বেশি স্থির নয় | বেটা |
| LI1 | LinkedIn কাট | একটা তৈরি মূল ভিডিও | 4:5 মাপ। শুরুতে ফলাফল, প্রথম ৪ সেকেন্ডে নাম-প্লেট, দুই লাইনের শান্ত বাংলা ক্যাপশন, শেষ কার্ডে "মেসেজ করুন" (কমেন্ট চাওয়া নয়) | বেটা |

### অন্যান্য

| কোড | নাম | কী লাগে | অবস্থা |
| --- | --- | --- | --- |
| CP1 | ক্লায়েন্ট প্রোমো | ক্লায়েন্টের নম্বর দেওয়া AI ক্লিপ (1.mp4, 2.mp4 …), তাদের ভয়েস আর BGM। প্রতিটা কাট আর লেখা ঠিক বলা শব্দে; 16:9 আর আলাদা সাজানো 9:16 একসাথে | তৈরি (মোহনা অ্যাগ্রো ফুড, ২০২৬-১১-০৪) |
| AIGEN | AI-তৈরি B-roll | একটা AI ভিডিও সার্ভিস (টাকা লাগে, আপনার সিদ্ধান্ত) | পরিকল্পনা |

## ৪. একই ভিডিওতে স্টাইল মেশানো

AB স্টাইলগুলো একটা ভিডিওর আলাদা আলাদা অংশে বসানো যায়। যেমন:
- **AB3** দিয়ে শুরুর হুক।
- **AB1** দিয়ে ব্যাখ্যা।
- তালিকা এলে **AB4**।
- সংখ্যা এলে **AB5**।
- গল্প বা ভবিষ্যতের কথায় **AB2**।

পরিকল্পনায় আমি দেখাব কোন অংশে কোন স্টাইল বসছে।

## ৫. B-roll কোথা থেকে আসে

1. **আপনার নিজের ক্লিপ।** যেমন আপনার বানানো AI ক্লিপ।
2. **কোডে আঁকা দৃশ্য।** সিঁড়ি বেয়ে লক্ষ্যে ওঠা, প্রাচীন মন্দির, শহরের স্কাইলাইন, নিউরাল নেটওয়ার্ক, সংখ্যার বার-চার্ট, আকার বদলানো নকশা। খরচ নেই, লাইসেন্সের ঝামেলা নেই।
3. **ফ্রি স্টক ভিডিও আর ছবি (Pixabay)।** এর জন্য একটা ফ্রি "API key" (চাবি-কোড) লাগে। আপনি pixabay.com/api/docs থেকে নিয়ে `.env.local` ফাইলে `PIXABAY_API_KEY=` এর পরে বসাবেন। চ্যাটে কখনো লিখবেন না। (Pexels এখন নতুন চাবি দিচ্ছে না।)
4. **AI দিয়ে বানানো ক্লিপ।** আপনার ল্যাপটপে NVIDIA গ্রাফিক্স কার্ড নেই, তাই ComfyUI + Wan এখানে চলবে না: ৫ সেকেন্ডের ক্লিপে আনুমানিক ১০–৭০ ঘণ্টা লাগবে।
   সাশ্রয়ী পথ হলো প্রতি ক্লিপ অনুযায়ী টাকা দেওয়া অনলাইন সার্ভিস: প্রতি ৫ সেকেন্ডের ক্লিপে আনুমানিক ২০–৫০ সেন্ট, মাসে ২০টা ক্লিপে ৪–১০ ডলার।
   কোনটা নেবেন আর টাকা খরচ করবেন কি না, সেটা আপনার সিদ্ধান্ত। পুরো তুলনা আছে `docs/ai-video-generation.md`-এ।
