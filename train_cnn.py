"""
Train real CNN on MNIST, export weights for browser inference.
Architecture: Conv→ReLU→Pool→Conv→ReLU→Pool→FC→ReLU→FC→Softmax
"""
import json, os, torch, torch.nn as nn, torch.nn.functional as F
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

# ====== Model ======
class MNIST_CNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 4, 3)      # 28→26
        self.conv2 = nn.Conv2d(4, 8, 3)      # 13→11
        self.pool = nn.MaxPool2d(2)           # 26→13, 11→5
        self.fc1 = nn.Linear(8 * 5 * 5, 32)
        self.fc2 = nn.Linear(32, 10)

    def forward(self, x):
        x = F.relu(self.conv1(x))            # (B,4,26,26)
        x = self.pool(x)                      # (B,4,13,13)
        x = F.relu(self.conv2(x))            # (B,8,11,11)
        x = self.pool(x)                      # (B,8,5,5)
        x = x.view(x.size(0), -1)             # (B,200)
        x = F.relu(self.fc1(x))               # (B,32)
        x = self.fc2(x)                       # (B,10)
        return x

# ====== Data ======
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.1307,), (0.3081,))
])
train_ds = datasets.MNIST('./.mnist_pytorch', train=True, download=True, transform=transform)
test_ds  = datasets.MNIST('./.mnist_pytorch', train=False, download=True, transform=transform)
train_loader = DataLoader(train_ds, batch_size=64, shuffle=True)
test_loader  = DataLoader(test_ds, batch_size=1000)

# ====== Train ======
device = torch.device('cpu')
model = MNIST_CNN().to(device)
opt = torch.optim.Adam(model.parameters(), lr=0.003)
scheduler = torch.optim.lr_scheduler.StepLR(opt, step_size=5, gamma=0.5)

for epoch in range(15):
    model.train()
    total_loss = 0
    for x, y in train_loader:
        x, y = x.to(device), y.to(device)
        opt.zero_grad()
        loss = F.cross_entropy(model(x), y)
        loss.backward()
        opt.step()
        total_loss += loss.item()
    scheduler.step()

    # Validate
    model.eval()
    correct = 0
    with torch.no_grad():
        for x, y in test_loader:
            x, y = x.to(device), y.to(device)
            pred = model(x).argmax(dim=1)
            correct += (pred == y).sum().item()
    acc = correct / len(test_ds)
    print(f"Epoch {epoch+1:2d} | Loss: {total_loss/len(train_loader):.4f} | Val Acc: {acc:.4f}")

print(f"\nFinal test accuracy: {correct/len(test_ds)*100:.1f}%")

# ====== Export ======
def r(v): return round(float(v), 4)

state = {k: v.cpu().numpy() for k, v in model.state_dict().items()}
weights = {
    'conv1_k': [[[[r(v) for v in row] for row in ch] for ch in oc] for oc in state['conv1.weight']],
    'conv1_b': [r(b) for b in state['conv1.bias']],
    'conv2_k': [[[[r(v) for v in row] for row in ch] for ch in oc] for oc in state['conv2.weight']],
    'conv2_b': [r(b) for b in state['conv2.bias']],
    'fc1_W': [[r(v) for v in row] for row in state['fc1.weight'].T],  # (32,200)→(200,32)
    'fc1_b': [r(b) for b in state['fc1.bias']],
    'fc2_W': [[r(v) for v in row] for row in state['fc2.weight'].T],  # (10,32)→(32,10)
    'fc2_b': [r(b) for b in state['fc2.bias']],
}

out = os.path.join(os.path.dirname(__file__), 'public', 'demos', 'cnn_weights.js')
js = 'const CNN_WEIGHTS = ' + json.dumps(weights) + ';'
with open(out, 'w') as f:
    f.write(js)
print(f"\nWeights exported: {out} ({len(js)/1024:.1f} KB)")
