import os
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader

def train_and_export():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[*] Training device: {device}")

    # Standard computer vision normalization pipeline
    transforms_pipeline = {
        'train': transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.RandomHorizontalFlip(),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
        'val': transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
    }

    data_dir = "./dataset"
    if not os.path.exists(data_dir):
        print("[-] Directory structure missing. Creating scaffold...")
        for split in ['train', 'val']:
            for label in ['authentic', 'synthetic']:
                os.makedirs(os.path.join(data_dir, split, label), exist_ok=True)
        print("[-] Please place authentic and synthetic sample images in './dataset/train/' and './dataset/val/' and rerun.")
        return

    try:
        image_datasets = {
            x: datasets.ImageFolder(os.path.join(data_dir, x), transforms_pipeline[x])
            for x in ['train', 'val']
        }
    except Exception as e:
        print(f"[-] Error reading dataset: {e}")
        return

    dataloaders = {
        x: DataLoader(image_datasets[x], batch_size=16, shuffle=(x == 'train'), num_workers=0)
        for x in ['train', 'val']
    }

    # Load EfficientNet-B0 pretrained backbone
    model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)
    in_features = model.classifier[1].in_features
    # Binary output: 0 = Authentic, 1 = Synthetic
    model.classifier[1] = nn.Linear(in_features, 2)
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=1e-4)

    # 1 epoch is sufficient given the strong transfer learning convergence
    epochs = 1
    for epoch in range(epochs):
        for phase in ['train', 'val']:
            model.train() if phase == 'train' else model.eval()
            running_loss, running_corrects = 0.0, 0

            for inputs, labels in dataloaders[phase]:
                inputs, labels = inputs.to(device), labels.to(device)
                optimizer.zero_grad()

                with torch.set_grad_enabled(phase == 'train'):
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = criterion(outputs, labels)
                    if phase == 'train':
                        loss.backward()
                        optimizer.step()

                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

            epoch_acc = running_corrects.double() / len(image_datasets[phase])
            print(f"Epoch {epoch+1}/{epochs} [{phase}] Loss: {running_loss/len(image_datasets[phase]):.4f} Acc: {epoch_acc:.4f}")

    # Export to ONNX using legacy TorchScript backend (opset 14) to avoid dynamo dependency bugs
    model.eval()
    dummy_input = torch.randn(1, 3, 224, 224).to(device)
    export_path = "forensic_model.onnx"
    
    print("[*] Exporting model to ONNX format...")
    torch.onnx.export(
        model,
        dummy_input,
        export_path,
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        input_names=['input'],
        output_names=['output'],
        dynamic_axes={'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}}
    )
    print(f"[+] Trained model successfully exported as '{export_path}'")

if __name__ == '__main__':
    train_and_export()