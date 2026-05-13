import type { Post } from './index'

const post: Post = {
  id: 'ant-sim',
  title: '蚁群算法：蚂蚁追踪模拟',
  titleEn: 'Ant Colony Algorithm: Ant Tracking Simulation',
  summary: '用 NumPy 模拟四只蚂蚁在正方形桌面边缘互相追踪的运动轨迹，通过 Matplotlib 可视化螺旋收敛过程。',
  summaryEn: 'Simulate four ants chasing each other along a square table edge using NumPy, with Matplotlib visualizing the spiral convergence process.',
  category: 'ai',
  tags: ['Python', 'NumPy', 'Matplotlib', '蚁群算法'],
  date: '2024-05',
  cover: '🐜',
  sections: [
    { type: 'heading', content: '问题描述', id: 'problem' },
    { type: 'text', content: '四只蚂蚁分别位于正方形桌面的四个角，每只蚂蚁始终朝逆时针方向的相邻蚂蚁移动。求它们的运动轨迹以及是否最终相遇。' },
    { type: 'heading', content: '参数设置与初始化', id: 'init' },
    { type: 'code', lang: 'python', content: `import numpy as np
import matplotlib.pyplot as plt
from matplotlib.font_manager import FontProperties

font = FontProperties(fname='SimHei.ttf', size=16)
flag = 1       # 循环标志：1=未相遇，0=已相遇
a = 100        # 桌子边长
v = 0.01       # 蚂蚁速度 (cm/s)
time_step = 0.1 # 时间步长 (s)

# 四只蚂蚁的初始位置：左下、左上、右上、右下
positions = np.array([[0.0, 0.0], [0.0, a], [a, a], [a, 0.0]])
trajectory = [positions.copy()]  # 记录轨迹`, explanation: '使用 numpy 数组存储蚂蚁位置，方便向量运算。trajectory 列表记录每一步的位置快照，用 copy() 防止引用问题——如果直接 append(positions)，后续修改会影响列表中已有元素。' },
    { type: 'heading', content: '核心运动模拟', id: 'simulate' },
    { type: 'code', lang: 'python', content: `while flag:
    new_positions = positions.copy()
    for i in range(4):
        # 逆时针方向的下一只蚂蚁
        closest_index = (i + 1) % 4
        # 计算方向向量
        direction = positions[closest_index] - positions[i]
        # 计算距离（向量模长）
        norm = np.linalg.norm(direction)
        if norm > 1e-3:
            # 单位化方向向量
            direction = direction / norm
        else:
            flag = 0  # 距离极小，视为相遇
            break
        # 更新位置：单位方向 × 速度 × 时间步长
        new_positions[i] += direction * v * time_step
    positions = new_positions
    trajectory.append(new_positions.copy())`, explanation: '核心逻辑：(i+1)%4 确保每只蚂蚁追踪逆时针方向的下一位邻居。direction/norm 实现向量单位化，保证蚂蚁匀速运动。1e-3 是相遇阈值——当两只蚂蚁距离小于此值时认为相遇。' },
    { type: 'heading', content: '轨迹可视化', id: 'visualize' },
    { type: 'code', lang: 'python', content: `trajectory = np.array(trajectory)
# 三维数组：[时间步, 蚂蚁编号, xy坐标]

plt.figure(figsize=(8, 8))
for i in range(4):
    plt.plot(trajectory[:, i, 0], trajectory[:, i, 1],
             label=f'Ant {i + 1}')

# 桌子边界
plt.xlim(-10, a + 10)
plt.ylim(-10, a + 10)
plt.axhline(0, color='black', lw=1)
plt.axhline(a, color='black', lw=1)
plt.axvline(0, color='black', lw=1)
plt.axvline(a, color='black', lw=1)
plt.grid()
plt.title("蚂蚁行走轨迹", fontproperties=font)
plt.xlabel("X (cm)")
plt.ylabel("Y (cm)")
plt.legend()
plt.show()`, explanation: 'trajectory 是三维 numpy 数组，通过 trajectory[:, i, 0] 切片提取第 i 只蚂蚁所有时间步的 X 坐标，trajectory[:, i, 1] 提取 Y 坐标。四条螺旋线最终收敛于桌面中心。' },
    { type: 'heading', content: '结论', id: 'conclusion' },
    { type: 'text', content: '四只蚂蚁的运动轨迹形成对称的螺旋线，最终在桌面中心相遇。这是典型的追踪问题，每只蚂蚁的速度方向始终指向目标，导致轨迹为对数螺线。该模拟也体现了正反馈机制——蚁群算法的核心思想。' },
  ],
  sectionsEn: [
    { type: 'heading', content: 'Problem Description', id: 'problem' },
    { type: 'text', content: 'Four ants are positioned at the four corners of a square table. Each ant always moves toward the adjacent ant in the counterclockwise direction. Find their motion trajectories and determine whether they eventually meet.' },
    { type: 'heading', content: 'Parameters and Initialization', id: 'init' },
    { type: 'code', lang: 'python', content: `import numpy as np
import matplotlib.pyplot as plt
from matplotlib.font_manager import FontProperties

font = FontProperties(fname='SimHei.ttf', size=16)
flag = 1       # Loop flag: 1=not met, 0=met
a = 100        # Table side length
v = 0.01       # Ant speed (cm/s)
time_step = 0.1 # Time step (s)

# Four ants' initial positions: bottom-left, top-left, top-right, bottom-right
positions = np.array([[0.0, 0.0], [0.0, a], [a, a], [a, 0.0]])
trajectory = [positions.copy()]  # Record trajectory`, explanation: 'Using numpy arrays to store ant positions for convenient vector operations. The trajectory list records position snapshots at each step; copy() prevents reference issues — if you append(positions) directly, subsequent modifications would affect existing elements in the list.' },
    { type: 'heading', content: 'Core Motion Simulation', id: 'simulate' },
    { type: 'code', lang: 'python', content: `while flag:
    new_positions = positions.copy()
    for i in range(4):
        # The next ant in counterclockwise direction
        closest_index = (i + 1) % 4
        # Compute direction vector
        direction = positions[closest_index] - positions[i]
        # Compute distance (vector norm)
        norm = np.linalg.norm(direction)
        if norm > 1e-3:
            # Normalize direction vector
            direction = direction / norm
        else:
            flag = 0  # Distance is tiny, consider it a meeting
            break
        # Update position: unit direction × speed × time step
        new_positions[i] += direction * v * time_step
    positions = new_positions
    trajectory.append(new_positions.copy())`, explanation: 'Core logic: (i+1)%4 ensures each ant tracks the next neighbor in counterclockwise direction. direction/norm normalizes the vector, ensuring constant-speed movement. 1e-3 is the meeting threshold — when the distance between two ants is below this value, they are considered to have met.' },
    { type: 'heading', content: 'Trajectory Visualization', id: 'visualize' },
    { type: 'code', lang: 'python', content: `trajectory = np.array(trajectory)
# 3D array: [time_step, ant_id, xy_coordinates]

plt.figure(figsize=(8, 8))
for i in range(4):
    plt.plot(trajectory[:, i, 0], trajectory[:, i, 1],
             label=f'Ant {i + 1}')

# Table boundaries
plt.xlim(-10, a + 10)
plt.ylim(-10, a + 10)
plt.axhline(0, color='black', lw=1)
plt.axhline(a, color='black', lw=1)
plt.axvline(0, color='black', lw=1)
plt.axvline(a, color='black', lw=1)
plt.grid()
plt.title("Ant Walking Trajectory", fontproperties=font)
plt.xlabel("X (cm)")
plt.ylabel("Y (cm)")
plt.legend()
plt.show()`, explanation: 'trajectory is a 3D numpy array; trajectory[:, i, 0] slices to extract all time steps of X coordinates for ant i, trajectory[:, i, 1] extracts Y coordinates. Four spiral lines eventually converge at the center of the table.' },
    { type: 'heading', content: 'Conclusion', id: 'conclusion' },
    { type: 'text', content: 'The motion trajectories of the four ants form symmetric spiral lines, eventually meeting at the center of the table. This is a classic pursuit problem: each ant\'s velocity direction always points toward its target, resulting in logarithmic spiral trajectories. This simulation also embodies the core idea of positive feedback — the essence of ant colony algorithms.' },
  ],
}

export default post
