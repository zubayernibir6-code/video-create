import json, subprocess
W=json.load(open('/home/claude/VideoWork/hook/asr.words.json'))
# spelling fixes
fix={'ঝুটপোটি':'ঝুটপট্টি','ঝুটপোট্টি':'ঝুটপট্টি','বারোমারি':'বারোমারী'}
for w in W: w['text']=fix.get(w['text'],w['text'])
def ts(t):
    t=max(0,t);h=int(t//3600);m=int(t%3600//60);s=t%60;return f"{h}:{m:02d}:{s:05.2f}"
GOLD='&H0035C8FF&'; WHITE='&H00FFFFFF&'; PURP='&H00A0308A&'
hdr="""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Hind Siliguri,84,&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,1,0,0,0,100,100,0,0,1,5,3,5,60,60,0,1
Style: Hook,Baloo Da 2,140,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,7,4,5,40,40,0,1
Style: Box,Hind Siliguri,70,&H00FFFFFF,&H00FFFFFF,&H008A3078,&H008A3078,1,0,0,0,100,100,0,0,3,18,0,5,40,40,0,1
Style: Gold,Baloo Da 2,120,&H0035C8FF,&H0035C8FF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,6,4,5,40,40,0,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
ev=[]
def add(a,b,style,text,layer=1): ev.append(f"Dialogue: {layer},{ts(a)},{ts(b)},{style},,0,0,0,,{text}")
pop=r"{\fscx40\fscy40\t(0,140,\fscx112\fscy112)\t(140,240,\fscx100\fscy100)}"
fade=r"{\fad(0,150)}"
# HOOK 0-4.1: two lines popping on their words
add(0.15,4.1,'Box',r"{\pos(540,330)\fad(100,150)}"+pop+"ঢাকা  —  নালিতাবাড়ী")
add(0.21,4.1,'Hook',r"{\pos(540,520)\fad(0,150)}"+pop+"নালিতাবাড়ী যাবেন?")
add(2.99,4.1,'Gold',r"{\pos(540,660)\fad(0,150)}"+pop+"বিশ্বস্ত সঙ্গী")
# brand slam on ইউনিটি
add(4.15,6.3,'Hook',r"{\pos(540,420)\fad(0,200)\fs170}"+pop+"ইউনিটি পরিবহন")
# route stops build up 7.9-15.2
stops=[('মিরপুর ঝুটপট্টি',6.93),('নালিতাবাড়ী',8.49),('নয়াবিল',9.43),('চারালি',10.17),('বারোমারী',10.95),('নন্নী',12.13)]
for i,(n,t) in enumerate(stops):
    y=300+i*120
    add(t,15.2,'Box',r"{\an4\pos(70,%d)\fad(0,200)}"%y+r"{\fscx40\fscy40\t(0,120,\fscx105\fscy105)\t(120,220,\fscx100\fscy100)}"+f"{i+1}.  {n}")
# daily time card
add(16.37,21.3,'Box',r"{\pos(540,380)\fad(0,200)}"+pop+"প্রতিদিন")
add(18.19,21.3,'Gold',r"{\pos(540,540)\fad(0,200)\fs170}"+pop+"সন্ধ্যা ৭:১০")
add(19.75,21.3,'Box',r"{\pos(540,700)\fad(0,200)}"+pop+"মিরপুর থেকে বাস ছাড়ে")
# ticket card
add(28.07,33.6,'Hook',r"{\pos(540,380)\fad(0,200)\fs120}"+pop+"টিকিট ও বিস্তারিত")
add(30.87,33.6,'Box',r"{\pos(540,560)\fad(0,200)}"+pop+"মিরপুর ঝুটপট্টি কাউন্টার")
# phone number typed digit-by-digit exactly as spoken
bn=dict(zip('0123456789','০১২৩৪৫৬৭৮৯'));dig={'জিরো':'0','ওয়ান':'1','সিক':'6','সিক্স':'6','সেভেন':'7','থ্রি':'3','টু':'2','ফোর':'4','তিন':'3','ত্রি':'3'}
D=[(w['start'],dig[w['text']]) for w in W if 21.9<w['start']<27.9 and w['text'] in dig]
add(22.0,28.0,'Box',r"{\pos(540,330)\fad(100,150)}"+pop+"যোগাযোগ করুন")
for k,(t,_) in enumerate(D):
    e=D[k+1][0] if k+1<len(D) else 33.6
    txt=''.join(bn[d] for _,d in D[:k+1])
    if len(txt)>5: txt=txt[:5]+'-'+txt[5:]
    add(t,e,'Gold',r"{\pos(540,780)\fs130}"+txt)
open('/home/claude/VideoWork/hook/build/phone.txt','w').write(''.join(d for _,d in D))
# end
add(33.69,39.14,'Hook',r"{\pos(540,380)\fad(0,300)\fs170}"+pop+"ইউনিটি পরিবহন")
add(35.0,39.14,'Gold',r"{\pos(540,560)\fad(0,300)\fs96}"+pop+"আপনার যাত্রায় নির্ভরতার সঙ্গী")
# word captions: phrases of up to 4 words, active word gold
phr=[];cur=[]
for w in W:
    if cur and (len(cur)==4 or w['start']-cur[-1]['end']>0.5): phr.append(cur);cur=[]
    cur.append(w)
phr.append(cur)
for p in phr:
    if p[0]['start']>=21.5 and p[-1]['end']<=28.0: continue  # phone digits: skip until number confirmed
    end=p[-1]['end']+0.15
    for i,w in enumerate(p):
        a=w['start']; b=p[i+1]['start'] if i+1<len(p) else end
        txt=' '.join((r"{\c"+GOLD+r"\fscx112\fscy112}"+x['text']+r"{\c"+WHITE+r"\fscx100\fscy100}") if j==i else x['text'] for j,x in enumerate(p))
        add(a,b,'Cap',r"{\pos(540,1150)}"+txt,2)
open('/home/claude/VideoWork/hook/build/fx.ass','w').write(hdr+'\n'.join(ev)+'\n')
hits=[0.15,4.15,6.93,16.37,18.19,28.07,33.69]
json.dump(hits,open('/home/claude/VideoWork/hook/build/hits.json','w'))
