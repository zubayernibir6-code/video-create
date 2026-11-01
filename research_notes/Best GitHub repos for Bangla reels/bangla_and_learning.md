# Themes E (open source made for Bangla) and F (free GitHub repos that teach skills / build a career): ranked candidates, TOP 5 + 2 backups, fact sheets

All GitHub numbers were read on the GitHub page with WebFetch on **2026-10-30** (no api.github.com calls were made). Star counts are as the page displayed them ("k" = thousand). "Last commit" dates come from each repo's `/commits` page, or for very large repos from the EvanLi daily Top-100 ranking ([EvanLi Top-100](https://github.com/EvanLi/Github-Ranking/blob/master/Top100/Top-100-stars.md)). Lines marked **[judgment]** are my assessment, not a sourced fact. Difficulty 1 means anyone with a phone can do it; 5 means a developer with a GPU.

## Key question 1: Which Bangla-language repos can a non-coder really use today, and which only a developer can? (Theme E ranking + fact sheets)

### Takeaway
Very few Bangla-specific repos are usable today by a non-coder. **OpenBangla Keyboard** (Linux) and **Mozilla Common Voice** (donate or check Bangla voice clips on the website) are the only strong ones. AI4Bharat's **IndicTrans2** has a web demo link. Everything else is for developers: **Indic Parler-TTS**, **bnlp**, **BanglaBERT/BanglaT5** and **BanglaSpeech2Text** all need Python, and the TTS and BERT models really want a GPU. The best Bangla *output* backed by a measured score is Indic Parler-TTS: an 86 % native-speaker score for Bengali. BanglaBERT is from the respected BUET CSE NLP group, but its licence is research-only.

### Cited Findings

#### Theme E: ranked 8 candidates (strict filter applied)
1. **OpenBangla/OpenBangla-Keyboard**: works for a non-coder (Linux), active again in 2025–26. TOP 5
2. **AI4Bharat/IndicTrans2**: MIT translation models covering Bengali, with a web demo link. TOP 5
3. **huggingface/parler-tts + ai4bharat/indic-parler-tts**: Apache-2.0 Bengali TTS, 6 voices, measured quality. TOP 5
4. **common-voice/common-voice (Mozilla Common Voice)**: non-coders can donate or validate Bangla speech. TOP 5
5. **sagorbrur/bnlp**: the maintained Bangla NLP toolkit (MIT), updated in April 2026. TOP 5
6. **csebuetnlp/banglabert (+ BanglaT5)**: BUET CSE NLP group models, research-only licence. BACKUP 1
7. **omicronlab/Avro-Keyboard**: source of the famous Windows Bangla keyboard (MPL-1.1). The repo is quiet. BACKUP 2
8. **shhossain/BanglaSpeech2Text**: pip package for Bangla speech-to-text built on Whisper. Small maker; overlaps the "offline local AI / Whisper apps" theme.

Also considered and not ranked:
- **JaidedAI/EasyOCR**: lists Bengali `bn` among 83 languages; Apache-2.0, 30.1k stars, v1.7.2 of 24 Sep 2024 ([EasyOCR repo](https://github.com/JaidedAI/EasyOCR); [EasyOCR language list](https://www.jaided.ai/easyocr/)). It is generic OCR, not Bangla-made, and I found no source on its Bangla accuracy.
- **notofonts/bengali** (Noto Bengali fonts): only 6 stars and no releases, so it is a weak "GitHub repo" for a video ([notofonts/bengali](https://github.com/notofonts/bengali)).
- **Bijoy→Unicode converters**: Mad-FOX/bijoy2unicode (MPL-2.0, pip), shahad-mahmud/unicode_converter, JehadurRE/Bijoy2Unicode (npm, .docx) ([search summary](https://github.com/Mad-FOX/bijoy2unicode); [topic page](https://github.com/topics/bijoy-to-unicode)). All are small single-maintainer repos; I did not verify their stars or activity.
- **Small Bangla TTS repos**: zabir-nabil/bangla-tts has ~88 stars, last pushed Oct 2024. shhossain/BanglaTTS was last pushed Mar 2023. asiff00/training-tts (MIT, created Mar 2025) is a training-script repo ([ecosyste.ms bangla-tts](https://awesome.ecosyste.ms/projects/github.com%2Fzabir-nabil%2Fbangla-tts); [ecosyste.ms training-tts](https://awesome.ecosyste.ms/projects/github.com%2Fasiff00%2Ftraining-tts); [shhossain/BanglaTTS](https://github.com/shhossain/BanglaTTS)). They fail the "real users / recent activity" filter.

#### E-TOP-1: OpenBangla/OpenBangla-Keyboard
- **URL:** https://github.com/OpenBangla/OpenBangla-Keyboard
- **What it does:** an open-source Bangla input method (keyboard) "for GNU/Linux systems". It types Avro Phonetic plus the fixed layouts Probhat, Munir Optima, Avro Easy, Bornona and National (Jatiya) ([repo README](https://github.com/OpenBangla/OpenBangla-Keyboard)).
- **Problem it solves for this viewer [judgment]:** students and teachers on Ubuntu or other Linux PCs (school labs, old laptops) can type Bangla the same Avro-Phonetic way they already know from Windows.
- **Stars:** ~623, forks 92 (read 2026-10-30) ([repo](https://github.com/OpenBangla/OpenBangla-Keyboard)).
- **Licence:** GPL-3.0. The page says "GPL-3.0 license"; whether it is -only or -or-later is not stated ([repo](https://github.com/OpenBangla/OpenBangla-Keyboard)).
- **Archived:** no ([repo](https://github.com/OpenBangla/OpenBangla-Keyboard)).
- **Latest release:** 2.0.0, 01 Oct 2020, with .deb packages for Debian 9–13, .rpm for Fedora 29–32 and an Arch .pkg.tar.zst ([releases](https://github.com/OpenBangla/OpenBangla-Keyboard/releases)).
- **Latest commit:** 10 May 2026, "fix: rename labels and improve issue templates for v3 (#460)". Earlier: 23 Dec 2025, "Update Ubuntu version handling in installer script" ([commits](https://github.com/OpenBangla/OpenBangla-Keyboard/commits/master)).
- **How to start (quoting the README):**
  - Linux one-liner: `bash -c "$(wget -q https://raw.githubusercontent.com/OpenBangla/OpenBangla-Keyboard/master/tools/install.sh -O -)"`. The README stresses it "has to be **BASH**".
  - Arch: `yay -S openbangla-keyboard`, or `openbangla-keyboard-bin`.
  - Others: download packages from the Releases page ([repo README](https://github.com/OpenBangla/OpenBangla-Keyboard)).
- **Hook fact:** the README promises "100% compatibility with current Avro Phonetic scheme" and loads Avro Keyboard layout files (version 5) ([repo README](https://github.com/OpenBangla/OpenBangla-Keyboard)).
- **Caveats:**
  - Linux only; the README has no Windows or macOS instructions ([repo README](https://github.com/OpenBangla/OpenBangla-Keyboard)).
  - The last packaged release is from 2020 (Fedora packages stop at 32) ([releases](https://github.com/OpenBangla/OpenBangla-Keyboard/releases)).
  - A "v3" appears to be in preparation, judging only from a commit title ([commits](https://github.com/OpenBangla/OpenBangla-Keyboard/commits/master)).
- **Bangla output quality [judgment]:** a keyboard's output is the user's own typing, so quality means layout fidelity. The README claims 100 % Avro compatibility; I did not test it.
- **Difficulty:** 2 [judgment] (a single command, but only for viewers who run Linux).
- **Bengali docs:** none found on the repo page (the README is in English).

#### E-TOP-2: AI4Bharat/IndicTrans2
- **URL:** https://github.com/AI4Bharat/IndicTrans2
- **What it does:** open machine-translation models between English and all 22 scheduled Indian languages, plus Indic↔Indic. **Bengali is included as `ben_Beng`** ([repo README](https://github.com/AI4Bharat/IndicTrans2)).
- **Problem it solves [judgment]:** a free, commercially usable English↔Bangla translation engine that a developer can host themselves (no per-word fees). It suits freelancers who localise content.
- **Stars:** 488 as displayed (read 2026-10-30); this is the only time I read it ([repo](https://github.com/AI4Bharat/IndicTrans2)).
- **Licence:** code MIT; model checkpoints MIT (per the README's licence table); training data CC0 (mined, BPCC-BT) and CC-BY-4.0 (BPCC-H-Wiki/Daily, IN22) ([repo README](https://github.com/AI4Bharat/IndicTrans2)).
- **Archived:** no. **Releases:** none on GitHub ([repo](https://github.com/AI4Bharat/IndicTrans2)).
- **Latest commit:** 3 Oct 2025, "Pin transformers version." The previous one was 2 May 2025, "Address as_target_tokenizer deprecation in Transformers v5" ([commits](https://github.com/AI4Bharat/IndicTrans2/commits/main)).
- **How to start:**
  - Non-coder: the README's "Demo" link, models.ai4bharat.org/#/nmt/v2. I did not open it to confirm it still works.
  - Developer: `git clone https://github.com/AI4Bharat/IndicTrans2` → `cd IndicTrans2` → `source install.sh`, inside a Python ≥3.7 virtual environment. Hugging Face checkpoints and a Colab notebook are linked ([repo README](https://github.com/AI4Bharat/IndicTrans2)).
- **Hook fact:** a peer-reviewed model (TMLR 2023, arXiv 2305.16307) that covers all 22 scheduled languages of India. It has 1B-parameter models and distilled 200M versions small enough for modest hardware ([repo README](https://github.com/AI4Bharat/IndicTrans2)).
- **Caveats:**
  - GPU needs are not stated ([repo README](https://github.com/AI4Bharat/IndicTrans2)).
  - Running it locally is developer work.
  - I fetched no per-language Bengali score (see Gaps).
- **Bangla output quality:** not measured in my sources. Test it on Bangladeshi sentences before you promise anything on camera.
- **Difficulty:** 1 (demo) / 4 (local) [judgment].
- **Bengali docs:** none found.

#### E-TOP-3: huggingface/parler-tts + the ai4bharat/indic-parler-tts checkpoint
- **URLs:** https://github.com/huggingface/parler-tts (code) and https://huggingface.co/ai4bharat/indic-parler-tts (the Indic/Bengali model).
- **What it does:** text-to-speech in which you *describe the voice in a sentence*. AI4Bharat's Indic checkpoint speaks Bengali with 6 named speakers: Arjun, Aditi, Tapan, Rashmi, Arnav and Riya. Arjun and Aditi are the recommended ones ([model card](https://huggingface.co/ai4bharat/indic-parler-tts)).
- **Problem it solves [judgment]:** free Bangla voice-overs (for Reels, lessons, shop ads) under a licence that allows commercial use.
- **Stars:** parler-tts ~5.6k (read 2026-10-30) ([repo](https://github.com/huggingface/parler-tts)). The model had **119,911 downloads last month** ([model card](https://huggingface.co/ai4bharat/indic-parler-tts)).
- **Licence:** code Apache-2.0 ([repo](https://github.com/huggingface/parler-tts)). The model is "permissively licensed under the Apache 2.0 license" ([model card](https://huggingface.co/ai4bharat/indic-parler-tts)).
- **Archived:** no. Releases are not visible on the page, and I did not read the latest commit date ([repo](https://github.com/huggingface/parler-tts)).
- **How to start (quoted):** `pip install git+https://github.com/huggingface/parler-tts.git`, then the model card's Python snippet: load `ai4bharat/indic-parler-tts`, pass a text prompt plus a voice description such as "A female speaker delivers a slightly expressive and animated speech with a moderate speed and pitch.", and write a .wav ([model card](https://huggingface.co/ai4bharat/indic-parler-tts)).
- **Bangla output quality (measured):** Bengali Native Speaker Score is **77.41 ± 2.14 % for the pretrained model and 86.16 ± 1.85 % for the finetuned one** ([model card](https://huggingface.co/ai4bharat/indic-parler-tts)).
- **Hook fact:** you type the voice you want in plain English, and it speaks Bangla in one of 6 named voices ([model card](https://huggingface.co/ai4bharat/indic-parler-tts)).
- **Caveats:**
  - 0.9B parameters stored as F32. The snippet uses CUDA if present, else CPU ([model card](https://huggingface.co/ai4bharat/indic-parler-tts)); expect slow CPU runs [judgment].
  - The model card is inconsistent about language count (21 vs 18) ([model card](https://huggingface.co/ai4bharat/indic-parler-tts)).
  - The speakers come from an Indian dataset. Whether the accent sounds Bangladeshi or West Bengali is unverified.
- **Difficulty:** 4 [judgment] (Python + ideally a GPU).
- **Bengali docs:** none.

#### E-TOP-4: common-voice/common-voice (Mozilla Common Voice)
- **URL:** https://github.com/common-voice/common-voice. Website: commonvoice.mozilla.org.
- **What it does:** volunteers "record sample sentences with a microphone and review recordings of other users" to build a free public speech dataset ([Wikipedia](https://en.wikipedia.org/wiki/Common_Voice)).
- **Problem it solves [judgment]:** Bangla voice AI is weak because open Bangla speech data is scarce. With just a phone and no coding, a viewer can help close that gap (and feel part of it).
- **Stars:** ~3.5k (read 2026-10-30) ([repo](https://github.com/common-voice/common-voice)).
- **Licence:** code MPL-2.0; sentence text in `/server/data` CC0 ([repo](https://github.com/common-voice/common-voice)); dataset CC0 ([Wikipedia](https://en.wikipedia.org/wiki/Common_Voice)).
- **Archived:** no; 55,019 commits ([repo](https://github.com/common-voice/common-voice)). I did not read the latest commit date.
- **How to start:** the README says "you don't have to know how to code to contribute!" It lists translating the interface through Pontoon and adding sentences ([repo](https://github.com/common-voice/common-voice)). Speaking and listening are done on the website ([Wikipedia](https://en.wikipedia.org/wiki/Common_Voice)). First 30 minutes [judgment]: open commonvoice.mozilla.org, pick Bengali, record 5 sentences, then validate 20 clips.
- **Hook fact:** at the start of 2022, Bengali.AI partnered with Common Voice on "Bangla Speech Recognition", and about 2,000 hours of voice were collected ([Wikipedia](https://en.wikipedia.org/wiki/Common_Voice)). Common Voice collects data for "over 250 languages" as of Dec 2025 ([Wikipedia](https://en.wikipedia.org/wiki/Common_Voice)).
- **Caveats (the honest Bengali story):** recorded Bangla audio far exceeds *validated* Bangla audio.
  - Common Voice 9.0 had 56.61 validated hours out of 399.47 total ([HF loader script](https://huggingface.co/datasets/bengaliAI/CommonVoiceBangla/blob/main/common_voice_bn.py)).
  - In Common Voice 19.0, Bengali "has a significant amount of data that is not yet validated" and was left out of the train/dev/test splits ([CV 19.0 release](https://discourse.mozilla.org/t/common-voice-19-0-dataset-release/135857)).
  - A forum post reports 1,800+ recorded hours vs 1,268 released ([Discourse](https://discourse.mozilla.org/t/600-hours-of-audio-is-missing-in-bengali/121240)).
  - So the most useful thing a viewer can do is *validate* clips [judgment].
- **Difficulty:** 1 [judgment].
- **Bengali UI:** not verified (see Gaps).

#### E-TOP-5: sagorbrur/bnlp (BNLP toolkit)
- **URL:** https://github.com/sagorbrur/bnlp
- **What it does:** a Python toolkit for Bangla text ([repo README](https://github.com/sagorbrur/bnlp)):
  - tokenizers (basic, NLTK, SentencePiece)
  - embeddings (Word2Vec, FastText, GloVe, Doc2Vec)
  - CRF POS tagging and NER
  - text cleaning, corpus data (letters, vowels, punctuation, stopwords)
  - spell checking, language detection, CLI, pipeline API
- **Problem it solves [judgment]:** a developer building a Bangla chatbot, search box or comment analyser gets ready-made Bangla building blocks.
- **Stars:** 311 (read 2026-10-30). **Licence:** MIT. **Archived:** no ([repo](https://github.com/sagorbrur/bnlp)).
- **Latest commits:** 1 Apr 2026: "Update dependencies and code for Python 3.9-3.13+ support", "Add Python 3.12 to build matrix", PR #54 ([commits](https://github.com/sagorbrur/bnlp/commits/main)).
- **How to start (quoted):** `pip install bnlp_toolkit`; upgrade with `pip install -U bnlp_toolkit`; for language detection `pip install bnlp_toolkit[langdetect]` ([repo README](https://github.com/sagorbrur/bnlp)).
- **Hook fact:** one of the few Bangla NLP toolkits still maintained, updated in April 2026 for Python 3.13 ([commits](https://github.com/sagorbrur/bnlp/commits/main)). It credits Semantics Lab as a supporter ([repo](https://github.com/sagorbrur/bnlp)).
- **Caveats:** developer-only. CRF-based POS/NER is older technology than transformer models [judgment]. The fetched page shows no accuracy numbers.
- **Difficulty:** 4 [judgment].
- **Bengali docs:** none found.

#### E-BACKUP-1: csebuetnlp/banglabert (and BanglaT5)
- **URL:** https://github.com/csebuetnlp/banglabert (models on Hugging Face: `csebuetnlp/banglabert`, `banglabert_large`, `banglabert_small`, `banglishbert`) ([repo README](https://github.com/csebuetnlp/banglabert)).
- **What it does:** a Bangla language model from the BUET CSE NLP group, evaluated on sentiment classification, NER, NLI and QA. Paper: Findings of ACL: NAACL 2022 ([repo README](https://github.com/csebuetnlp/banglabert)).
- **Sister model:** BanglaT5 (generation) is evaluated on MT, summarisation, QA, dialogue, headline generation and cross-lingual summarisation. It had 2,976 downloads last month (arXiv 2205.11081) ([BanglaT5 card](https://huggingface.co/csebuetnlp/banglat5)).
- **Problem it solves [judgment]:** a strong base for Bangla classification research (sentiment, spam, topic) at a university.
- **Stars:** 260 (read 2026-10-30). **Archived:** no ([repo](https://github.com/csebuetnlp/banglabert)).
- **Latest commits:** 20 Oct 2026, three "Update README.md" commits ([commits](https://github.com/csebuetnlp/banglabert/commits/master)).
- **Licence:** **CC-BY-NC-SA-4.0, "restricted to non-commercial research purposes only"** ([repo README](https://github.com/csebuetnlp/banglabert)). The BanglaT5 model card shows no licence field ([BanglaT5 card](https://huggingface.co/csebuetnlp/banglat5)).
- **How to start (quoted):** `git clone https://github.com/csebuetnlp/banglabert` → `cd banglabert/` → `conda create python==3.7.9 pytorch==1.8.1 torchvision==0.9.1 torchaudio==0.8.0 cudatoolkit=10.2 -c pytorch -p ./env` → `conda activate ./env` → `bash setup.sh`. Text must first pass through csebuetnlp/normalizer ([repo README](https://github.com/csebuetnlp/banglabert)).
- **Hook fact:** made at BUET (Bangladesh's top engineering university) and published at a top NLP venue (NAACL 2022 Findings) ([repo README](https://github.com/csebuetnlp/banglabert)).
- **Caveats:**
  - research-only licence (no commercial use);
  - a 2021-era environment (Python 3.7.9, PyTorch 1.8.1, CUDA 10.2);
  - it is not a chatbot and does not write text [judgment: BanglaBERT is an understanding model];
  - unusable for non-coders.
- **Difficulty:** 5 [judgment].
- **Bengali docs:** none found.

#### E-BACKUP-2: omicronlab/Avro-Keyboard
- **URL:** https://github.com/omicronlab/Avro-Keyboard (a fork of mugli/Avro-Keyboard).
- **What it does:** "Unicode compliant open source Bangla typing software for Windows". It is written in Delphi and needs Delphi 2010 to build ([repo](https://github.com/omicronlab/Avro-Keyboard)).
- **Problem it solves [judgment]:** Bangla typing on Windows. Most viewers already use it without knowing it is open source.
- **Stars:** 85, forks 19 (read 2026-10-30). **Licence:** MPL-1.1. **Archived:** no. **Releases:** none on GitHub. 39 commits; I did not read the latest commit date ([repo](https://github.com/omicronlab/Avro-Keyboard)).
- **How to start:** the GitHub README covers building only and says "Visit: http://www.omicronlab.com for latest version" ([repo](https://github.com/omicronlab/Avro-Keyboard)).
- **Hook fact:** "From version 5x, Avro Keyboard goes open source from freeware" ([repo](https://github.com/omicronlab/Avro-Keyboard)). OmicronLab keeps the copyright and asks that modifications be published under MPL ([search summary of the OmicronLab FAQ](https://www.github.com/omicronlab/Avro-Keyboard)).
- **Caveats:** the GitHub repo is not where users download it. It shows low activity and no releases. OpenBangla is the maintained Linux counterpart.
- **Difficulty:** 1 to install from the website, 5 to build [judgment].

#### Candidate #8 (not in top 7): shhossain/BanglaSpeech2Text
- **What it is:** a pip package for offline Bangla speech-to-text that uses Whisper fine-tunes.
- **Stars and licence:** 136 stars, Apache-2.0.
- **Install:** `pip install banglaspeech2text`. CLI: `bnstt 'file.wav'`, `bnstt --mic`.
- **Reported "Best(WER)" (units not stated):** tiny 74, base 46, small 18, large 11 (the large model is 3–4 GB) ([repo](https://github.com/shhossain/BanglaSpeech2Text)).
- **Activity:** last push Mar 2025 per ecosyste.ms ([ecosyste.ms](https://awesome.ecosyste.ms/projects/github.com%2Fshhossain%2FBanglaSpeech2Text)).
- **Why ranked low:** it overlaps the "offline local AI / Whisper apps" theme.

### Inferences
- **Non-coder usable today:**
  - OpenBangla Keyboard (Linux users only)
  - Avro Keyboard (Windows, via omicronlab.com, not GitHub)
  - Common Voice (website)
  - IndicTrans2's web demo (if still live)
- **Developer-only:** Indic Parler-TTS, bnlp, BanglaBERT/BanglaT5, local IndicTrans2, BanglaSpeech2Text, EasyOCR.
- For a Reel, the honest framing is "2 you can use today + 3 that let a developer build Bangla AI". A video cannot pretend all five are click-and-use.
- **Strongest Bangla-specific hooks:**
  - "The Avro keyboard you use every day is open source": true, but its GitHub repo is dormant.
  - "Indic Parler-TTS: describe the voice in English, it speaks Bangla, 86 % native-speaker score."
  - "Bengali has thousands of recorded hours waiting for someone to check them" (Common Voice validation backlog).
- AI4Bharat models are trained mainly for India's languages, so their Bengali may lean towards Indian Bengali usage. This is unverified and is a reason to test with Bangladeshi sentences before making claims on camera.
- BUET's BanglaBERT is the most "prestigious" Bangla repo, but its CC-BY-NC-SA licence means viewers cannot use it in paid work. Say this on screen.

### Gaps
- Per-language Bengali translation scores (chrF/BLEU) for IndicTrans2: not fetched, so its Bangla translation quality is unquantified here.
- Bangla OCR quality for EasyOCR or Tesseract `ben`: no source found. I did not verify Tesseract at all.
- The latest commit/release date was not read for huggingface/parler-tts, common-voice/common-voice and omicronlab/Avro-Keyboard.
- Current official Bengali hours (recorded vs validated) in Common Voice or the Mozilla Data Collective: no 2026 figure found. The figures above are from 2022–2024 releases and a forum post.
- Whether the Common Voice website UI is available in Bengali: not checked.
- Whether the IndicTrans2 web demo (models.ai4bharat.org) still works, and whether an Indic Parler-TTS Hugging Face Space exists for no-code testing: not checked.
- Whether OpenBangla's wiki has Bengali documentation, and when v3 will ship: not found.
- BanglaBERT is an ELECTRA-style encoder (i.e. not a text generator): from memory, not verified this session.

## Key question 2: Which learning repos have the most proof of value (stars, translations, community)? (Theme F ranking + fact sheets)

### Takeaway
Eight of GitHub's ten most-starred repos are learning or career resources. **build-your-own-x is #1 on all of GitHub (557k stars)**, freeCodeCamp is #4 and free-programming-books #6. For a Bangladeshi viewer, the best mix of proof and Bangla access is:
- **free-programming-books**: a Bengali list of 27 free books, including Tamim Shahriar Subeen's.
- **Microsoft's Generative-AI-for-Beginners**: 21 lessons, Bengali translation by AI.
- **coding-interview-university**: Bengali README; its author got hired at Amazon.
- **first-contributions**: Bengali README; 112k forks.
- **freeCodeCamp**: free certificates plus "English for Developers"; no Bengali.

### Cited Findings

#### Theme F: ranked 8 candidates
1. **EbookFoundation/free-programming-books**: #6 on GitHub, has a Bengali books list. TOP 5
2. **freeCodeCamp/freeCodeCamp**: #4 on GitHub, free certifications, 100k+ first developer jobs. TOP 5
3. **microsoft/generative-ai-for-beginners**: AI skills, Bengali translation. TOP 5
4. **jwasham/coding-interview-university**: #10 on GitHub, Bengali translation. TOP 5
5. **firstcontributions/first-contributions**: first open-source PR in 30 minutes, Bengali README. TOP 5
6. **microsoft/ML-For-Beginners**: 12 weeks / 26 lessons, Bengali translation. BACKUP 1
7. **codecrafters-io/build-your-own-x**: #1 repo on all of GitHub, CC0. BACKUP 2
8. **ossu/computer-science**: a free CS degree path, 210.5k stars, #27 on GitHub ([ossu](https://github.com/ossu/computer-science); [EvanLi](https://github.com/EvanLi/Github-Ranking/blob/master/Top100/Top-100-stars.md)). MIT. "Possible to finish within about 2 years" at ~20 h/week. First course: "Introduction to Computer Science and Programming using Python". Has a Discord. No Bengali.

Also considered, with the reason each was left out:
- **kamranahmedse/developer-roadmap**, which now opens as **nilbuild/developer-roadmap**: ~370.8k stars, #9 on GitHub, 89 roadmaps on roadmap.sh ([repo](https://github.com/kamranahmedse/developer-roadmap); [EvanLi](https://github.com/EvanLi/Github-Ranking/blob/master/Top100/Top-100-stars.md)). Left out because of its **restrictive custom licence** (Q3).
- **donnemartin/system-design-primer**: 376.2k stars, #8. Bengali appears in its translation list, but it links to issue #220 with the status unclear. Anki decks. Advanced material ([repo](https://github.com/donnemartin/system-design-primer)).
- **public-apis/public-apis**: 493.4k stars, #3, MIT. "A collective list of free APIs", good for portfolio projects but developer-oriented ([repo](https://github.com/public-apis/public-apis)).
- **dair-ai/Prompt-Engineering-Guide**: 79.7k stars, MIT, "3 million learners in January 2024", "13 languages" (Bengali not confirmed), last commit 11 Mar 2026 ([repo](https://github.com/dair-ai/Prompt-Engineering-Guide); [commits](https://github.com/dair-ai/Prompt-Engineering-Guide/commits/main)). It may cross into the "AI agents" theme.

#### GitHub-wide ranking (hook material)
- Top 10 by stars ([EvanLi Top-100](https://github.com/EvanLi/Github-Ranking/blob/master/Top100/Top-100-stars.md)):

  | Rank | Repo | Stars |
  | --- | --- | --- |
  | 1 | build-your-own-x | 557,393 |
  | 2 | awesome | 526,925 |
  | 3 | public-apis | 493,314 |
  | 4 | freeCodeCamp | 458,203 |
  | 5 | rea… (name cut off) | 408,523 |
  | 6 | free-programming-books | 400,498 |
  | 7 | openclaw | 393,392 |
  | 8 | system-design-primer | 376,149 |
  | 9 | developer-roadmap | 370,759 |
  | 10 | coding-interview-university | 363,538 |

- In the same list: TheAlgorithms/Python is #24 (225,684), ossu #27 (210,509) and generative-ai-for-beginners #95 (122,440) ([EvanLi Top-100](https://github.com/EvanLi/Github-Ranking/blob/master/Top100/Top-100-stars.md)).

#### F-TOP-1: EbookFoundation/free-programming-books
- **URL:** https://github.com/EbookFoundation/free-programming-books
- **What it does:** a crowd-maintained list of free programming books and courses in English plus 43 other languages (44 in all) ([repo](https://github.com/EbookFoundation/free-programming-books)).
- **Problem it solves [judgment]:** a student who cannot pay for books or courses gets a vetted free list, including books written in Bangla.
- **Stars:** ~400.5k (read 2026-10-30), **#6 of all GitHub repos** ([repo](https://github.com/EbookFoundation/free-programming-books); [EvanLi](https://github.com/EvanLi/Github-Ranking/blob/master/Top100/Top-100-stars.md)).
- **Licence:** CC-BY-4.0 ([repo](https://github.com/EbookFoundation/free-programming-books)). **Archived:** no.
- **Latest commit:** 27 Oct 2026 ([EvanLi](https://github.com/EvanLi/Github-Ranking/blob/master/Top100/Top-100-stars.md)).
- **How to start (first 30 minutes):** open `books/free-programming-books-bn.md`. It has **27 Bengali books** under Algorithms, C, Data Science, Go, Java, JavaScript, Machine Learning (4), Python (4), SQL, Web Development, Git and GitHub, and more. Examples: Tamim Shahriar Subeen's "Computer Programming, Part 1" (C), his Python book, and Tasmeem Reza & Mamnoon Siam's Dynamic Programming book. Pick one and read its first chapter. Also see `courses/free-courses-bn.md` ([Bengali list](https://github.com/EbookFoundation/free-programming-books/blob/main/books/free-programming-books-bn.md); [repo](https://github.com/EbookFoundation/free-programming-books)).
- **Hook fact:** the #6 most-starred repo on GitHub has a Bangla section with books by Bangladeshi authors ([EvanLi](https://github.com/EvanLi/Github-Ranking/blob/master/Top100/Top-100-stars.md); [Bengali list](https://github.com/EbookFoundation/free-programming-books/blob/main/books/free-programming-books-bn.md)). It began as a clone of a StackOverflow question ([repo](https://github.com/EbookFoundation/free-programming-books)).
- **Caveats:** the Bengali list is short (27). The index lists C++ but has no C++ entries ([Bengali list](https://github.com/EbookFoundation/free-programming-books/blob/main/books/free-programming-books-bn.md)). Entries are external links that can break [judgment].
- **Difficulty:** 1 [judgment].
- **Bengali content:** **yes**: [books-bn](https://github.com/EbookFoundation/free-programming-books/blob/main/books/free-programming-books-bn.md), `courses/free-courses-bn.md`. A Bengali README translation was not confirmed.

#### F-TOP-2: freeCodeCamp/freeCodeCamp
- **URL:** https://github.com/freeCodeCamp/freeCodeCamp. Learning happens at freecodecamp.org/learn.
- **What it does:** a free, interactive coding curriculum with free certifications. There are 6 Full-Stack certifications:
  - Responsive Web Design
  - JavaScript
  - Front-End Development Libraries
  - Python
  - Relational Databases
  - Back-End Development and APIs

  There are also 4 beta language certifications: A2 and B1 English for Developers, A1 Professional Spanish and A1 Professional Chinese. Each certification requires 5 projects ([repo](https://github.com/freeCodeCamp/freeCodeCamp)).
- **Problem it solves [judgment]:** a free, verifiable certificate and 5 portfolio projects for a freelancer's profile. The English-for-Developers certs help with client communication.
- **Stars:** ~458.2k (read 2026-10-30), **#4 of all GitHub repos** ([repo](https://github.com/freeCodeCamp/freeCodeCamp); [EvanLi](https://github.com/EvanLi/Github-Ranking/blob/master/Top100/Top-100-stars.md)).
- **Licence:** code BSD-3-Clause. The curriculum carries "copyright © 2014 freeCodeCamp.org" with no open licence stated ([repo](https://github.com/freeCodeCamp/freeCodeCamp)). **Archived:** no.
- **Latest commit:** 30 Oct 2026 ([EvanLi](https://github.com/EvanLi/Github-Ranking/blob/master/Top100/Top-100-stars.md)).
- **How to start (first 30 minutes):** open the first certification listed, Responsive Web Design (freecodecamp.org/learn/responsive-web-design-v9/), make a free account and do the first workshop steps in the browser ([repo](https://github.com/freeCodeCamp/freeCodeCamp)).
- **Hook fact:** "Our community has already helped more than 100,000 people get their first developer job" ([repo](https://github.com/freeCodeCamp/freeCodeCamp)).
- **Caveats:** no Bengali curriculum (only English, Spanish and Chinese language certs are mentioned) ([repo](https://github.com/freeCodeCamp/freeCodeCamp)). The curriculum text is not openly licensed, so reuse it on screen with care.
- **Difficulty:** 2 [judgment].
- **Bengali content:** none found.

#### F-TOP-3: microsoft/generative-ai-for-beginners
- **URL:** https://github.com/microsoft/generative-ai-for-beginners
- **What it does:** a 21-lesson course on building generative-AI apps, plus lesson 00 "Course Setup" ([repo](https://github.com/microsoft/generative-ai-for-beginners)).
- **Problem it solves [judgment]:** the skill clients are paying for now (LLM apps, prompts, RAG), taught for free by Microsoft, and the landing page is in Bangla.
- **Stars:** ~122.5k (read 2026-10-30), #95 of all GitHub repos ([repo](https://github.com/microsoft/generative-ai-for-beginners); [EvanLi](https://github.com/EvanLi/Github-Ranking/blob/master/Top100/Top-100-stars.md)).
- **Licence:** MIT. **Archived:** no ([repo](https://github.com/microsoft/generative-ai-for-beginners)).
- **Latest commit:** 29 Oct 2026 ([EvanLi](https://github.com/EvanLi/Github-Ranking/blob/master/Top100/Top-100-stars.md)).
- **How to start (first 30 minutes):** open the Bengali landing page `translations/bn/README.md`, then `00-course-setup`, then lesson `01-introduction-to-genai` ("Introduction to Generative AI and LLMs") ([repo](https://github.com/microsoft/generative-ai-for-beginners)).
- **Hook fact:** a full Microsoft AI course whose landing page is in Bangla, among 54 languages listed ("50+") ([repo](https://github.com/microsoft/generative-ai-for-beginners)). The Bengali README opens: "শুরু করার জন্য জেনারেটিভ এআই (ভার্সন ৩) - একটি কোর্স" ([bn README](https://github.com/microsoft/generative-ai-for-beginners/blob/main/translations/bn/README.md)).
- **Caveats:**
  - The Bengali is **machine-translated**: "এই নথিটি AI অনুবাদ পরিষেবা Co-op Translator ব্যবহার করে অনূদিত হয়েছে", with a warning that it may contain errors ([bn README](https://github.com/microsoft/generative-ai-for-beginners/blob/main/translations/bn/README.md)).
  - Coding lessons use Azure OpenAI, Microsoft Foundry Models or the OpenAI API, with no pricing stated. Foundry Local runs offline. **GitHub Models is "retiring at the end of July 2026"** ([repo](https://github.com/microsoft/generative-ai-for-beginners)).
- **Difficulty:** 3 [judgment].
- **Bengali content:** **yes**: https://github.com/microsoft/generative-ai-for-beginners/blob/main/translations/bn/README.md (AI translation).

#### F-TOP-4: jwasham/coding-interview-university
- **URL:** https://github.com/jwasham/coding-interview-university
- **What it does:** a multi-month study plan for becoming a software engineer and passing big-tech coding interviews ([repo](https://github.com/jwasham/coding-interview-university)).
- **Problem it solves [judgment]:** a CS student aiming for a remote or international software job gets a complete, ordered, free syllabus.
- **Stars:** ~363.6k (read 2026-10-30), **#10 of all GitHub repos** ([repo](https://github.com/jwasham/coding-interview-university); [EvanLi](https://github.com/EvanLi/Github-Ranking/blob/master/Top100/Top-100-stars.md)).
- **Licence:** CC-BY-SA-4.0. **Archived:** no ([repo](https://github.com/jwasham/coding-interview-university)).
- **Latest commit:** 28 Aug 2025 ([EvanLi](https://github.com/EvanLi/Github-Ranking/blob/master/Top100/Top-100-stars.md)), more than a year old.
- **How to start (first 30 minutes):** open the Bengali README `translations/README-bn.md`. Read "What is it?" and its "Required" list (a little coding experience, patience, time), then "Don't Make My Mistakes". Start the first topic, "Algorithmic complexity / Big-O" ([repo](https://github.com/jwasham/coding-interview-university)).
- **Hook fact:** the author studied "about 8-12 hours a day, for several months" and writes, "After going through this study plan, I got hired as a Software Development Engineer at Amazon!" ([repo](https://github.com/jwasham/coding-interview-university)).
- **Caveats:** heavy and aimed at big-tech interviews, not quick freelance income [judgment]. No commits since Aug 2025. I did not check how complete or current the Bengali translation is.
- **Difficulty:** 4 [judgment].
- **Bengali content:** **yes**: https://github.com/jwasham/coding-interview-university/blob/main/translations/README-bn.md. Bangla is one of 16 listed translations, alongside Urdu, Marathi, Khmer and others ([repo](https://github.com/jwasham/coding-interview-university)).

#### F-TOP-5: firstcontributions/first-contributions
- **URL:** https://github.com/firstcontributions/first-contributions
- **What it does:** a practice repo where beginners make their first open-source pull request by adding their name to `Contributors.md` ([repo](https://github.com/firstcontributions/first-contributions)).
- **Problem it solves [judgment]:** learning the Git/GitHub workflow that clients and employers expect, with a first green "merged" PR on your profile.
- **Stars:** ~56.6k; **forks ~112.0k, about twice the stars** (read 2026-10-30) ([repo](https://github.com/firstcontributions/first-contributions)).
- **Licence:** MIT. **Archived:** no ([repo](https://github.com/firstcontributions/first-contributions)).
- **Latest commit:** 30 Oct 2026, "Add Joon to Contributors list (#127640)" ([commits](https://github.com/firstcontributions/first-contributions/commits/main)).
- **How to start (first 30 minutes, from the README):**
  1. Fork the repo.
  2. `git clone` your fork.
  3. `git switch -c <branch>`.
  4. Add your name to `Contributors.md`.
  5. `git add Contributors.md` and commit.
  6. `git push -u origin <branch>`.
  7. Click "Compare & pull request" ([repo](https://github.com/firstcontributions/first-contributions)).
- **Hook fact:** today's merged PRs are numbered past **#127,600**. Strangers still merge a beginner's name every day ([commits](https://github.com/firstcontributions/first-contributions/commits/main)). The PR number counts all issues and PRs, so say "more than 127 thousand numbered contributions" with care [judgment].
- **Caveats:** you need Git and a GitHub account. A name-adding PR teaches the workflow; it is not a real code contribution [judgment].
- **Difficulty:** 2 [judgment].
- **Bengali content:** **yes**: https://github.com/firstcontributions/first-contributions/blob/main/docs/translations/README.bn.md, one of ~84 translations ([repo](https://github.com/firstcontributions/first-contributions)).

#### F-BACKUP-1: microsoft/ML-For-Beginners
- **URL:** https://github.com/microsoft/ML-For-Beginners
- **What it does:** "a 12-week, 26-lesson curriculum" on classic machine learning, mostly in Python with some R versions ([repo](https://github.com/microsoft/ML-For-Beginners)).
- **Problem it solves [judgment]:** a structured, free entry into data and ML work.
- **Stars:** ~91.9k (read 2026-10-30). **Licence:** MIT. **Archived:** no ([repo](https://github.com/microsoft/ML-For-Beginners)).
- **Latest commit:** 14 Sep 2026 ([commits](https://github.com/microsoft/ML-For-Beginners/commits/main)).
- **How to start (first 30 minutes):** open `translations/bn/README.md`, then Lesson 01 "Introduction to machine learning" (`1-Introduction/1-intro-to-ML`). GitHub Codespaces lets you "start in a browser without setting up Python locally" ([repo](https://github.com/microsoft/ML-For-Beginners)).
- **Hook fact:** 54 languages listed, Bengali among them ([repo](https://github.com/microsoft/ML-For-Beginners)).
- **Caveats:** the Bengali is probably AI-translated like its sister course (not verified for this repo). Python is needed unless you use Codespaces.
- **Difficulty:** 3–4 [judgment].
- **Bengali content:** **yes**: https://github.com/microsoft/ML-For-Beginners/blob/main/translations/bn/README.md

#### F-BACKUP-2: codecrafters-io/build-your-own-x
- **URL:** https://github.com/codecrafters-io/build-your-own-x
- **What it does:** a list of step-by-step tutorials for re-creating technologies from scratch: Git, Docker, databases, web servers, neural networks, operating systems, games and more. There are 29 topical categories plus "Uncategorized", with many Python and JavaScript tutorials ([repo](https://github.com/codecrafters-io/build-your-own-x)).
- **Problem it solves [judgment]:** turns "I watched tutorials" into "I built a mini-Git / bot / web server". Those are portfolio projects that stand out to clients.
- **Stars:** ~557.5k, forks 52.2k (read 2026-10-30). It is the **#1 most-starred repo on all of GitHub** ([repo](https://github.com/codecrafters-io/build-your-own-x); [EvanLi](https://github.com/EvanLi/Github-Ranking/blob/master/Top100/Top-100-stars.md)).
- **Licence:** CC0 ("CodeCrafters, Inc. has waived all copyright…"). **Archived:** no ([repo](https://github.com/codecrafters-io/build-your-own-x)).
- **Latest commit:** 14 Jul 2026 ([EvanLi](https://github.com/EvanLi/Github-Ranking/blob/master/Top100/Top-100-stars.md)).
- **How to start (first 30 minutes) [judgment]:** scroll to "Build your own Bot" or "Command-Line Tool", choose a Python tutorial and follow it to the first running output.
- **Hook fact:** it opens with Richard Feynman's line "What I cannot create, I do not understand" ([repo](https://github.com/codecrafters-io/build-your-own-x)).
- **Caveats:** English only, and the tutorials are external links of mixed quality and age [judgment]. Mostly intermediate level.
- **Difficulty:** 4 [judgment].
- **Bengali content:** none ([repo](https://github.com/codecrafters-io/build-your-own-x)).

### Inferences
- **Proof of value, strongest first:** build-your-own-x, public-apis, freeCodeCamp, free-programming-books, system-design-primer, developer-roadmap and coding-interview-university all sit in GitHub's top 10. Microsoft's beginner courses add 50+ translations.
- **Most useful for a Bangladeshi viewer:** the repos that combine proof with Bangla access. free-programming-books (Bangla books by Bangladeshi authors), coding-interview-university (Bengali README), first-contributions (Bengali README) and Microsoft's two courses (AI-translated Bengali).
- The Microsoft Bengali pages are machine translations. A Reel should say "বাংলায় পড়া যায় (AI অনুবাদ)" (readable in Bangla, AI-translated) instead of implying a human translation.
- **For income-focused viewers (freelancers):**
  - freeCodeCamp: certs, projects, and "English for Developers".
  - Generative-AI-for-Beginners: AI app skills clients ask for.
  - first-contributions: a GitHub profile.
  - build-your-own-x: portfolio projects.
  - These are more directly useful than coding-interview-university, which targets big-tech interviews.
- **Video set suggestion [judgment]:** Theme F could become two videos: "5 repos with Bangla inside" and "GitHub's most-starred repos that are free schools".

### Gaps
- Whether the Bengali translation of coding-interview-university is complete and up to date: not checked.
- Whether ML-For-Beginners' Bengali is machine-translated: assumed from its sister repo, not verified.
- Whether Prompt-Engineering-Guide includes Bengali among its "13 languages": not listed on the repo page.
- System-design-primer's licence (the page links LICENSE.txt but the fetch showed no identifier) and the status of its Bengali translation (issue #220): not resolved.
- The date and reason for developer-roadmap's move from kamranahmedse to nilbuild: not found. The old URL now shows nilbuild/developer-roadmap.
- Whether freeCodeCamp has any Bengali curriculum or a Bengali news publication: not found on the repo page.
- The EvanLi list shows no "last updated" date. Its freeCodeCamp last-commit date of 2026-10-30 suggests it was refreshed today.

## Key question 3: Are the licences commercial-friendly? (The creator sells videos; viewers may use the tools for work)

### Takeaway
Almost everything ranked is commercial-friendly (MIT, Apache-2.0, BSD-3, CC0, CC-BY, GPL/MPL for use). There are two red flags:
- **BanglaBERT is CC-BY-NC-SA-4.0** (non-commercial research only), so viewers must not use it in paid work.
- **developer-roadmap uses a custom "personal use only" licence** that restricts republishing its content, so link to it rather than showing its roadmap images in a sold video.

### Cited Findings
- **Commercial-friendly permissive licences:**
  - MIT: IndicTrans2 code and checkpoints ([repo](https://github.com/AI4Bharat/IndicTrans2)), bnlp ([repo](https://github.com/sagorbrur/bnlp)), generative-ai-for-beginners ([repo](https://github.com/microsoft/generative-ai-for-beginners)), ML-For-Beginners ([repo](https://github.com/microsoft/ML-For-Beginners)), first-contributions ([repo](https://github.com/firstcontributions/first-contributions)), ossu ([repo](https://github.com/ossu/computer-science)), Prompt-Engineering-Guide ([repo](https://github.com/dair-ai/Prompt-Engineering-Guide)), public-apis ([repo](https://github.com/public-apis/public-apis)).
  - Apache-2.0: parler-tts ([repo](https://github.com/huggingface/parler-tts)), the Indic Parler-TTS model ([model card](https://huggingface.co/ai4bharat/indic-parler-tts)), BanglaSpeech2Text ([repo](https://github.com/shhossain/BanglaSpeech2Text)), EasyOCR ([repo](https://github.com/JaidedAI/EasyOCR)).
  - BSD-3-Clause: freeCodeCamp code ([repo](https://github.com/freeCodeCamp/freeCodeCamp)).
- **Public domain / attribution licences:**
  - CC0: build-your-own-x ([repo](https://github.com/codecrafters-io/build-your-own-x)), the Common Voice dataset ([Wikipedia](https://en.wikipedia.org/wiki/Common_Voice)).
  - CC-BY-4.0 (credit required): free-programming-books ([repo](https://github.com/EbookFoundation/free-programming-books)).
  - CC-BY-SA-4.0 (credit + share-alike): coding-interview-university ([repo](https://github.com/jwasham/coding-interview-university)).
- **Copyleft (free to use; changes must stay open if you distribute them):**
  - GPL-3.0: OpenBangla Keyboard ([repo](https://github.com/OpenBangla/OpenBangla-Keyboard)).
  - MPL-1.1: Avro Keyboard. OmicronLab's FAQ says modifications must be published under MPL except for internal use, and that you can mix MPL with commercial code ([repo](https://github.com/omicronlab/Avro-Keyboard); [search summary](https://www.github.com/omicronlab/Avro-Keyboard)).
  - MPL-2.0: Common Voice code ([repo](https://github.com/common-voice/common-voice)).
- **Non-commercial:** BanglaBERT is CC BY-NC-SA 4.0, "restricted to non-commercial research purposes only" ([repo](https://github.com/csebuetnlp/banglabert)). The BanglaT5 model card shows no licence ([card](https://huggingface.co/csebuetnlp/banglat5)).
- **Custom restrictive:** developer-roadmap, © Kamran Ahmed. Material may be used for personal use only; publishing images, project files or content needs prior consent; sharing links is allowed. It is not OSI open source ([licence](https://github.com/nilbuild/developer-roadmap/blob/master/license)).
- **Not openly licensed:** the freeCodeCamp curriculum is marked "copyright © 2014 freeCodeCamp.org" (code is BSD-3) ([repo](https://github.com/freeCodeCamp/freeCodeCamp)).
- **Data licences under IndicTrans2:** CC0 and CC-BY-4.0, which are commercial-friendly with attribution for the CC-BY parts ([repo](https://github.com/AI4Bharat/IndicTrans2)).

### Inferences
- For the Reels:
  - Showing a repo's GitHub page and talking about it is commentary. The licence matters when content is copied into the video (roadmap images, long passages of a course).
  - For developer-roadmap, show only the repo or website briefly and link to it.
  - For CC-BY / CC-BY-SA lists, credit the repo on screen.
  - This is my reading, not legal advice.
- On-screen honesty labels to use [judgment]:
  - BanglaBERT: "শুধু গবেষণার জন্য, বিক্রির কাজে নয়" (research only, not for commercial use).
  - Microsoft courses: "AI অনুবাদ" (AI translation).
  - OpenBangla: "শুধু Linux" (Linux only).
  - Avro: "GitHub-এ কোড আছে, ডাউনলোড omicronlab.com থেকে" (the code is on GitHub; download from omicronlab.com).
- **Belongs elsewhere (cross-fits for the other researchers):**
  - openai/whisper and Whisper-based Bangla apps, BanglaSpeech2Text, Piper TTS voices, and local LLMs with Bangla support (Gemma/Qwen-type): the "offline local AI" theme.
  - EasyOCR / Tesseract for scanning Bangla documents, and Bijoy→Unicode converters: the "freelancer & small-business/office apps" or "content-creator tools" themes.
  - Prompt-Engineering-Guide: could sit in "AI agents & automation".
  - Remote-job lists for freelancers: the freelancer theme.
- Meta's open speech/translation models (MMS, NLLB, Seamless) cover Bengali. This workspace's own notes say never to use MMS in sold videos. I did not re-verify their licences this session, so they are left out.

### Gaps
- GPL-3.0-only vs -or-later for OpenBangla: not stated on the page.
- An explicit licence for the BanglaT5 weights: not on the Hugging Face card. Its GitHub repo (csebuetnlp/BanglaNLG) was not fetched.
- The licences of Meta MMS/NLLB/Seamless and of the Bijoy converter repos: not verified this session.
- Whether showing freeCodeCamp's or roadmap.sh's screens in a monetised video needs permission: no source found. The analysis above is a reading of the licence text only.
