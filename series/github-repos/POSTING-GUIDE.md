# GitHub সিরিজ: কোথায় কোন লেখা আর হ্যাশট্যাগ (গবেষণা ৩ নভেম্বর ২০২৬)

প্রতিটা পর্বের লেখা তিন জায়গায় একই আছে, যেখান থেকে সুবিধা সেখান থেকে কপি করবেন:
1. **ফোনে সবচেয়ে সহজ:** `renders/<পর্ব>/release/` ফোল্ডারে প্রতিটা প্ল্যাটফর্মের ফোল্ডারে ভিডিওর পাশে লেখার ফাইল।
   - `1-YouTube/reel-shorts.txt`: টাইটেল + বিবরণ + Tags
   - `2-Facebook/reel-caption.txt`: ক্যাপশন + নিজের প্রথম কমেন্ট
   - `3-Instagram/reel-caption.txt`: ক্যাপশন
   - `4-X/reel-post.txt`: পোস্ট + নিচের উত্তর
   - `5-LinkedIn/linkedin-post.txt`: পোস্ট
2. **সব এক পাতায়:** `release/RELEASE.md` (আপলোডের চেকলিস্ট, প্রতিটা লেখা আলাদা বক্সে)।
3. **মূল ফাইল:** `projects/<পর্ব>/RELEASE-COPY.md` (এখানে বদলালে আমি আবার সব জায়গায় বসিয়ে দেব)।

প্রতিটা লেখা যন্ত্রে পরীক্ষা করা (`node tools/release/copy-check.mjs`): হ্যাশট্যাগের সংখ্যা, প্রথম লাইনের দৈর্ঘ্য, লেখায় লিংক নেই।

## প্ল্যাটফর্মের নিয়ম (গবেষণা থেকে)

| প্ল্যাটফর্ম | হ্যাশট্যাগ | লেখা কেমন | লিংক কোথায় |
| --- | --- | --- | --- |
| Facebook Reel | ৪টা | ছোট (৩০–৬০ শব্দ সবচেয়ে ভালো চলে), প্রথম লাইনেই মূল কথা, কারণ Facebook সার্চ ক্যাপশন পড়ে | প্রথম কমেন্টে (লেখা দেওয়া আছে) |
| Instagram Reel | ৫টা (ডিসেম্বর ২০২৫ থেকে এর বেশি দেওয়া যায় না, কমেন্টের হ্যাশট্যাগও গোনা হয়) | প্রথম ~১২৫ অক্ষরই ফিডে দেখা যায়, তাই প্রথম লাইনে মূল কথা; তারপর ৫টা টুলের এক লাইনের তালিকা (Instagram সার্চ এই শব্দগুলো পড়ে) | ক্যাপশনে লিংকে ক্লিক হয় না: প্রোফাইলের Message বাটন বা Bio |
| YouTube Shorts | বিবরণে ৩টা (প্রথম ৩টা টাইটেলের উপরে দেখায়; ১৫-র বেশি দিলে সব বাদ) | টাইটেল ১০০ অক্ষরের মধ্যে, শেষে #Shorts; বিবরণে নতুন কথা আর ৫টা টুলের নাম; Tags বক্সে খোঁজার শব্দ | Shorts-এর বিবরণ আর কমেন্টে লিংকে ক্লিক হয় না: চ্যানেলের প্রোফাইলে (Customize channel → Links) Facebook পেজের লিংক একবার বসিয়ে রাখুন |
| X | ৩টা (একটাই ক্যাপশন) | ২৮০-র মধ্যে (ইংরেজি অক্ষর দুটো গোনা হয়) | নিজের পোস্টের নিচে উত্তরে |

**সিরিজের হ্যাশট্যাগ #GitHubBangla:** Facebook আর Instagram-এর প্রতিটা পর্বে আছে, যাতে কেউ চাপলে পুরো সিরিজ এক জায়গায় পায়।
আপনার পেজের নিজের নামের কোনো ট্যাগ রাখতে চাইলে বলবেন, আমি এটার জায়গায় বসিয়ে দেব।

একটা সত্যি কথা: হ্যাশট্যাগ সামান্য সাহায্য করে। রিচ আসে প্রথম ৩ সেকেন্ডের হুক, পুরোটা দেখা, শেয়ার আর ইনবক্সের মেসেজ থেকে।

## প্রতিটা পর্বের হ্যাশট্যাগ

| পর্ব | Facebook (৪) | Instagram (৫) | YouTube Shorts (৩) |
| --- | --- | --- | --- |
| ১ ফোন | #GitHub #AndroidTips #বাংলা_টেক #GitHubBangla | + #FreeApps | #GitHub #AndroidTips #বাংলা_টেক |
| ২ ল্যাপটপ | #GitHub #WindowsTips #বাংলা_টেক #GitHubBangla | + #PCTips | #GitHub #WindowsTips #বাংলা_টেক |
| ৩ নিরাপত্তা | #GitHub #CyberSecurity #বাংলা_টেক #GitHubBangla | + #OnlineSafety | #CyberSecurity #GitHub #বাংলা_টেক |
| ৪ ক্রিয়েটর | #GitHub #VideoEditing #বাংলা_টেক #GitHubBangla | + #ContentCreator | #VideoEditing #GitHub #বাংলা_টেক |
| ৫ অফলাইন AI | #GitHub #LocalAI #বাংলা_টেক #GitHubBangla | + #AITools | #LocalAI #GitHub #বাংলা_টেক |
| ৬ অফিস | #GitHub #Freelancing #বাংলা_টেক #GitHubBangla | + #Productivity | #Freelancing #GitHub #বাংলা_টেক |
| ৭ শেখা | #GitHub #LearnToCode #বাংলা_টেক #GitHubBangla | + #FreeCourses | #LearnToCode #GitHub #বাংলা_টেক |
| ৮ বাংলা | #OpenSource #বাংলা_ভাষা #বাংলা_টেক #GitHubBangla | + #GitHub | #OpenSource #বাংলা_ভাষা #বাংলা_টেক |
| ৯ অটোমেশন | #GitHub #Automation #বাংলা_টেক #GitHubBangla | + #NoCode | #Automation #NoCode #বাংলা_টেক |
| ১০ Claude Code | #ClaudeCode #GitHub #বাংলা_টেক #GitHubBangla | + #AITools | #ClaudeCode #GitHub #বাংলা_টেক |

## পোস্ট করার আগে একবার

- Facebook আর Instagram-এ পোস্টের সময় "AI info" লেবেল চালু করবেন (গলাটা আপনার ক্লোন)। বিস্তারিত প্রতিটা `RELEASE.md`-এর শুরুতে।
- Facebook আর Instagram-এ কিওয়ার্ডের অটো-রিপ্লাই চালু রাখবেন (মেসেজের লেখা `INBOX-AND-COMMUNITY.md`-এ)।
- YouTube চ্যানেলের প্রোফাইলে Facebook পেজের লিংক বসাবেন, কারণ Shorts-এর বিবরণ সেখানেই পাঠায়।

## গবেষণার সূত্র (৩ নভেম্বর ২০২৬)

- Instagram ৫ হ্যাশট্যাগ, ১২৫ অক্ষর: [Later](https://later.com/blog/instagram-hashtags/amp), [digitalapplied](https://www.digitalapplied.com/blog/instagram-limits-hashtags-5-organic-reach-strategy-2026), [InstantDM](https://instantdm.com/blog/instagram-hashtags), [trymypost](https://www.trymypost.com/blog/instagram-reels-caption-optimization-strategy-2026)
- YouTube Shorts: [hashtagtools.io](https://hashtagtools.io/blog/youtube-shorts-hashtags-title-vs-description-2026), [vidIQ](https://vidiq.com/fr/blog/post/youtube-shorts-titles), [touhfa](https://touhfa.art/blog/seo/youtube-hashtags-guide/)
- Facebook Reels: [Socialinsider](https://www.socialinsider.io/blog/social-media-caption-length-best-practices/), [ContentStudio](https://contentstudio.io/blog/facebook-hashtags), [Lilach Bullock](https://www.lilachbullock.com/how-many-hashtags-facebook-reels/)
- বেশির ভাগ সূত্র মার্কেটিং ব্লগ, প্ল্যাটফর্মের নিজের পাতা নয়। Instagram-এর ৫টা হ্যাশট্যাগের সীমা প্রায় সব সূত্রে আছে, কিন্তু Instagram-এর Help Center-এ নিজে যাচাই করা হয়নি।
