import type { Post } from './index'

const post: Post = {
  id: 'llm-explained',
  title: '大语言模型原理：从概率预测到智能工具',
  titleEn: 'How LLMs Work: From Probability to Intelligence',
  summary: '从底层数学出发解释大语言模型(LLM)的完整原理：Token化→嵌入→Transformer→自回归→RLHF→工具使用。',
  summaryEn: 'Complete LLM principles from the ground up: tokenization, embeddings, Transformer attention, autoregressive generation, RLHF alignment, and tool use.',
  category: 'ai',
  tags: ['LLM', 'Transformer', 'GPT', 'NLP'],
  date: '2025-05',
  cover: '💬',
  sections: [
    { type: 'heading', content: '引言：LLM 到底是什么？', id: 'intro' },
    { type: 'text', content: '大语言模型的核心任务非常简单：给定一段文本前缀，预测下一个最可能出现的词（token）。这个看似简单的"下一个词预测"任务，当模型规模和数据量足够大时，涌现出了推理、翻译、编程、对话等复杂能力。本文将自底向上解释 LLM 的完整工作原理。' },
    { type: 'heading', content: '第一步：Token 化 — 把文本变成数字', id: 'tokenization' },
    { type: 'text', content: '模型不能直接理解文字，需要先将文本切分成可计算的数字序列。这个过程叫 Tokenization（分词）。常用方法有 BPE (Byte Pair Encoding)，它从字符级开始，反复合并最高频的字符对，最终形成一个包含常用词和子词的词表。' },
    { type: 'code', lang: 'python', content: `from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("gpt2")
text = "大语言模型如何工作？"
tokens = tokenizer.encode(text)
print(tokens)  # 输出: [163, 226, 124, 116, ...]
print(tokenizer.decode(tokens))  # 还原文本

# 每个 token 对应词表中的一个 ID
# GPT-2 词表大小: 50257
# GPT-4 词表大小: ~100000`, explanation: 'Token 化将任意中文/英文文本转换为整数序列。BPE 的巧妙之处在于：常见词是一个 token（如"the"），罕见词会被拆成子词（如"tokenization"→"token"+"ization"），平衡了词表大小和编码效率。' },
    { type: 'heading', content: '第二步：嵌入 — 从 ID 到语义向量', id: 'embedding' },
    { type: 'text', content: '每个 token ID 被映射到一个高维向量（GPT-3: 12288 维）。这个向量不是随机赋值的——语义相近的词，其向量在空间中距离更近。例如"国王"-"男人"+"女人"≈"女王"，这种语义算术说明嵌入层确实学到了概念之间的关系。' },
    { type: 'code', lang: 'python', content: `import torch
import torch.nn as nn

# 嵌入层: 词表大小 × 向量维度
vocab_size, d_model = 50257, 768
embedding = nn.Embedding(vocab_size, d_model)

# token_id → 768维语义向量
token_ids = torch.tensor([464, 2068])  # "hello world"
vectors = embedding(token_ids)  # shape: [2, 768]

# 位置编码：因为 Transformer 没有循环结构，
# 需要显式告诉模型每个 token 的位置
pos_encoding = torch.sin(torch.arange(768) / 
    10000 ** (torch.arange(0, 768, 2) / 768))`, explanation: '嵌入层是一个巨大的查找表。位置编码用正弦/余弦函数生成，因为它们的周期性让模型可以外推到比训练时更长的序列——这是为什么 GPT-4 能处理超长文本的关键。' },
    { type: 'heading', content: '第三步：注意力机制 — 让模型"读懂"上下文', id: 'attention' },
    { type: 'text', content: '这�� Transformer 最核心的创新。自注意力（Self-Attention）让每个 token 都能"看到"序列中的所有其他 token，并根据相关性分配权重。比如在"我把苹果吃了，它很甜"中，模型需要理解"它"指的是"苹果"——这就是注意力机制的作用。' },
    { type: 'code', lang: 'python', content: `def self_attention(Q, K, V):
    """
    Q, K, V: Query, Key, Value 矩阵
    Scaled Dot-Product Attention
    """
    d_k = Q.shape[-1]
    # 计算注意力分数
    scores = Q @ K.transpose(-2, -1) / sqrt(d_k)
    # Softmax 归一化
    attn_weights = softmax(scores, dim=-1)
    # 加权求和
    output = attn_weights @ V
    return output

# 多头注意力: 并运行多个注意力头
# GPT-3: 96头, 每头128维
# 不同头关注不同的语言特征:
#   - 语法结构
#   - 指代关系  
#   - 语义角色
#   - 长距离依赖`, explanation: 'Q（查询）和 K（键）的点积计算相关性分数，除以 √d_k 防止梯度消失。Softmax 让权重之和为 1。多头机制让模型从不同角度理解文本——就像一个团队同时从语法、语义、逻辑等维度分析。' },
    { type: 'heading', content: '第四步：逐 token 生成 — 自回归解码', id: 'generation' },
    { type: 'text', content: '训练好的模型以自回归方式生成文本：输入当前序列 → 预测下一个 token → 将预测的 token 追加到序列 → 重复。每次预测输出词表大小的概率分布，常用采样策略包括贪心（选概率最大）、Top-k（从前 k 个候选中随机选）、Top-p（核采样，累积概率超过 p 的候选中随机选）。' },
    { type: 'code', lang: 'python', content: `def generate(model, prompt, max_tokens=100, temperature=0.8):
    tokens = tokenize(prompt)
    for _ in range(max_tokens):
        # 前向传播，得到每个位置的下一个 token 概率
        logits = model(tokens)  # [seq_len, vocab_size]
        next_logits = logits[-1] / temperature
        
        # Top-p 核采样
        probs = softmax(next_logits)
        sorted_probs = sorted(probs, reverse=True)
        cumsum = 0
        for i, p in enumerate(sorted_probs):
            cumsum += p
            if cumsum > 0.9:  # top_p = 0.9
                cutoff = p
                break
        # 过滤并重新归一化
        next_probs = probs * (probs >= cutoff)
        next_probs /= next_probs.sum()
        next_token = multinomial(next_probs)
        
        tokens.append(next_token)
        if next_token == EOS_TOKEN: break
    return detokenize(tokens)`, explanation: 'temperature 控制输出的"创造性"——低温(0.1)输出确定但重复，高温(1.5)输出多样但可能混乱。Top-p 采样动态调整候选集大小，比固定 Top-k 更灵活——在确定性高的位置只考虑少数候选，在不确定的位置探索更多可能。' },
    { type: 'heading', content: '第五步：RLHF — 让模型"对齐"人类偏好', id: 'rlhf' },
    { type: 'text', content: '预训练模型只是"预测下一个词"，不一定输出有用、安全、真实的回复。RLHF (Reinforcement Learning from Human Feedback) 解决这个问题：(1) 人类标注员对多个回复排序 (2) 训练奖励模型学习人类偏好 (3) 用 PPO 强化学习优化模型。这就是 ChatGPT 区别于 GPT-3 的关键技术。' },
    { type: 'heading', content: '第六步：工具使用 — 从聊天到生产力', id: 'tools' },
    { type: 'text', content: '现代 LLM 的能力远不止聊天——通过 Function Calling（函数调用），它可以调用外部工具：搜索互联网、执行代码、查询数据库、调用 API。这本质上是让模型学会输出结构化的 JSON 而不是纯文本，由外部系统解析并执行相应的操作，将结果返回给模型继续推理。' },
    { type: 'heading', content: '总结：从概率到智能的跃迁', id: 'summary' },
    { type: 'text', content: 'LLM 的本质是一个巨大的自回归语言模型，通过"预测下一个 token"这个单一任务，在海量文本上训练出对世界的理解。Token 化 → 嵌入 → Transformer 注意力 → 自回归生成 → RLHF 对齐 → 工具使用，这六个步骤构成了从数学公式到智能助手的完整链路。理解这个链路，就理解了为什么看似简单的"🤷下一个词预测"能够涌现出如此强大的能力。' },
  ],
  sectionsEn: [
    { type: 'heading', content: 'Introduction: What is an LLM?', id: 'intro' },
    { type: 'text', content: 'The core task of a large language model is surprisingly simple: given a text prefix, predict the next most likely token. This seemingly trivial "next-token prediction" task, when scaled up with sufficient model size and data, gives rise to complex capabilities like reasoning, translation, coding, and conversation. This article explains the complete working principles of LLMs from the ground up.' },
    { type: 'heading', content: 'Step 1: Tokenization — Turning Text into Numbers', id: 'tokenization' },
    { type: 'text', content: 'Models cannot understand text directly; they need to split text into computable sequences of numbers first. This process is called Tokenization. A common method is BPE (Byte Pair Encoding), which starts at the character level and repeatedly merges the most frequent character pairs, ultimately forming a vocabulary of common words and subwords.' },
    { type: 'code', lang: 'python', content: `from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("gpt2")
text = "How do large language models work?"
tokens = tokenizer.encode(text)
print(tokens)  # Output: [163, 226, 124, 116, ...]
print(tokenizer.decode(tokens))  # Restore text

# Each token corresponds to an ID in the vocabulary
# GPT-2 vocab size: 50257
# GPT-4 vocab size: ~100000`, explanation: 'Tokenization converts arbitrary Chinese/English text into integer sequences. The elegance of BPE: common words are one token (e.g., "the"), rare words are split into subwords (e.g., "tokenization" → "token" + "ization"), balancing vocabulary size and encoding efficiency.' },
    { type: 'heading', content: 'Step 2: Embeddings — From ID to Semantic Vector', id: 'embedding' },
    { type: 'text', content: 'Each token ID is mapped to a high-dimensional vector (GPT-3: 12,288 dims). This vector is not randomly assigned — semantically similar words have closer vector distances in space. For example, "king" - "man" + "woman" ≈ "queen". This semantic arithmetic shows that the embedding layer has indeed learned relationships between concepts.' },
    { type: 'code', lang: 'python', content: `import torch
import torch.nn as nn

# Embedding layer: vocab_size × vector_dim
vocab_size, d_model = 50257, 768
embedding = nn.Embedding(vocab_size, d_model)

# token_id → 768-dim semantic vector
token_ids = torch.tensor([464, 2068])  # "hello world"
vectors = embedding(token_ids)  # shape: [2, 768]

# Positional encoding: because Transformer has no recurrent structure,
# we must explicitly tell the model each token's position
pos_encoding = torch.sin(torch.arange(768) /
    10000 ** (torch.arange(0, 768, 2) / 768))`, explanation: 'The embedding layer is a giant lookup table. Positional encodings use sine/cosine functions because their periodicity allows the model to extrapolate to sequences longer than seen during training — this is why GPT-4 can handle extremely long contexts.' },
    { type: 'heading', content: 'Step 3: Attention — Letting the Model "Read" Context', id: 'attention' },
    { type: 'text', content: 'This is the core innovation of Transformer. Self-attention allows every token to "see" all other tokens in the sequence and assign weights based on relevance. For example, in "I ate the apple, it was sweet", the model needs to understand that "it" refers to "apple" — this is what the attention mechanism does.' },
    { type: 'code', lang: 'python', content: `def self_attention(Q, K, V):
    """
    Q, K, V: Query, Key, Value matrices
    Scaled Dot-Product Attention
    """
    d_k = Q.shape[-1]
    # Compute attention scores
    scores = Q @ K.transpose(-2, -1) / sqrt(d_k)
    # Softmax normalization
    attn_weights = softmax(scores, dim=-1)
    # Weighted sum
    output = attn_weights @ V
    return output

# Multi-head attention: run multiple attention heads in parallel
# GPT-3: 96 heads, 128 dims each
# Different heads attend to different linguistic features:
#   - Syntactic structure
#   - Coreference relations
#   - Semantic roles
#   - Long-range dependencies`, explanation: 'Q (Query) and K (Key) dot product computes relevance scores; dividing by √d_k prevents gradient vanishing. Softmax ensures weights sum to 1. Multi-head lets the model understand text from multiple angles — like a team analyzing from grammatical, semantic, and logical dimensions simultaneously.' },
    { type: 'heading', content: 'Step 4: Token-by-Token Generation — Autoregressive Decoding', id: 'generation' },
    { type: 'text', content: 'The trained model generates text autoregressively: input current sequence → predict next token → append predicted token to sequence → repeat. Each prediction outputs a probability distribution over the vocabulary. Common sampling strategies include greedy (pick highest probability), Top-k (randomly pick from top k candidates), and Top-p (nucleus sampling, randomly pick from candidates whose cumulative probability exceeds p).' },
    { type: 'code', lang: 'python', content: `def generate(model, prompt, max_tokens=100, temperature=0.8):
    tokens = tokenize(prompt)
    for _ in range(max_tokens):
        # Forward pass, get next-token probability for each position
        logits = model(tokens)  # [seq_len, vocab_size]
        next_logits = logits[-1] / temperature

        # Top-p nucleus sampling
        probs = softmax(next_logits)
        sorted_probs = sorted(probs, reverse=True)
        cumsum = 0
        for i, p in enumerate(sorted_probs):
            cumsum += p
            if cumsum > 0.9:  # top_p = 0.9
                cutoff = p
                break
        # Filter and renormalize
        next_probs = probs * (probs >= cutoff)
        next_probs /= next_probs.sum()
        next_token = multinomial(next_probs)

        tokens.append(next_token)
        if next_token == EOS_TOKEN: break
    return detokenize(tokens)`, explanation: 'Temperature controls output "creativity" — low temp (0.1) gives deterministic but repetitive output, high temp (1.5) gives diverse but potentially chaotic output. Top-p dynamically adjusts candidate set size: at positions with high certainty, only a few candidates are considered; at uncertain positions, more possibilities are explored.' },
    { type: 'heading', content: 'Step 5: RLHF — Aligning with Human Preferences', id: 'rlhf' },
    { type: 'text', content: 'Pre-trained models simply "predict the next token", not necessarily outputting helpful, safe, or factual responses. RLHF (Reinforcement Learning from Human Feedback) solves this: (1) human annotators rank multiple responses, (2) a reward model learns human preferences, (3) PPO reinforcement learning optimizes the model. This is the key technology that distinguishes ChatGPT from GPT-3.' },
    { type: 'heading', content: 'Step 6: Tool Use — From Chat to Productivity', id: 'tools' },
    { type: 'text', content: 'Modern LLMs can do far more than chat — through Function Calling, they can invoke external tools: search the internet, execute code, query databases, call APIs. This essentially teaches the model to output structured JSON instead of plain text; the external system parses and executes the corresponding operations, returning results to the model for continued reasoning.' },
    { type: 'heading', content: 'Summary: The Leap from Probability to Intelligence', id: 'summary' },
    { type: 'text', content: 'The essence of an LLM is a massive autoregressive language model. Through the single task of "predicting the next token", it learns an understanding of the world from海量文本. Tokenization → Embedding → Transformer Attention → Autoregressive Generation → RLHF Alignment → Tool Use: these six steps form the complete pipeline from mathematical formulas to intelligent assistants. Understanding this pipeline explains why seemingly simple "next-token prediction" can emerge with such powerful capabilities.' },
  ],
}

export default post
