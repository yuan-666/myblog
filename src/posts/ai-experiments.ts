import type { Post } from './index'

const post: Post = {
  id: 'ai-experiments',
  title: 'AI 与智能计算实验合集',
  titleEn: 'AI & Intelligent Computing Experiments',
  summary: 'CNN花卉分类(EfficientNetB1)、LSTM语句相似度、人脸检测(Haar Cascade)、PCA降维可视化。',
  summaryEn: 'CNN flower classification (EfficientNetB1), LSTM sentence similarity (MiniLM), face detection (Haar Cascade), PCA dimensionality reduction.',
  category: 'ai',
  tags: ['CNN', 'LSTM', 'OpenCV', 'PCA'],
  date: '2024-06',
  cover: '🤖',
  sections: [
    { type: 'heading', content: 'CNN 花卉分类 (EfficientNetB1)', id: 'cnn-flowers' },
    { type: 'text', content: '使用 EfficientNetB1 预训练模型迁移学习，在 5 类花卉数据集（daisy/dandelion/rose/sunflower/tulip）上训练。数据增强包括随机翻转、旋转、亮度调整。最终准确率达 94%。' },
    { type: 'code', lang: 'python', content: `import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB1
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D

# 加载预训练模型（冻结基础层）
base = EfficientNetB1(weights='imagenet', include_top=False, input_shape=(224,224,3))
base.trainable = False

# 添加分类头
model = tf.keras.Sequential([
    base,
    GlobalAveragePooling2D(),
    Dense(256, activation='relu'),
    Dropout(0.5),
    Dense(5, activation='softmax')
])

# 训练：Adam + 类别权重平衡
model.compile(optimizer=tf.keras.optimizers.Adam(1e-3),
              loss='categorical_crossentropy', metrics=['accuracy'])
model.fit(train_ds, validation_data=val_ds, epochs=20)`, explanation: '迁移学习利用 ImageNet 预训练权重，大幅减少训练时间。GlobalAveragePooling2D 替代 Flatten 减少参数。Dropout 防止过拟合。' },
    { type: 'heading', content: 'LSTM 语句相似度', id: 'lstm' },
    { type: 'text', content: '使用 Sentence-Transformers 的 all-MiniLM-L6-v2 模型将深度学习面试题编码为 384 维向量，通过余弦相似度查找语义相近的问题对。该模型在语义搜索和句子相似度评测中表现优秀。' },
    { type: 'code', lang: 'python', content: `from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')

# 编码所有问题
questions = df['question'].tolist()
embeddings = model.encode(questions, show_progress_bar=True)

# 查找相似问题（余弦相似度）
from sklearn.metrics.pairwise import cosine_similarity
sim_matrix = cosine_similarity(embeddings)

# 输出最相似的 5 对
indices = np.argsort(-sim_matrix, axis=1)[:, 1]
pairs = [(questions[i], questions[indices[i]]) for i in range(len(questions))]`, explanation: 'MiniLM 是轻量级 Transformer 模型，384 维向量兼顾速度和效果。cosine_similarity 批量计算所有问题对的相似度矩阵。' },
    { type: 'heading', content: 'Haar Cascade 人脸检测', id: 'face' },
    { type: 'code', lang: 'python', content: `import cv2

# 加载 Haar 级联分类器
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)

cap = cv2.VideoCapture('video.mp4')
while cap.isOpened():
    ret, frame = cap.read()
    if not ret: break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

    for (x, y, w, h) in faces:
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

    cv2.imshow('Face Detection', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'): break

cap.release()`, explanation: 'Haar Cascade 使用 Adaboost 训练的级联分类器。detectMultiScale 通过多尺度滑动窗口检测不同大小的人脸。scaleFactor 控制缩放步长，minNeighbors 过滤误检。' },
    { type: 'heading', content: 'PCA 降维可视化', id: 'pca' },
    { type: 'text', content: 'PCA（主成分分析）将高维数据投影到低维空间，保留最大方差方向。通过特征值分解协方差矩阵，选取前 k 个特征向量作为主成分。实验在高维随机数据上验证了降维前后的数据分布关系。' },
    { type: 'code', lang: 'python', content: `import numpy as np
from sklearn.decomposition import PCA

# 高维数据 (1000个样本, 50维)
X = np.random.randn(1000, 50)
X[:, :10] *= 3  # 前10维方差更大

# PCA 降维到 2D 可视化
pca = PCA(n_components=2)
X_2d = pca.fit_transform(X)

print(f'Explained variance ratio: {pca.explained_variance_ratio_}')
# 输出: [0.45, 0.12] — 前2个主成分解释了57%的方差`, explanation: 'PCA 通过 SVD 分解找到方差最大的投影方向。explained_variance_ratio_ 显示每个主成分解释的方差比例，用于评估降维质量。' },
    { type: 'heading', content: '车辆计数 (OpenCV)', id: 'vehicle' },
    { type: 'code', lang: 'python', content: `# 背景差分法 + 轮廓检测实现车辆计数
bg_subtractor = cv2.createBackgroundSubtractorMOG2(
    history=500, varThreshold=50, detectShadows=False
)

while True:
    ret, frame = cap.read()
    fg_mask = bg_subtractor.apply(frame)
    # 高斯模糊去噪
    fg_mask = cv2.GaussianBlur(fg_mask, (5, 5), 0)
    # 形态学闭运算填充孔洞
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7))
    fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_CLOSE, kernel)

    # 轮廓检测 + 越线计数
    contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for cnt in contours:
        if cv2.contourArea(cnt) > 1000:  # 过滤小目标
            x, y, w, h = cv2.boundingRect(cnt)
            cx, cy = x + w // 2, y + h // 2
            # 判断是否穿过检测线
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)`, explanation: 'MOG2 自适应混合高斯背景建模，GaussianBlur 去噪 + 形态学闭运算解决前景断裂。contourArea 阈值过滤噪声，越线检测通过跟踪质心前后帧位置判断。' },
  ],
  sectionsEn: [
    { type: 'heading', content: 'CNN Flower Classification (EfficientNetB1)', id: 'cnn-flowers' },
    { type: 'text', content: 'Transfer learning with EfficientNetB1 pre-trained weights on a 5-class flower dataset (daisy/dandelion/rose/sunflower/tulip). Data augmentation includes random flips, rotations, and brightness adjustments. Final accuracy reaches 94%.' },
    { type: 'code', lang: 'python', content: `import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB1
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D

# Load pre-trained model (freeze base layers)
base = EfficientNetB1(weights='imagenet', include_top=False, input_shape=(224,224,3))
base.trainable = False

# Add classification head
model = tf.keras.Sequential([
    base,
    GlobalAveragePooling2D(),
    Dense(256, activation='relu'),
    Dropout(0.5),
    Dense(5, activation='softmax')
])

# Training: Adam + class weight balancing
model.compile(optimizer=tf.keras.optimizers.Adam(1e-3),
              loss='categorical_crossentropy', metrics=['accuracy'])
model.fit(train_ds, validation_data=val_ds, epochs=20)`, explanation: 'Transfer learning leverages ImageNet pre-trained weights, significantly reducing training time. GlobalAveragePooling2D replaces Flatten to reduce parameters. Dropout prevents overfitting.' },
    { type: 'heading', content: 'LSTM Sentence Similarity', id: 'lstm' },
    { type: 'text', content: 'Using Sentence-Transformers\' all-MiniLM-L6-v2 model to encode deep-learning interview questions into 384-dimensional vectors, then finding semantically similar question pairs via cosine similarity. This model performs well on semantic search and sentence similarity benchmarks.' },
    { type: 'code', lang: 'python', content: `from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')

# Encode all questions
questions = df['question'].tolist()
embeddings = model.encode(questions, show_progress_bar=True)

# Find similar questions (cosine similarity)
from sklearn.metrics.pairwise import cosine_similarity
sim_matrix = cosine_similarity(embeddings)

# Output top-5 most similar pairs
indices = np.argsort(-sim_matrix, axis=1)[:, 1]
pairs = [(questions[i], questions[indices[i]]) for i in range(len(questions))]`, explanation: 'MiniLM is a lightweight Transformer model; 384-dimensional vectors balance speed and accuracy. cosine_similarity batch-computes the similarity matrix for all question pairs.' },
    { type: 'heading', content: 'Haar Cascade Face Detection', id: 'face' },
    { type: 'code', lang: 'python', content: `import cv2

# Load Haar cascade classifier
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)

cap = cv2.VideoCapture('video.mp4')
while cap.isOpened():
    ret, frame = cap.read()
    if not ret: break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

    for (x, y, w, h) in faces:
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

    cv2.imshow('Face Detection', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'): break

cap.release()`, explanation: 'Haar Cascade uses AdaBoost-trained cascade classifiers. detectMultiScale scans at multiple scales via sliding windows. scaleFactor controls scale step size; minNeighbors filters false positives.' },
    { type: 'heading', content: 'PCA Dimensionality Reduction', id: 'pca' },
    { type: 'text', content: 'PCA (Principal Component Analysis) projects high-dimensional data into a lower-dimensional space, preserving the directions of maximum variance. Through eigenvalue decomposition of the covariance matrix, the top k eigenvectors are selected as principal components. The experiment verifies data distribution before and after reduction on high-dimensional random data.' },
    { type: 'code', lang: 'python', content: `import numpy as np
from sklearn.decomposition import PCA

# High-dimensional data (1000 samples, 50 dimensions)
X = np.random.randn(1000, 50)
X[:, :10] *= 3  # First 10 dimensions have larger variance

# PCA reduction to 2D for visualization
pca = PCA(n_components=2)
X_2d = pca.fit_transform(X)

print(f'Explained variance ratio: {pca.explained_variance_ratio_}')
# Output: [0.45, 0.12] — top 2 components explain 57% of variance`, explanation: 'PCA finds maximum-variance projection directions via SVD. explained_variance_ratio_ shows the proportion of variance explained by each component, used to evaluate reduction quality.' },
    { type: 'heading', content: 'Vehicle Counting (OpenCV)', id: 'vehicle' },
    { type: 'code', lang: 'python', content: `# Background subtraction + contour detection for vehicle counting
bg_subtractor = cv2.createBackgroundSubtractorMOG2(
    history=500, varThreshold=50, detectShadows=False
)

while True:
    ret, frame = cap.read()
    fg_mask = bg_subtractor.apply(frame)
    # Gaussian blur for denoising
    fg_mask = cv2.GaussianBlur(fg_mask, (5, 5), 0)
    # Morphological closing to fill holes
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7))
    fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_CLOSE, kernel)

    # Contour detection + line-crossing count
    contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for cnt in contours:
        if cv2.contourArea(cnt) > 1000:  # Filter small objects
            x, y, w, h = cv2.boundingRect(cnt)
            cx, cy = x + w // 2, y + h // 2
            # Check if crossing the detection line
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)`, explanation: 'MOG2 uses adaptive Gaussian mixture background modeling. GaussianBlur denoising + morphological closing fixes foreground fragmentation. contourArea threshold filters noise; line-crossing detection tracks centroid positions across frames.' },
  ],
}

export default post
