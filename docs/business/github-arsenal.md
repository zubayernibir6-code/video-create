# GitHub-এর হাতিয়ার: কোন টুল কখন কাজে লাগবে

স্টারের সংখ্যা ৭ নভেম্বর ২০২৬-এ GitHub থেকে সরাসরি তোলা (API আর রেপোর পাতা)। স্টার মানে কতজন মানুষ রেপোটা পছন্দ করে বা চোখে রেখেছে।

লাইসেন্সের কলামে লেখা আছে ক্লায়েন্টের বিক্রির কাজে চলবে কি না। "দেখে নিন" মানে কোডের লাইসেন্স ঠিক আছে, কিন্তু মডেল বা অংশবিশেষের লাইসেন্স আলাদা।

## ক. যা আমরা এখনই চালাই (এই ফোল্ডারের ভিত্তি)

| রেপো | স্টার | লাইসেন্স | কী কাজে | আমাদের কোথায় |
| --- | --- | --- | --- | --- |
| heygen-com/hyperframes | ৮০,৩৯২ | Apache-2.0 ✔ | HTML লিখলেই ভিডিও, ফ্রেম ধরে রেন্ডার | সব ভিডিওর ইঞ্জিন (v0.8.134-এ আটকানো) |
| greensock/GSAP | ৩০,২৮১ | GSAP Standard (২০২৫ থেকে বাণিজ্যিক কাজেও ফ্রি) ✔ | সবচেয়ে মসৃণ অ্যানিমেশন, SplitText, MorphSVG, DrawSVG | `tools/studio/runtime/studio.js`-এর ভিত |
| mrdoob/three.js | ১,১৭,৭৯২ | MIT ✔ | আসল থ্রিডি (কাচ, ধাতু, আলো) | `assets/js/three` (r184), GH1/LG1/IA1 |
| FFmpeg/FFmpeg | ৬৬,৬৮৮ | LGPL/GPL ✔ (ব্যবহারে সমস্যা নেই) | কাটা, জোড়া, এনকোড, শব্দের মাপ | finish.mjs, qc.mjs, contact-sheet |
| ggml-org/whisper.cpp | ৫৪,৯৯৪ | MIT ✔ | কথা থেকে লেখা, শব্দের সময় | transcribe.mjs |
| airbnb/lottie-web | ৩২,৩৭৪ | MIT ✔ | After Effects-এর অ্যানিমেশন ওয়েবে চালানো | assets/js/lottie.min.js |
| juliangarnier/anime | ৭৪,৩৮৯ | MIT ✔ | হালকা অ্যানিমেশন ইঞ্জিন | assets/js (বিকল্প) |
| anthropics/skills | ১,৮৮,৪৫৬ | বেশিরভাগ Apache-2.0 (কয়েকটা আলাদা) | Claude-এর স্কিল লেখার অফিসিয়াল নমুনা | আমাদের `.claude/skills/*` একই ধাঁচে |

## খ. দরকার হলে ডাকব (প্রস্তুত, কিন্তু প্রতিদিন লাগে না)

| রেপো | স্টার | লাইসেন্স | কখন ডাকব |
| --- | --- | --- | --- |
| 3b1b/manim · ManimCommunity/manim | ৯৬,২৩০ · ৪২,৩২৪ | MIT ✔ | অঙ্ক, সূত্র, গ্রাফের নিখুঁত ব্যাখ্যা-ভিডিও (শিক্ষা চ্যানেলের ক্লায়েন্ট) |
| remotion-dev/remotion | ৭১,৪৪৯ | নিজস্ব: ৩ জন পর্যন্ত কোম্পানিতে ফ্রি, তার বেশি হলে লাইসেন্স কিনতে হয় | ক্লায়েন্ট নিজে React-এ টেমপ্লেট চাইলে |
| motiondivision/motion | ৩৪,৯৮৮ | MIT ✔ | ক্লায়েন্টের ওয়েবসাইটের ইন্টার‍্যাকটিভ অ্যানিমেশন |
| pmndrs/react-three-fiber | ৩৩,৫৫৬ | MIT ✔ | React-এ থ্রিডি (ওয়েব প্রজেক্টে) |
| motion-canvas/motion-canvas | ১৯,৭১৭ | MIT ✔ | কোড দিয়ে ব্যাখ্যা-অ্যানিমেশন (বিকল্প ইঞ্জিন) |
| redotvideo/revideo | ৪,১৮৬ | MIT ✔ | অনেক ভিডিও একসাথে ডেটা থেকে (ভবিষ্যতের SaaS) |
| Zulko/moviepy | ১৫,১১৮ | MIT ✔ | পাইথনে সহজ ভিডিও এডিট |
| mifi/editly | ৫,৫৯০ | MIT ✔ | JSON থেকে দ্রুত স্লাইড-ভিডিও |
| gl-transitions/gl-transitions | ২,২৩৫ | প্রতিটা ট্রানজিশনের নিজের লাইসেন্স, বেশিরভাগ MIT (দেখে নিন) | ১০০+ শেডার ট্রানজিশন (দৃশ্য বদলের নতুন ধরন) |
| rive-app/rive-wasm | ১,০২০ | MIT ✔ | ইন্টার‍্যাকটিভ অ্যানিমেশন (ওয়েব আর অ্যাপ ক্লায়েন্ট) |
| pixijs/pixijs | ৪৮,৬৪৪ | MIT ✔ | দ্রুত 2D গ্রাফিক্স, কণা-ইফেক্ট |
| vercel/satori | ১৪,১৬৭ | MPL-2.0 ✔ | কোড থেকে থাম্বনেইল আর সোশ্যাল ছবি |
| danielgatis/rembg | ২৫,৩৭৩ | MIT (কোড) ✔, কিছু মডেল অবাণিজ্যিক (দেখে নিন) | ছবির পেছন সরানো |
| xinntao/Real-ESRGAN | ৩৭,৪০২ | BSD-3 ✔ | ক্লায়েন্টের ঝাপসা ছবি বা লোগো বড় করা |
| hzwer/Practical-RIFE | ১,০৩৮ | MIT ✔ | ফ্রেম বাড়িয়ে স্লো-মোশন (30 থেকে 60 fps) |
| m-bain/whisperX | ২৫,১৩৯ | BSD-2 ✔ | আরো নিখুঁত শব্দ-সময় (ইংরেজি) |
| hexgrad/kokoro | ৯,৯৫২ | Apache-2.0 ✔ | ফ্রি ইংরেজি AI ভয়েস (অফলাইন) |
| resemble-ai/chatterbox | ২৭,৬৪১ | MIT ✔ | ফ্রি AI ভয়েস, আবেগসহ (পরীক্ষা বাকি) |
| WyattBlue/auto-editor | ৫,৮০২ | Unlicense ✔ | ফুটেজের নীরবতা নিজে নিজে কাটা |
| Wan-Video/Wan2.1 | ১৭,৪০০ | Apache-2.0 ✔ | AI ভিডিও তৈরি (কিন্তু এই ল্যাপটপে চলে না: বড় GPU লাগে) |
| comfyanonymous/ComfyUI | ১,৪৫,৫৪৬ | GPL-3.0 (টুল হিসেবে চালাতে সমস্যা নেই) | AI ছবি আর ভিডিওর কাজ সাজানো (বড় GPU লাগে) |
| blender/blender | ২১,৭১৯ | GPL (তৈরি ভিডিও আপনার) | উঁচু মানের থ্রিডি রেন্ডার (ক্লাউড মেশিনে) |
| obsproject/obs-studio | ৭৯,১১৪ | GPL ✔ | স্ক্রিন রেকর্ডিং |

## গ. ক্লায়েন্টের কাজে চালাব না (লাইসেন্সে বাণিজ্যিক ব্যবহার নিষেধ বা ঝুঁকি)

| রেপো | স্টার | কেন নয় |
| --- | --- | --- |
| fishaudio/fish-speech | ৩৩,৬০৭ | মডেল CC-BY-NC-SA: শুধু অবাণিজ্যিক |
| facebookresearch/audiocraft (MusicGen) | ২৩,৮৩২ | মডেল CC-BY-NC: শুধু অবাণিজ্যিক (STYLE.md §১৩) |
| Lightricks/LTX-Video | ১১,৩৩৮ | নিজস্ব কমিউনিটি লাইসেন্স: আয়ের সীমা আর শর্ত পড়ে তবেই |
| theatre-js/theatre | ১২,৯২৪ | ২০২৪-এর পর আপডেট নেই, স্টুডিও অংশ AGPL |
| alyssaxuu/motionity · friction2d/friction · synfig · opentoonz | ৪,১৪৭ · ১,৯৪৩ · ২,৩৭৫ · ৮,০৪১ | হাতে চালানোর এডিটর। আমরা কোডে বানাই, তাই দরকার নেই |

## ঘ. HyperFrames-এর নিজের ৪৪৮টা তৈরি ব্লক

`npx hyperframes catalog --json` দিলে পুরো তালিকা আসে। সবচেয়ে কাজের ব্লক:
- glass-hero, extruded-logo, exploded-stack, code-3d-extrude: থ্রিডি
- logo-outro, logo-sting: লোগো
- chart-story, data-chart, world-map: ডেটা আর ম্যাপ
- browser-device-stage, multi-device-splay, agent-cursor, whip-pan-cut, light-sweep-pass, cta-lockup: প্রোডাক্ট ভিডিও
- lt-* : লোয়ার-থার্ড

**নিয়ম:**
- এই ব্লকগুলো CDN (ইন্টারনেট) থেকে GSAP আর three নামায়। আমাদের কিট সেটা আটকায় (`tools/studio/check.mjs`)। তাই প্রতিটা লিংক লোকাল কপিতে বদলে নিতে হয়।
- `webgpu` ট্যাগের ব্লক এই ল্যাপটপে চলবে না।
