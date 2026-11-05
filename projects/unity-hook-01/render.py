import json,subprocess,sys
H=json.load(open('hits.json'))+[22.09]
z='+'.join(f"0.14*exp(-7*(t-{h}))*gte(t,{h})" for h in H)
fl='+'.join(f"0.35*exp(-18*(t-{h}))*gte(t,{h})" for h in H)
S='/home/claude/video-create/assets/sfx/'
sfx=['whoosh-short.mp3','impact-bass-1.mp3','whoosh.mp3','whoosh-short.mp3','impact-bass-2.mp3','whoosh-short.mp3','impact-bass-1.mp3','whoosh-short.mp3']
cmd=['ffmpeg','-v','error','-y','-i','../src.mp4']
for s in sfx: cmd+=['-i',S+s]
vf=(f"[0:v]scale=1080:1920:flags=lanczos,scale=w='trunc(1080*(1+{z})/2)*2':h='trunc(1920*(1+{z})/2)*2':eval=frame,crop=1080:1920,"
    f"eq=brightness='{fl}':contrast=1.06:saturation=1.12:eval=frame,unsharp=5:5:0.5,ass=fx.ass:fontsdir=/home/claude/video-create/assets/fonts/bengali,setsar=1[v]")
a=''.join(f"[{i+1}:a]adelay={int(max(0,h-0.08)*1000)}:all=1,volume=0.45[s{i}];" for i,h in enumerate(H))
a+="[0:a]"+''.join(f"[s{i}]" for i in range(len(H)))+f"amix=inputs={len(H)+1}:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5[a]"
cmd+=['-filter_complex',vf+';'+a,'-map','[v]','-map','[a]','-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p','-g','24','-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart',sys.argv[1]]
subprocess.run(cmd,check=True)
