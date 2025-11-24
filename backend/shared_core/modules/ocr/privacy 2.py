import cv2
import io
import numpy as np
from PIL import Image


FACE = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
PLATE = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_russian_plate_number.xml")


def _nd(b: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(b)).convert("RGB")
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)


def _to_bytes(img: np.ndarray) -> bytes:
    _, enc = cv2.imencode(".jpg", img, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
    return enc.tobytes()


def blur_faces_and_plates(b: bytes) -> bytes:
    img = _nd(b)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    boxes = list(FACE.detectMultiScale(gray, 1.2, 5, minSize=(30, 30))) + list(
        PLATE.detectMultiScale(gray, 1.1, 5, minSize=(40, 20))
    )
    for x, y, w, h in boxes:
        roi = img[y : y + h, x : x + w]
        roi = cv2.GaussianBlur(roi, (51, 51), 30)
        img[y : y + h, x : x + w] = roi
    return _to_bytes(img)
