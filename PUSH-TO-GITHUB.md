# Push D:\Video Create to his private GitHub repo (paste this into the Code tab on his laptop)

Talha: আগে FAST-START.md §২-এর ধাপ ১–২ করুন (প্রাইভেট রিপো `video-create` বানানো)। তারপর নিচের পুরো লেখাটা
Claude অ্যাপের Code ট্যাবে (ফোল্ডার D:\Video Create) পেস্ট করুন।

---

In D:\Video Create (git repo, branch master), push everything to my new EMPTY private repo
https://github.com/zubayernibir6-code/video-create . Reply to me in simple Bengali. Steps, stop and tell me if any fails:

0. Two files could not be written into `.claude` from the cloud. Copy them into place first (overwrite):
   `tools\cloud\to-install\settings.json` → `.claude\settings.json`, and
   `tools\cloud\to-install\client-promo-SKILL.md` → `.claude\skills\client-promo\SKILL.md` (make the folder).
   Then delete the `tools\cloud\to-install` folder. Show me `type .claude\settings.json`.
1. Safety first, report each result:
   - `git check-ignore -v .env.local` must print a rule (the keys file is ignored). If not, STOP.
   - `git ls-files | findstr /i /r "\.env \.mp4$ \.wav$ \.mov$ \.onnx$"` must print nothing except `.env.local.example`.
   - List every tracked file bigger than 50 MB (GitHub refuses > 100 MB) and the total size of `.git`. If any file
     is over 100 MB, STOP and tell me.
2. `git status`, then commit ALL changed and new files (whole files) with the message
   "Fast start: cloud autostart, parallel setup, client-promo skill, FAST-START guide".
3. `git remote add origin https://github.com/zubayernibir6-code/video-create.git` (if origin exists, show it and ask me).
4. `git push -u origin master`. If Windows asks me to sign in to GitHub, tell me to do it in the browser window.
5. Show `git log --oneline -3` and `git status` (must be clean), and tell me how many files went up.

From now on, at the end of every video job: commit with my OK, then `git push`.
