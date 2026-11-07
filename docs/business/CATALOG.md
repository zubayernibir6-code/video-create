# সার্ভিস-তালিকা (CATALOG)

এই ফাইল যন্ত্রে তৈরি হয় `tools/studio/catalog.json` থেকে (`node tools/studio/catalog-doc.mjs`)। হাতে বদলাবেন না, catalog.json বদলান।
শেষ আপডেট: 2026-11-07।

**কীভাবে ব্যবহার করবেন:** ক্লায়েন্ট বা আপনি শুধু কোড বলবেন (যেমন "PL1, Lumen-এর মতো, আমাদের ব্র্যান্ডে")। Claude সেই কোডের ধাঁচ, দৈর্ঘ্য, মিউজিক আর ফন্ট নিয়ে প্রজেক্ট খুলবে:
`node tools/studio/new-piece.mjs <নাম> --code=PL1 --brand="ক্লায়েন্টের নাম"`

দাম তিন ধাপে: **শুরু / মাঝারি / প্রিমিয়াম** (USD, বিদেশি ক্লায়েন্ট)। দেশি ক্লায়েন্টের দাম টাকায় আলাদা কলামে। প্রথম ৩ ক্লায়েন্টে "শুরু" দাম, রিভিউর বদলে (প্লেবুক §৩)। সব নমুনা কাল্পনিক ব্র্যান্ডের কনসেপ্ট কাজ।

## প্রোডাক্ট ও SaaS (Product & SaaS)

| কোড | নাম | কী | কার জন্য | মাপ · দৈর্ঘ্য | দাম (USD) | টাকায় | নমুনা |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **PL1** | প্রোডাক্ট লঞ্চ ফিল্ম<br>Product Launch Film | The hero video for a launch day: a big kinetic-type promise, the product UI floating in 3D space with a slow camera, three benefit beats, a light sweep and a logo lockup. Keynote-style. | Funded SaaS / AI startups launching or relaunching; Product Hunt and X launch posts; the landing-page hero. | 16x9, 1x1, 9x16 · ৩০–৬০ সে. | $১,২০০ / $২,৫০০ / $৪,৫০০ | ৳1,20,000–3,50,000 | ✅ `renders/portfolio/PL1_Lumen.mp4` |
| **FD1** | নতুন ফিচারের ঘোষণা<br>Feature Drop | One new feature in 15 seconds: a hook line, the cursor walks to the feature, a smooth punch-in on the UI moment, the result, a CTA. | SaaS teams that ship every week and post updates on X / LinkedIn; changelog emails. | 16x9, 1x1 · ১০–২০ সে. | $৪৫০ / $৯০০ / $১,৫০০ | ৳40,000–90,000 | ✅ `renders/portfolio/FD1_Relay.mp4` |
| **UT1** | থ্রিডি অ্যাপ-ভ্রমণ<br>3D UI Tour | The app's screens as glass-edged panels in 3D space; the camera dollies from panel to panel (dashboard → pipeline → report) with parallax and depth of field. | Product pages, sales decks, investor demos — when the product has 3–5 key screens. | 16x9 · ২০–৪৫ সে. | $৯০০ / $১,৮০০ / $৩,২০০ | ৳90,000–2,50,000 | ✅ `renders/portfolio/UT1_AtlasCRM.mp4` |
| **AP1** | অ্যাপ স্টোরের প্রিভিউ<br>App Store Preview | A vertical phone-first preview: taps, swipes and screen changes inside a phone, short benefit captions, made to the App Store / Play Store preview limits (15–30 s). | Mobile app makers — App Store and Google Play listings, Reels and TikTok ads. | 9x16 · ১৫–৩০ সে. | $৬০০ / $১,২০০ / $২,৫০০ | ৳50,000–1,50,000 | ✅ `renders/portfolio/AP1_Habitly.mp4` |
| **CL1** | রিলিজ নোটের ভিডিও<br>Changelog / Release Reel | "What's new in v3.0" — 4–6 updates in quick cuts: version stamp, icon + one line + a tiny UI snippet per update, a closing lockup. | Dev tools and SaaS with monthly releases; community and newsletter posts. | 16x9, 1x1 · ১৫–৩০ সে. | $৫০০ / $১,০০০ / $১,৮০০ | ৳40,000–1,00,000 | ⏳ pf-cl1-forge |
| **IH1** | ইন্টিগ্রেশন দেখানো<br>Integrations Hub | The product as a glowing hub; app icons orbit in, beams connect them, data packets travel, a count of integrations lands. | Automation, API and platform companies announcing integrations or a marketplace. | 1x1, 16x9 · ৮–২০ সে. | $৪০০ / $৮০০ / $১,৪০০ | ৳35,000–80,000 | ⏳ pf-ih1-nimbus |
| **AI1** | এআই এজেন্টের ডেমো<br>AI Agent Demo | An AI agent at work: a prompt is typed, a labelled agent cursor clicks through a clean UI, status chips tick from 'working' to 'done', the result lands. The 2026 launch format for AI products. | AI startups showing an agent or copilot doing a real task; launch posts on X. | 16x9, 1x1 · ১৫–৪০ সে. | $৮০০ / $১,৬০০ / $৩,০০০ | ৳80,000–2,00,000 | ✅ `renders/portfolio/AI1_Operator.mp4` |

## ব্যাখ্যা ভিডিও (Explainers)

| কোড | নাম | কী | কার জন্য | মাপ · দৈর্ঘ্য | দাম (USD) | টাকায় | নমুনা |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **HX1** | কীভাবে কাজ করে — ব্যাখ্যা<br>How-It-Works Explainer | A voiced 45–90 s explainer: the problem, the turn, three simple steps with friendly flat illustration and icons, proof, CTA. Script, voice-over and music included. | Landing pages, onboarding, sales calls — health, fintech, B2B services that need clarity. | 16x9, 1x1 · ৪৫–১২০ সে. | $১,৫০০ / $৩,০০০ / $৫,৫০০ | ৳1,00,000–3,00,000 | ⏳ pf-hx1-kindred |
| **WF1** | কাজের ধাপের ডায়াগ্রাম<br>Workflow Diagram in Motion | A process as a living diagram: nodes draw in, packets travel the paths, a branch splits on a condition, failures retry, success lights up the end. | Automation, fintech ops, logistics and B2B tools whose value is the workflow. | 16x9 · ১৫–৪০ সে. | $৬০০ / $১,২০০ / $২,২০০ | ৳50,000–1,20,000 | ⏳ pf-wf1-ledgerly |
| **IA1** | থ্রিডি স্তর-ভাগ ডায়াগ্রাম<br>3D Architecture Stack | Real 3D: the system's layers (edge, API, compute, data, encryption) float apart in an isometric stack with labels, data runs through them, they lock back together. | Infrastructure, security and developer platforms explaining 'how it is built'. | 16x9 · ১২–৩০ সে. | $৯০০ / $১,৮০০ / $৩,৫০০ | ৳90,000–2,50,000 | ✅ `renders/portfolio/IA1_Vaultline.mp4` |

## ডেটা ও সংবাদ-ধাঁচ (Data & Editorial)

| কোড | নাম | কী | কার জন্য | মাপ · দৈর্ঘ্য | দাম (USD) | টাকায় | নমুনা |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **DS1** | ডেটার গল্প<br>Data Story | Bloomberg / FT-style: a line chart draws itself, the key point is annotated, numbers count up, a comparison resolves — calm editorial type, one accent colour. | Research firms, fintech, reports, investor letters, LinkedIn thought leadership. | 16x9, 1x1 · ১৫–৪৫ সে. | $৫০০ / $১,১০০ / $২,০০০ | ৳45,000–1,20,000 | ✅ `renders/portfolio/DS1_MeridianResearch.mp4` |
| **KP1** | বিনিয়োগকারীর জন্য মেট্রিক্স<br>Investor Metrics Reel | A funding or milestone announcement: big KPI count-ups (ARR, growth, customers, countries), a growth curve, a donut, a lockup — confident and exact. | Startups announcing a round or a milestone; annual reviews; investor updates. | 16x9, 1x1, 9x16 · ১২–৩০ সে. | $৫০০ / $১,০০০ / $১,৮০০ | ৳45,000–1,00,000 | ⏳ pf-kp1-northwind |
| **MP1** | ম্যাপের গল্প<br>Map Story | A world map: hubs light up, routes draw as arcs, a counter runs, the camera pushes into a region — for reach, logistics and expansion stories. | Logistics, travel, global SaaS expansion, NGOs showing reach. | 16x9 · ১২–৩০ সে. | $৬০০ / $১,২০০ / $২,২০০ | ৳50,000–1,20,000 | ⏳ pf-mp1-cargoline |
| **NW1** | সংবাদ-ধাঁচের ব্যাখ্যা<br>Editorial Explainer | Vox-style: paper textures, headline cards, highlighter strokes over key lines, a document zoom, a hand-drawn arrow, a voiced narration on a real topic. | Media brands, newsletters, YouTube explainer channels, think tanks. | 16x9, 9x16 · ২০–৯০ সে. | $৭০০ / $১,৫০০ / $৩,০০০ | ৳60,000–1,50,000 | ⏳ pf-nw1-thebrief |

## ব্র্যান্ড (Brand)

| কোড | নাম | কী | কার জন্য | মাপ · দৈর্ঘ্য | দাম (USD) | টাকায় | নমুনা |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **LG1** | থ্রিডি লোগো স্টিং<br>3D Logo Sting | A 5–7 s logo reveal in real 3D: beveled letters flip up, light runs across the bevels, one sub-bass hit and a sparkle on the lock. | Every brand: video intros/outros, YouTube channels, event openers, ads. | 16x9, 1x1, 9x16 · ৪–৮ সে. | $২৫০ / $৫০০ / $৯০০ | ৳15,000–50,000 | ✅ `renders/portfolio/LG1_Orbit.mp4` |
| **KT1** | নাচন্ত লেখার ম্যানিফেস্টো<br>Kinetic Type Manifesto | A brand belief told in big moving type cut to the beat: words slam, split, swap and morph; colour blocks wipe; it ends on the brand line. | Brand campaigns, hiring videos, event openers, social posts with no footage. | 16x9, 9x16, 1x1 · ১৫–৪০ সে. | $৫০০ / $১,০০০ / $২,০০০ | ৳40,000–1,00,000 | ✅ `renders/portfolio/KT1_Driftwood.mp4` |
| **BS1** | ব্র্যান্ড-গাইডলাইনের অ্যানিমেশন<br>Brand System in Motion | The identity animated: logo construction, palette swatches, type specimen, pattern and real applications (cards, app icon, signage) — a living brand book. | Branding agencies presenting work; companies launching a rebrand. | 16x9 · ১৫–৪৫ সে. | $৭০০ / $১,৪০০ / $২,৬০০ | ৳60,000–1,50,000 | ⏳ pf-bs1-solace |

## সোশ্যাল ও বিজ্ঞাপন (Social & Ads)

| কোড | নাম | কী | কার জন্য | মাপ · দৈর্ঘ্য | দাম (USD) | টাকায় | নমুনা |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **SA1** | খাড়া সোশ্যাল বিজ্ঞাপন<br>Vertical Social Ad | A 15 s vertical ad built for the feed: the hook in the first second, three benefit beats, a big CTA, voice-over and captions inside the platform safe zones. | Performance marketers and DTC / app brands running Meta, TikTok and YouTube Shorts ads. | 9x16, 4x5, 1x1 · ৬–৩০ সে. | $২৫০ / $৪৫০ / $৮০০ | ৳15,000–40,000 | ⏳ pf-sa1-pocket |
| **EV1** | ইভেন্ট বা ওয়েবিনারের প্রোমো<br>Event / Webinar Promo | Date, venue or link, speakers as clean monogram cards (no faces needed), the agenda in three beats, a countdown and a register button. | Conferences, webinars, launches, community meetups, workshops. | 1x1, 9x16, 16x9 · ১০–২০ সে. | $৩০০ / $৬০০ / $১,০০০ | ৳20,000–60,000 | ⏳ pf-ev1-builders |

## থ্রিডি ও প্রিমিয়াম (3D & Premium)

| কোড | নাম | কী | কার জন্য | মাপ · দৈর্ঘ্য | দাম (USD) | টাকায় | নমুনা |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **GH1** | থ্রিডি কাচের হিরো টাইটেল<br>3D Glass Hero Title | Real 3D glass: a refracting glass form turns in front of a giant headline so the type bends through it, then the tagline lands — the most premium 8–10 seconds a brand can open with. | Landing-page heroes, keynote openers, premium product teasers. | 16x9, 9x16 · ৬–১৫ সে. | $৬০০ / $১,২০০ / $২,৪০০ | ৳60,000–1,50,000 | ✅ `renders/portfolio/GH1_Prism.mp4` |
| **CD1** | ডেভেলপার টুলের লঞ্চ<br>Dev-Tool Launch (3D code) | Syntax-highlighted code on a lit 3D slab rotating into a readable rest, a terminal run, the result — for developer products. | Dev tools, APIs, SDKs, open-source launches. | 16x9 · ১০–৩০ সে. | $৬০০ / $১,২০০ / $২,২০০ | ৳50,000–1,20,000 | ⏳ pf-cd1-kernel |
| **LT1** | লোয়ার-থার্ড ও টাইটেল প্যাক<br>Lower-Thirds & Titles Pack | A matched set of name bars, section titles, callouts and end cards on a transparent background, in the client's brand, ready to drop on any edit. | YouTubers, podcasts, corporate video teams, event streams. | 16x9, 9x16 · ৮–২০ সে. | $৩০০ / $৬০০ / $১,২০০ | ৳20,000–60,000 | — |

## ফুটেজ এডিটিং (Footage Editing)

| কোড | নাম | কী | কার জন্য | মাপ · দৈর্ঘ্য | দাম (USD) | টাকায় | নমুনা |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **FM1** | ফুটেজ + মোশন প্রোমো<br>Footage + Motion Promo | Real footage (the client's own or licensed stock) cut on the beat, warm cinematic grade and letterbox, kinetic titles, tracked-style callouts on the footage, a lower third and a brand end card. | Cafés, restaurants, retail, real estate, travel and DTC brands that have product or place footage. | 16x9, 9x16 · ১৫–৪৫ সে. | $৪০০ / $৯০০ / $১,৮০০ | ৳25,000–90,000 | ✅ `renders/portfolio/FM1_EmberOak.mp4` |
| **AB1-AB5** | কথা বলার ভিডিও + বি-রোল (৫ ধরন)<br>Talking Head + B-roll (5 styles) | Your talking-head recording edited in one of five named styles: Glass Split, Bubble Cut, Punch Type, Card Fan, Data Stage. | Creators, coaches, founders on camera. | 16x9, 9x16 | $১৫০ / $৪০০ / $৯০০ | ৳8,000–40,000 | ✅ abroll-variants-demo |
| **EP1** | লম্বা পর্ব + রিলস<br>Long Episode + Reels | A long talking-head episode with motion-graphics cards and word-by-word captions, plus vertical Reels cut from it. | YouTube channels, podcasts, courses. | 16x9, 9x16 | $৩০০ / $৭০০ / $১,৫০০ | ৳15,000–60,000 | ✅ zubayer-ep01 |
| **TUT1** | স্ক্রিন টিউটোরিয়াল<br>Screen Tutorial | A long screen recording + voice turned into a clean 16:9 tutorial with zooms, cursor glow, chapter cards and captions. | SaaS onboarding, course creators, software trainers. | 16x9 | $২৫০ / $৬০০ / $১,২০০ | ৳12,000–50,000 | ✅ claude-video-tutorial |
| **PROMO1** | স্ক্রিন রেকর্ডিং থেকে বিজ্ঞাপন<br>Screen-Recording Commercial | A screen recording of an app turned into a commercial: zooms onto UI moments, cursor glow, 3D tilt, click boom, end card. | SaaS and app makers who already have the product running. | 16x9, 9x16 | $৪০০ / $৯০০ / $১,৮০০ | ৳25,000–80,000 | ✅ claude-decision-ad |
| **CP1** | এআই ক্লিপ থেকে ক্লায়েন্ট প্রোমো<br>AI-Clip Client Promo | A client's AI-generated clips + voice + music cut into a production-ready promo, 16:9 and a designed 9:16. | Local businesses with AI clips — food, retail, real estate. | 16x9, 9x16 | $২০০ / $৪৫০ / $৯০০ | ৳10,000–40,000 | ✅ mohona-promo-01 |
| **UREEL1** | সব প্ল্যাটফর্মের রিলস<br>Universal Reels Cut-downs | Vertical Reels cut from a finished video that upload unchanged to Facebook, Instagram, X and YouTube Shorts. | Anyone with a long video who needs short-form reach. | 9x16 | $৬০ / $১৫০ / $৩০০ | ৳3,000–12,000 per reel | ✅ claude-ureel-1 |
| **EXP1** | বাংলা ব্যাখ্যা বোর্ড<br>Bengali Explainer Board | A voiced Bengali tutorial with no footage: drawn app windows, chats, folders, code, diagrams; captions with the spoken word in gold. | Bangladeshi edtech, NGOs, local SaaS, course creators. | 16x9 | $২০০ / $৫০০ / $১,০০০ | ৳15,000–60,000 | ✅ claude-skills-tutorial |

## প্যাকেজ ও মাসিক চুক্তি (Packages & Retainers)

| কোড | নাম | কী | কার জন্য | মাপ · দৈর্ঘ্য | দাম (USD) | টাকায় | নমুনা |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **LK1** | লঞ্চ কিট<br>Launch Kit | PL1 launch film + FD1 feature drops ×2 + KP1 metrics + 9:16 / 1:1 cut-downs + LG1 sting — everything for one launch week. | Startups with a launch date. |  | $২,৫০০ / $৪,৫০০ / $৮,০০০ | ৳2,50,000–6,00,000 | — |
| **AD10** | ১০টা বিজ্ঞাপনের প্যাক<br>Ad Pack ×10 | Ten vertical SA1 ads from one brief: 3 hooks × 3 angles + 1 offer, all aspect ratios, captions — built to A/B test. | DTC and app brands spending on Meta / TikTok ads. | 9x16, 4x5, 1x1 · ৬–৩০ সে. | $১,০০০ / $২,০০০ / $৩,৫০০ | ৳35,000–1,20,000 | ✅ `renders/portfolio/AD10_BazarGhor.mp4` |
| **RET1** | মাসিক মোশন চুক্তি<br>Monthly Motion Retainer | A set number of pieces every month (e.g. 4 feature drops + 8 social ads + 1 data story), one request queue, 48-hour turnaround on small pieces. | SaaS marketing teams and agencies that ship constantly. |  | $১,৫০০ / $৩,০০০ / $৬,০০০ | ৳1,00,000–4,00,000 / month | — |

---
কোডগুলো `VARIANTS.md` আর `tools/variants.json`-এও আছে। নতুন ধাঁচ মানে নতুন কোড + প্রমাণ-ভিডিও (CLAUDE.md §0g)।
