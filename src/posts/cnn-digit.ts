import type { Post } from './index'

const post: Post = {
  id: 'cnn-digit',
  title: 'CNN 手写数字识别',
  titleEn: 'CNN Handwritten Digit Recognition',
  summary: '从零实现卷积神经网络进行 MNIST 手写数字识别：卷积→ReLU→池化→全连接→Softmax，完整管道可视化。',
  summaryEn: 'Build a CNN for MNIST digit recognition: Conv→ReLU→Pool→FC→Softmax with full pipeline visualization.',
  category: 'ai',
  tags: ['CNN', 'MNIST', 'PyTorch', '深度学习'],
  date: '2024-06',
  cover: '🧠',
  sections: [
    { type: 'heading', content: '项目概述', id: 'overview' },
    { type: 'text', content: '手写数字识别是深度学习的 Hello World。本项目实现一个完整的卷积神经网络，在 MNIST 数据集上训练，准确率达 99%+。核心亮点是将 CNN 的每一层处理过程可视化，直观展示卷积、激活、池化和全连接层的特征变换。' },
    { type: 'heading', content: 'CNN 网络结构', id: 'architecture' },
    { type: 'list', items: [
      '输入层：28×28 灰度图像',
      'Conv2D-1：3×3 卷积核 × 8 通道 → ReLU',
      'MaxPool-1：2×2 → 14×14',
      'Conv2D-2：3×3 卷积核 × 16 通道 → ReLU',
      'MaxPool-2：2×2 → 7×7',
      'Flatten → Dense(128) → ReLU → Dropout(0.5)',
      'Dense(10) → Softmax → 输出 0-9 概率分布',
    ] },
    { type: 'heading', content: '卷积层实现', id: 'conv' },
    { type: 'text', content: '卷积层是 CNN 的核心。每个卷积核在输入图像上滑动，计算局部区域的加权和，提取边缘、纹理等低级特征。第一层检测边缘和角点，第二层组合出更复杂的形状。' },
    { type: 'code', lang: 'python', content: `class Conv2D:
    def __init__(self, in_channels, out_channels, kernel_size=3):
        # He initialization for ReLU
        self.kernels = np.random.randn(
            out_channels, in_channels, kernel_size, kernel_size
        ) * np.sqrt(2.0 / (in_channels * kernel_size * kernel_size))
    
    def forward(self, x):
        # x: (C, H, W)
        out_h = x.shape[1] - self.kernels.shape[2] + 1
        out_w = x.shape[2] - self.kernels.shape[3] + 1
        out = np.zeros((self.kernels.shape[0], out_h, out_w))
        for oc in range(self.kernels.shape[0]):
            for ic in range(self.kernels.shape[1]):
                for i in range(out_h):
                    for j in range(out_w):
                        out[oc, i, j] += np.sum(
                            x[ic, i:i+3, j:j+3] * self.kernels[oc, ic]
                        )
        return out`, explanation: '卷积操作四重循环：遍历输出通道、输入通道、高度、宽度。每个输出位置是 3×3 窗口与卷积核的点积。He 初始化保证 ReLU 激活后的梯度尺度稳定。' },
    { type: 'heading', content: 'ReLU + MaxPooling', id: 'relu-pool' },
    { type: 'code', lang: 'python', content: `# ReLU: f(x) = max(0, x)
def relu(x):
    return np.maximum(0, x)

# MaxPooling 2×2
def max_pool2d(x, pool_size=2):
    c, h, w = x.shape
    out_h, out_w = h // pool_size, w // pool_size
    out = np.zeros((c, out_h, out_w))
    for ch in range(c):
        for i in range(out_h):
            for j in range(out_w):
                out[ch, i, j] = np.max(
                    x[ch, i*2:i*2+2, j*2:j*2+2]
                )
    return out`, explanation: 'ReLU 引入非线性，将负值置零。MaxPooling 在 2×2 窗口取最大值，实现降采样——保留最强特征的同时将尺寸减半，减少参数量和计算量。' },
    { type: 'heading', content: '全连接层 + Softmax', id: 'fc' },
    { type: 'code', lang: 'python', content: `# 展平 7×7×16 → 784 维向量
flattened = conv_output.reshape(-1)

# 全连接层
fc1 = np.maximum(0, flattened @ W1 + b1)  # 784 → 128, ReLU
dropout_mask = np.random.binomial(1, 0.5, 128) / 0.5
fc1_dropout = fc1 * dropout_mask
logits = fc1_dropout @ W2 + b2  # 128 → 10

# Softmax
exp_logits = np.exp(logits - np.max(logits))
probs = exp_logits / np.sum(exp_logits)
predicted = np.argmax(probs)`, explanation: '展平将三维特征图变成一维向量。Dropout 在训练时随机丢弃 50% 神经元防止过拟合。Softmax 将 logits 转换为概率分布——所有输出之和为 1，最大值对应预测数字。' },
    { type: 'heading', content: '训练过程', id: 'training' },
    { type: 'text', content: '使用交叉熵损失和 Adam 优化器，在 60,000 张训练图像上迭代 10 个 epoch，batch size 64。训练曲线显示：前 3 个 epoch 快速收敛至 97%+，后续 epoch 逐步提升至 99.2%。' },
    { type: 'heading', content: '在线体验', id: 'demo' },
    { type: 'text', content: '在下方 Demo 中绘制一个数字 (0-9)，观察 CNN 逐层处理的全过程：从原始输入 → 边缘检测 → 特征提取 → 模板匹配 → 最终预测。每一步都有动画展示。' },
  ],
  sectionsEn: [
    { type: 'heading', content: 'Project Overview', id: 'overview' },
    { type: 'text', content: 'Handwritten digit recognition is the "Hello World" of deep learning. This project implements a complete convolutional neural network trained on the MNIST dataset, achieving 99%+ accuracy. The core highlight is visualizing each layer of the CNN, intuitively showing the feature transformations through convolution, activation, pooling, and fully-connected layers.' },
    { type: 'heading', content: 'CNN Architecture', id: 'architecture' },
    { type: 'list', items: [
      'Input layer: 28×28 grayscale image',
      'Conv2D-1: 3×3 kernels × 8 channels → ReLU',
      'MaxPool-1: 2×2 → 14×14',
      'Conv2D-2: 3×3 kernels × 16 channels → ReLU',
      'MaxPool-2: 2×2 → 7×7',
      'Flatten → Dense(128) → ReLU → Dropout(0.5)',
      'Dense(10) → Softmax → output 0-9 probability distribution',
    ] },
    { type: 'heading', content: 'Convolution Layer Implementation', id: 'conv' },
    { type: 'text', content: 'The convolution layer is the core of CNN. Each kernel slides over the input image, computing the weighted sum of local regions, extracting low-level features like edges and textures. The first layer detects edges and corners; the second layer combines them into more complex shapes.' },
    { type: 'code', lang: 'python', content: `class Conv2D:
    def __init__(self, in_channels, out_channels, kernel_size=3):
        # He initialization for ReLU
        self.kernels = np.random.randn(
            out_channels, in_channels, kernel_size, kernel_size
        ) * np.sqrt(2.0 / (in_channels * kernel_size * kernel_size))

    def forward(self, x):
        # x: (C, H, W)
        out_h = x.shape[1] - self.kernels.shape[2] + 1
        out_w = x.shape[2] - self.kernels.shape[3] + 1
        out = np.zeros((self.kernels.shape[0], out_h, out_w))
        for oc in range(self.kernels.shape[0]):
            for ic in range(self.kernels.shape[1]):
                for i in range(out_h):
                    for j in range(out_w):
                        out[oc, i, j] += np.sum(
                            x[ic, i:i+3, j:j+3] * self.kernels[oc, ic]
                        )
        return out`, explanation: 'Convolution uses four nested loops: iterating over output channels, input channels, height, and width. Each output position is the dot product of a 3×3 window and the kernel. He initialization ensures stable gradient scales after ReLU activation.' },
    { type: 'heading', content: 'ReLU + MaxPooling', id: 'relu-pool' },
    { type: 'code', lang: 'python', content: `# ReLU: f(x) = max(0, x)
def relu(x):
    return np.maximum(0, x)

# MaxPooling 2×2
def max_pool2d(x, pool_size=2):
    c, h, w = x.shape
    out_h, out_w = h // pool_size, w // pool_size
    out = np.zeros((c, out_h, out_w))
    for ch in range(c):
        for i in range(out_h):
            for j in range(out_w):
                out[ch, i, j] = np.max(
                    x[ch, i*2:i*2+2, j*2:j*2+2]
                )
    return out`, explanation: 'ReLU introduces non-linearity by zeroing negative values. MaxPooling takes the maximum in a 2×2 window for downsampling — preserving the strongest features while halving dimensions, reducing parameters and computation.' },
    { type: 'heading', content: 'Fully Connected + Softmax', id: 'fc' },
    { type: 'code', lang: 'python', content: `# Flatten 7×7×16 → 784-dim vector
flattened = conv_output.reshape(-1)

# Fully connected layer
fc1 = np.maximum(0, flattened @ W1 + b1)  # 784 → 128, ReLU
dropout_mask = np.random.binomial(1, 0.5, 128) / 0.5
fc1_dropout = fc1 * dropout_mask
logits = fc1_dropout @ W2 + b2  # 128 → 10

# Softmax
exp_logits = np.exp(logits - np.max(logits))
probs = exp_logits / np.sum(exp_logits)
predicted = np.argmax(probs)`, explanation: 'Flatten converts the 3D feature map into a 1D vector. Dropout randomly drops 50% of neurons during training to prevent overfitting. Softmax converts logits into a probability distribution — all outputs sum to 1, with the maximum corresponding to the predicted digit.' },
    { type: 'heading', content: 'Training Process', id: 'training' },
    { type: 'text', content: 'Using cross-entropy loss and Adam optimizer, iterating 10 epochs over 60,000 training images with batch size 64. The training curve shows: rapid convergence to 97%+ within the first 3 epochs, gradually improving to 99.2% in subsequent epochs.' },
    { type: 'heading', content: 'Live Demo', id: 'demo' },
    { type: 'text', content: 'In the demo below, draw a digit (0-9) and watch the full CNN layer-by-layer processing: from raw input → edge detection → feature extraction → template matching → final prediction. Each step is animated.' },
  ],
}

export default post
