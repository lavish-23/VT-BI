import os
import cv2
import numpy as np
import onnxruntime as ort

MODEL_FILE = os.path.join(os.path.dirname(__file__), "forensic_model.onnx")

session = None
if os.path.exists(MODEL_FILE):
    session = ort.InferenceSession(MODEL_FILE, providers=['CPUExecutionProvider'])

def evaluate_media_ml(file_bytes: bytes) -> dict:
    if session is None:
        return {
            "loaded": False,
            "ml_score": 75,
            "is_synthetic": False,
            "confidence": 0.0,
            "summary": "Deep learning weights not found (using heuristic fallback)."
        }

    try:
        nparr = np.frombuffer(file_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if image is None:
            return {"loaded": False, "ml_score": 70, "is_synthetic": False, "confidence": 0.0, "summary": "Unreadable image buffer"}

        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Scale to 224x224 and normalize
        resized = cv2.resize(image_rgb, (224, 224)).astype(np.float32) / 255.0
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        norm_img = (resized - mean) / std

        # Transpose from (H, W, C) to (1, C, H, W)
        tensor = np.transpose(norm_img, (2, 0, 1))
        tensor = np.expand_dims(tensor, axis=0)

        # Execute ONNX forward pass
        input_name = session.get_inputs()[0].name
        raw_logits = session.run(None, {input_name: tensor})[0][0]

        # Softmax probability distribution
        exp_logits = np.exp(raw_logits - np.max(raw_logits))
        probabilities = exp_logits / exp_logits.sum()

        authentic_prob = float(probabilities[0])
        synthetic_prob = float(probabilities[1])

        is_synthetic = synthetic_prob > 0.50
        confidence = round(max(authentic_prob, synthetic_prob) * 100, 1)

        return {
            "loaded": True,
            "ml_score": int(round(authentic_prob * 100)),
            "is_synthetic": is_synthetic,
            "confidence": confidence,
            "summary": f"Neural Network Certainty: {confidence}% ({'Authentic camera characteristics' if not is_synthetic else 'Synthetic diffusion traces'})"
        }
    except Exception as err:
        return {
            "loaded": False,
            "ml_score": 70,
            "is_synthetic": False,
            "confidence": 0.0,
            "summary": f"Inference execution failed: {str(err)}"
        }