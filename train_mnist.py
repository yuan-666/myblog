import numpy as np
import json

# Generate synthetic MNIST-like training data
np.random.seed(42)

def draw_digit(digit, noise=0.15, jitter=2, scale_var=0.15):
    """Draw digit on 28x28 canvas with variations"""
    canvas = np.zeros((28, 28), dtype=np.float32)
    
    # Basic stroke paths for each digit (in 28x28 coords)
    strokes = {
        0: [(14,5),(20,8),(23,14),(20,20),(14,23),(8,20),(5,14),(8,8),(14,5)],
        1: [(12,10),(14,5),(14,24)],
        2: [(8,8),(20,7),(22,12),(16,18),(8,18),(8,22),(22,22)],
        3: [(8,8),(20,8),(22,14),(14,15),(22,18),(20,22),(8,22)],
        4: [(18,6),(8,16),(8,24),(22,16)],
        5: [(20,8),(8,8),(7,14),(18,15),(22,18),(20,22),(8,22)],
        6: [(18,6),(10,10),(6,18),(10,24),(20,24),(24,16),(18,14),(10,16)],
        7: [(8,8),(22,8),(14,24)],
        8: [(14,6),(22,12),(14,16),(8,12),(14,6),(8,18),(14,22),(22,18),(14,16)],
        9: [(22,24),(12,20),(8,14),(12,10),(22,8),(24,16),(14,16),(8,16)],
    }
    
    pts = strokes.get(digit, [(14,14)])
    if len(pts) < 2: return canvas
    
    # Apply rotation and scale variation
    angle = np.random.uniform(-15, 15) * np.pi / 180
    cx, cy = 14, 14
    scale = 1 + np.random.uniform(-scale_var, scale_var)
    
    jittered = []
    for x, y in pts:
        # Jitter
        x += np.random.uniform(-jitter, jitter)
        y += np.random.uniform(-jitter, jitter)
        # Rotate + scale around center
        dx, dy = (x - cx) * scale, (y - cy) * scale
        rx = cx + dx * np.cos(angle) - dy * np.sin(angle)
        ry = cy + dx * np.sin(angle) + dy * np.cos(angle)
        jittered.append((rx, ry))
    
    # Draw thick stroke using Bresenham-like interpolation
    for i in range(len(jittered) - 1):
        x1, y1 = jittered[i]
        x2, y2 = jittered[i + 1]
        steps = max(abs(int(x2 - x1)), abs(int(y2 - y1)), 1)
        for s in range(steps):
            t = s / steps
            x = int(x1 + (x2 - x1) * t)
            y = int(y1 + (y2 - y1) * t)
            # Draw thick point
            for dx in range(-2, 3):
                for dy in range(-2, 3):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < 28 and 0 <= ny < 28:
                        dist = np.sqrt(dx*dx + dy*dy)
                        val = max(0, 1 - dist/3) * (0.7 + np.random.uniform(-noise, noise))
                        canvas[ny, nx] = max(canvas[ny, nx], val)
    
    # Add random noise
    canvas += np.random.uniform(-noise, noise, (28, 28))
    canvas = np.clip(canvas, 0, 1)
    
    # Center the digit
    rows = np.any(canvas > 0.2, axis=1)
    cols = np.any(canvas > 0.2, axis=0)
    if rows.any() and cols.any():
        rmin, rmax = np.where(rows)[0][[0, -1]]
        cmin, cmax = np.where(cols)[0][[0, -1]]
        h, w = rmax - rmin + 1, cmax - cmin + 1
        if h > 0 and w > 0:
            new_h, new_w = min(h + 4, 28), min(w + 4, 28)
            r_start = max(0, (28 - new_h) // 2)
            c_start = max(0, (28 - new_w) // 2)
            centered = np.zeros((28, 28), dtype=np.float32)
            r_src = max(0, rmin - 2)
            c_src = max(0, cmin - 2)
            copy_h = min(new_h, 28 - r_start, 28 - r_src)
            copy_w = min(new_w, 28 - c_start, 28 - c_src)
            centered[r_start:r_start+copy_h, c_start:c_start+copy_w] = canvas[r_src:r_src+copy_h, c_src:c_src+copy_w]
            canvas = centered
    
    return canvas


# Generate training data: 200 examples per digit
X_train = []
y_train = []
for digit in range(10):
    for _ in range(200):
        img = draw_digit(digit, noise=0.12, jitter=2.5, scale_var=0.2)
        X_train.append(img.flatten())
        y_train.append(digit)

X_train = np.array(X_train)
y_train = np.array(y_train)

# Convert to one-hot
y_onehot = np.zeros((len(y_train), 10))
y_onehot[np.arange(len(y_train)), y_train] = 1

# Train a simple 2-layer network: 784 -> 64 -> 10
input_size = 784
hidden_size = 16
output_size = 10
lr = 0.1
epochs = 200

W1 = np.random.randn(input_size, hidden_size) * np.sqrt(2.0 / input_size)
b1 = np.zeros(hidden_size)
W2 = np.random.randn(hidden_size, output_size) * np.sqrt(2.0 / hidden_size)
b2 = np.zeros(output_size)

for epoch in range(epochs):
    # Forward
    z1 = X_train @ W1 + b1
    a1 = np.maximum(0, z1)  # ReLU
    z2 = a1 @ W2 + b2
    # Softmax
    exp_z2 = np.exp(z2 - np.max(z2, axis=1, keepdims=True))
    probs = exp_z2 / np.sum(exp_z2, axis=1, keepdims=True)
    
    # Cross-entropy loss
    loss = -np.mean(np.sum(y_onehot * np.log(probs + 1e-8), axis=1))
    
    # Backward
    dz2 = probs - y_onehot
    dW2 = a1.T @ dz2 / len(X_train)
    db2 = np.mean(dz2, axis=0)
    da1 = dz2 @ W2.T
    dz1 = da1 * (z1 > 0)  # ReLU gradient
    dW1 = X_train.T @ dz1 / len(X_train)
    db1 = np.mean(dz1, axis=0)
    
    # Update
    W2 -= lr * dW2
    b2 -= lr * db2
    W1 -= lr * dW1
    b1 -= lr * db1
    
    if epoch % 20 == 0:
        pred = np.argmax(probs, axis=1)
        acc = np.mean(pred == y_train)
        print(f"Epoch {epoch}: loss={loss:.4f}, acc={acc:.4f}")

# Final accuracy
pred = np.argmax(probs, axis=1)
acc = np.mean(pred == y_train)
print(f"Final accuracy: {acc:.4f}")

# Export weights as compact JSON
weights = {
    'W1': W1.tolist(),
    'b1': b1.tolist(),
    'W2': W2.tolist(),
    'b2': b2.tolist(),
}

# Save compact version
with open('/Users/yuanhuang/code/web/myblog/public/demos/mnist_weights.json', 'w') as f:
    json.dump(weights, f)

# Also create a compact JS version (rounded to 3 decimals to save space)
js_weights = {
    'W1': [[round(w, 3) for w in row] for row in W1],
    'b1': [round(b, 3) for b in b1],
    'W2': [[round(w, 3) for w in row] for row in W2],
    'b2': [round(b, 3) for b in b2],
}

with open('/Users/yuanhuang/code/web/myblog/public/demos/mnist_weights.js', 'w') as f:
    f.write('const MNIST_WEIGHTS = ' + json.dumps(js_weights) + ';')

print(f"Weight JSON size: {len(json.dumps(weights))} chars")
print(f"Compact JS size: {len(json.dumps(js_weights))} chars")
