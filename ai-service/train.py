import os
import io
import cv2
import numpy as np
from PIL import Image, ImageChops, ImageEnhance

DATA_DIR = "dataset"
WEIGHTS_DIR = "weights"

def evaluate_ela(cv_img: np.ndarray) -> float:
    pil_image = Image.fromarray(cv2.cvtColor(cv_img, cv2.COLOR_BGR2RGB))
    buf = io.BytesIO()
    pil_image.save(buf, "JPEG", quality=90)
    buf.seek(0)
    resaved = Image.open(buf)
    diff = ImageChops.difference(pil_image, resaved)
    extrema = diff.getextrema()
    max_diff = max([ex[1] for ex in extrema]) if extrema else 1
    scale = 255.0 / max(max_diff, 1)
    diff = ImageEnhance.Brightness(diff).enhance(scale)
    return float(np.mean(np.array(diff)) / 255.0)

def evaluate_fft(cv_img: np.ndarray) -> float:
    gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
    f = np.fft.fft2(gray)
    fshift = np.fft.fftshift(f)
    magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1e-9)
    h, w = gray.shape
    crow, ccol = h // 2, w // 2
    mask = np.ones((h, w), np.uint8)
    r = min(crow, ccol) // 4
    cv2.circle(mask, (ccol, crow), r, 0, -1)
    return float(np.mean(magnitude_spectrum[mask == 1]))

def evaluate_laplacian(cv_img: np.ndarray) -> float:
    gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())

def evaluate_chroma(cv_img: np.ndarray) -> float:
    ycrcb = cv2.cvtColor(cv_img, cv2.COLOR_BGR2YCrCb)
    _, cr, cb = cv2.split(ycrcb)
    diff = np.abs(cr.astype(np.float32) - cb.astype(np.float32))
    return float(np.std(diff))

def extract_features(img_path: str):
    img = cv2.imread(img_path)
    if img is None:
        return None
    return [evaluate_ela(img), evaluate_fft(img), evaluate_laplacian(img), evaluate_chroma(img)]

def load_split(split_name: str):
    X, y = [], []
    classes = {"REAL": 1, "FAKE": 0}
    for label_name, label_val in classes.items():
        folder = os.path.join(DATA_DIR, split_name, label_name)
        if not os.path.exists(folder):
            continue
        for fname in os.listdir(folder):
            path = os.path.join(folder, fname)
            feats = extract_features(path)
            if feats is not None:
                X.append(feats)
                y.append(label_val)
    return np.array(X, dtype=np.float32), np.array(y, dtype=np.float32)

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-np.clip(z, -25.0, 25.0)))

def main():
    print("--> Extracting forensic feature matrices from dataset...")
    X_train, y_train = load_split("train")
    X_val, y_val = load_split("val")

    if len(X_train) == 0:
        print("Error: No training data found in dataset/train.")
        return

    print(f"--> Training set: {X_train.shape[0]} samples across 4 forensic dimensions.")
    print(f"--> Validation set: {X_val.shape[0]} samples.")

    # 1. Feature normalization (Z-score standard scaling)
    mean = np.mean(X_train, axis=0)
    std = np.std(X_train, axis=0) + 1e-7

    X_train_norm = (X_train - mean) / std
    X_val_norm = (X_val - mean) / std

    # 2. Train Neural Classifier (Logistic Regression / Perceptron with L2 Regularization)
    print("--> Training Native Neural Classifier...")
    np.random.seed(42)
    weights = np.random.randn(4) * 0.01
    bias = 0.0
    lr = 0.05
    epochs = 400
    reg = 0.001

    m = X_train_norm.shape[0]

    for epoch in range(epochs):
        logits = np.dot(X_train_norm, weights) + bias
        preds = sigmoid(logits)
        
        # Gradients
        dw = (1 / m) * np.dot(X_train_norm.T, (preds - y_train)) + reg * weights
        db = (1 / m) * np.sum(preds - y_train)

        weights -= lr * dw
        bias -= lr * db

    # 3. Evaluate on Validation Set
    val_preds = sigmoid(np.dot(X_val_norm, weights) + bias)
    val_classes = (val_preds >= 0.5).astype(np.float32)
    accuracy = np.mean(val_classes == y_val) * 100.0

    print(f"--> Training Complete! Validation Accuracy: {accuracy:.2f}%")
    print(f"--> Learned Weights: {weights}")
    print(f"--> Learned Bias: {bias:.4f}")

    os.makedirs(WEIGHTS_DIR, exist_ok=True)
    out_file = os.path.join(WEIGHTS_DIR, "forensic_model.npz")
    np.savez(out_file, weights=weights, bias=bias, mean=mean, std=std)
    print(f"--> Model successfully saved to {out_file}")

if __name__ == "__main__":
    main()