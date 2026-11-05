"""faces.py: where are the faces, every 0.25 s, in 1080x1920 output coordinates (YuNet, OpenCV).
    tools/pyenv/bin/python -I tools/hook-ad/faces.py <clip.mp4> <faces.json>
Used by accept_check.py: no text card may touch a face (STYLE §13). Model: assets/models/face-yunet-2023mar.onnx
(Hugging Face opencv/face_detection_yunet, MIT). Made 2026-11-04 (unity-hook-01)."""
import cv2, json, sys, os
src, out = sys.argv[1], sys.argv[2]
model = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "models", "face-yunet-2023mar.onnx")
cap = cv2.VideoCapture(src); fps = cap.get(cv2.CAP_PROP_FPS) or 24
W, H = 1080, 1920
det = cv2.FaceDetectorYN.create(model, "", (W, H), 0.7)
res, i, step = [], 0, max(1, round(fps / 4))
while True:
    ok, fr = cap.read()
    if not ok: break
    if i % step == 0:
        fr = cv2.resize(fr, (W, H))
        _, f = det.detect(fr)
        boxes = [] if f is None else [[int(x), int(y), int(w), int(h)] for x, y, w, h in f[:, :4]]
        res.append({"t": round(i / fps, 3), "faces": boxes})
    i += 1
json.dump(res, open(out, "w"))
print(f"{len(res)} samples, faces in {sum(1 for r in res if r['faces'])}")
