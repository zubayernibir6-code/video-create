# Connect D:\Video Create to his GitHub repo (paste into the Code tab on his laptop, ONCE)

Talha: Claude অ্যাপের Code ট্যাবে (ফোল্ডার D:\Video Create) নিচের পুরো লেখাটা পেস্ট করুন। Windows GitHub-এ লগইন
চাইলে ব্রাউজারে লগইন করে দেবেন। এতে আপনার কোনো ফাইল মুছবে না।

---

The private repo https://github.com/zubayernibir6-code/video-create already holds this folder's FULL git history
(the same 54 commits as here) plus newer commits made from the cloud on 2026-11-05 with today's work. Connect this
folder to it WITHOUT changing any file on disk. Reply to me in simple Bengali; stop and tell me if a step fails.

1. `git remote -v`. If `origin` already exists and points elsewhere, STOP and show me.
   Otherwise: `git remote add origin https://github.com/zubayernibir6-code/video-create.git`
2. `git fetch origin`
3. `git merge-base --is-ancestor HEAD origin/master`: it succeeds when this folder's last commit (`d490bca`) is already
   in GitHub's history (the normal case). If it FAILS, a commit was made here after 2026-11-04 10:15: then do NOT reset;
   run `git merge origin/master` instead, show me any conflict, and skip step 4.
4. `git reset --mixed origin/master` (moves only the history pointer and the index; files on disk stay exactly as
   they are), then `git branch --set-upstream-to=origin/master master`.
5. Two files the cloud could not write into `.claude`: `git checkout origin/master -- .claude/settings.json .claude/skills/client-promo`
   Then delete the folder `tools\cloud\to-install` (it only held copies of those two files).
6. `git status`: anything still listed was changed on this laptop and is not on GitHub yet. Show me the list, then
   commit those whole files ("Laptop changes not yet on GitHub") and `git push`. If it is clean, say so.
7. Show `git log --oneline -4` and `git status` (must be clean and "up to date with origin/master").

From now on: `git pull` before working here; at the end of every job commit (with my OK) and `git push`.
