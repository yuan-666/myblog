import type { Post } from './index'

const post: Post = {
  id: 'ant-path',
  title: '蚁群算法：网格寻路',
  titleEn: 'Ant Colony Path Planning',
  summary: '实现经典蚁群优化算法（ACO），通过信息素和启发式函数在网格中寻找最短路径。',
  summaryEn: 'Implement ant colony optimization for path planning problems, using pheromone trails and heuristic search to find optimal routes.',
  category: 'ai',
  tags: ['Python', '蚁群算法', 'ACO', '启发式搜索'],
  date: '2024-05',
  cover: '🧭',
  sections: [
    { type: 'heading', content: '算法原理', id: 'theory' },
    { type: 'text', content: '蚁群算法模拟真实蚂蚁觅食行为：蚂蚁在路径上释放信息素，后续蚂蚁倾向于选择信息素浓度高的路径，形成正反馈。结合启发式函数（如到终点的距离），可以高效地搜索最短路径。' },
    { type: 'heading', content: 'Ant 类设计', id: 'class' },
    { type: 'code', lang: 'python', content: `class Ant:
    def __init__(self, grid, start, end, alpha=1, beta=5,
                 evaporation=0.01, iterations=100):
        self.grid = grid              # 网格地图（0=可走，1=障碍）
        self.start = start            # 起点坐标
        self.end = end                # 终点坐标
        self.alpha = alpha            # 信息素重要程度
        self.beta = beta              # 启发式重要程度
        self.evaporation = evaporation  # 信息素挥发率
        self.iterations = iterations  # 迭代次数
        self.pheromones = [[1] * len(row) for row in grid]  # 初始信息素`, explanation: 'alpha 和 beta 是核心超参数：alpha 控制信息素的影响力，beta 控制启发式函数的影响力。初始信息素设为 1（均匀分布），迭代过程中会逐渐分化。' },
    { type: 'heading', content: '概率选择机制', id: 'select' },
    { type: 'code', lang: 'python', content: `def select_next(self, i, j, visited):
    neighbors = self.get_neighbors(i, j)
    probabilities = []
    total = 0
    for ni, nj in neighbors:
        if (ni, nj) not in visited:
            pheromone = self.pheromones[ni][nj]
            heuristic = self.heuristic(ni, nj)
            # 轮盘赌概率 = 信息素^α × 启发式^β
            prob = pheromone ** self.alpha * heuristic ** self.beta
            probabilities.append((ni, nj, prob))
            total += prob
    if not probabilities:
        return None
    # 归一化
    probabilities = [(ni, nj, prob / total) for ni, nj, prob in probabilities]
    # 轮盘赌选择
    r = random.random()
    for ni, nj, prob in probabilities:
        r -= prob
        if r <= 0:
            return ni, nj
    return None`, explanation: '选择下一个格子时，概率与 信息素^α × 启发式^β 成正比。信息素高说明之前很多蚂蚁走过（好路径），启发式值高说明离终点近。轮盘赌选择保证概率的随机性：概率越大的格子被选中的可能性越高。' },
    { type: 'heading', content: '信息素更新', id: 'update' },
    { type: 'code', lang: 'python', content: `def update_pheromones(self, path, length):
    if path is not None:
        # 1. 增加路径上的信息素（越短路径增加越多）
        for i, j in path:
            self.pheromones[i][j] += 1 / length
        # 2. 信息素挥发（防止无限增长）
        for i in range(len(self.pheromones)):
            for j in range(len(self.pheromones[0])):
                self.pheromones[i][j] *= (1 - self.evaporation)`, explanation: '信息素更新分两步：① 蚂蚁走过的路径增加信息素，增量与路径长度成反比（越短越好）；② 所有位置的信息素按挥发率衰减，防止早期差路径的信息素持续影响搜索。这就是正反馈 + 遗忘机制。' },
    { type: 'heading', content: '运行结果', id: 'result' },
    { type: 'text', content: '在 20×20 的网格地图上，从 (0,0) 到 (20,20)，算法成功找到避开障碍物的最短路径。alpha=1, beta=5 的参数设置让启发式函数的影响更大，加速了收敛。' },
  ],
  sectionsEn: [
    { type: 'heading', content: 'Algorithm Overview', id: 'theory' },
    { type: 'text', content: 'Ant Colony Optimization (ACO) simulates real ant foraging behavior: ants release pheromones on paths, and subsequent ants tend to choose paths with higher pheromone concentration, creating positive feedback. Combined with heuristic functions (such as distance to the destination), it can efficiently search for the shortest path.' },
    { type: 'heading', content: 'Ant Class Design', id: 'class' },
    { type: 'code', lang: 'python', content: `class Ant:
    def __init__(self, grid, start, end, alpha=1, beta=5,
                 evaporation=0.01, iterations=100):
        self.grid = grid              # Grid map (0=walkable, 1=obstacle)
        self.start = start            # Start coordinates
        self.end = end                # End coordinates
        self.alpha = alpha            # Pheromone importance
        self.beta = beta              # Heuristic importance
        self.evaporation = evaporation  # Pheromone evaporation rate
        self.iterations = iterations  # Number of iterations
        self.pheromones = [[1] * len(row) for row in grid]  # Initial pheromone`, explanation: 'alpha and beta are core hyperparameters: alpha controls the influence of pheromone, beta controls the influence of the heuristic function. Initial pheromone is set to 1 (uniform distribution), which gradually differentiates during iterations.' },
    { type: 'heading', content: 'Probabilistic Selection Mechanism', id: 'select' },
    { type: 'code', lang: 'python', content: `def select_next(self, i, j, visited):
    neighbors = self.get_neighbors(i, j)
    probabilities = []
    total = 0
    for ni, nj in neighbors:
        if (ni, nj) not in visited:
            pheromone = self.pheromones[ni][nj]
            heuristic = self.heuristic(ni, nj)
            # Roulette probability = pheromone^α × heuristic^β
            prob = pheromone ** self.alpha * heuristic ** self.beta
            probabilities.append((ni, nj, prob))
            total += prob
    if not probabilities:
        return None
    # Normalize
    probabilities = [(ni, nj, prob / total) for ni, nj, prob in probabilities]
    # Roulette selection
    r = random.random()
    for ni, nj, prob in probabilities:
        r -= prob
        if r <= 0:
            return ni, nj
    return None`, explanation: 'When selecting the next grid cell, probability is proportional to pheromone^α × heuristic^β. High pheromone means many ants have walked this path (good path); high heuristic means close to the destination. Roulette selection ensures probabilistic randomness: cells with higher probability are more likely to be selected.' },
    { type: 'heading', content: 'Pheromone Update', id: 'update' },
    { type: 'code', lang: 'python', content: `def update_pheromones(self, path, length):
    if path is not None:
        # 1. Increase pheromone on the path (shorter paths get more)
        for i, j in path:
            self.pheromones[i][j] += 1 / length
        # 2. Pheromone evaporation (prevent infinite growth)
        for i in range(len(self.pheromones)):
            for j in range(len(self.pheromones[0])):
                self.pheromones[i][j] *= (1 - self.evaporation)`, explanation: 'Pheromone update has two steps: ① Increase pheromone on the path taken by ants, with increment inversely proportional to path length (shorter is better); ② Decay pheromone at all positions by the evaporation rate, preventing early poor paths from permanently influencing the search. This is positive feedback + forgetting.' },
    { type: 'heading', content: 'Results', id: 'result' },
    { type: 'text', content: 'On a 20×20 grid map, from (0,0) to (20,20), the algorithm successfully finds the shortest path avoiding obstacles. With alpha=1, beta=5, the heuristic function has greater influence, accelerating convergence.' },
  ],
}

export default post
