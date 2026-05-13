<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  code: string
  lang?: string
}>()

const copied = ref(false)
const isDiagram = computed(() => (props.lang || '').toLowerCase() === 'mermaid')
const diagram = computed(() => parseMermaidFlow(props.code))

function copy() {
  navigator.clipboard.writeText(props.code).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  })
}

function parseMermaidFlow(code: string) {
  const labels = new Map<string, string>()
  const edges: { from: string; to: string }[] = []

  for (const line of code.split('\n')) {
    const trimmed = line.trim()
    const nodeMatches = trimmed.matchAll(/([A-Za-z][\w-]*)\[([^\]]+)\]/g)
    for (const match of nodeMatches) labels.set(match[1], match[2])

    const edge = trimmed.match(/^([A-Za-z][\w-]*)(?:\[[^\]]+\])?\s*-->\s*([A-Za-z][\w-]*)/)
    if (edge) edges.push({ from: edge[1], to: edge[2] })
  }

  const ids = Array.from(labels.keys())
  const levelById = new Map(ids.map((id) => [id, 0]))
  for (let pass = 0; pass < ids.length; pass++) {
    let changed = false
    for (const edge of edges) {
      const nextLevel = (levelById.get(edge.from) || 0) + 1
      if ((levelById.get(edge.to) || 0) < nextLevel) {
        levelById.set(edge.to, nextLevel)
        changed = true
      }
    }
    if (!changed) break
  }

  const maxLevel = Math.max(...Array.from(levelById.values()), 1)
  const groups = new Map<number, string[]>()
  ids.forEach((id) => {
    const level = levelById.get(id) || 0
    groups.set(level, [...(groups.get(level) || []), id])
  })

  const nodes = ids.length > 9 ? layoutNetwork(ids, edges, labels) : ids.map((id) => {
    const level = levelById.get(id) || 0
    const group = groups.get(level) || [id]
    const index = group.indexOf(id)
    const spread = group.length === 1 ? 0 : 56
    const y = group.length === 1 ? 50 : 50 - spread / 2 + (spread / (group.length - 1)) * index
    return {
      id,
      label: labels.get(id) || id,
      x: 6 + (level / maxLevel) * 88,
      y,
      level,
    }
  })
  const nodeById = new Map(nodes.map((node) => [node.id, node]))

  return {
    nodes,
    edges: edges
      .map((edge) => ({ ...edge, a: nodeById.get(edge.from), b: nodeById.get(edge.to) }))
      .filter((edge) => edge.a && edge.b),
  }
}

function layoutNetwork(ids: string[], edges: { from: string; to: string }[], labels: Map<string, string>) {
  const degree = new Map(ids.map((id) => [id, 0]))
  const neighbors = new Map(ids.map((id) => [id, [] as string[]]))
  edges.forEach((edge) => {
    degree.set(edge.from, (degree.get(edge.from) || 0) + 1)
    degree.set(edge.to, (degree.get(edge.to) || 0) + 1)
    neighbors.get(edge.from)?.push(edge.to)
    neighbors.get(edge.to)?.push(edge.from)
  })

  const hub = ids.reduce((best, id) => (degree.get(id) || 0) > (degree.get(best) || 0) ? id : best, ids[0])
  const ringById = new Map([[hub, 0]])
  const queue = [hub]
  while (queue.length) {
    const current = queue.shift()!
    const ring = ringById.get(current) || 0
    for (const next of neighbors.get(current) || []) {
      if (ringById.has(next)) continue
      ringById.set(next, ring + 1)
      queue.push(next)
    }
  }

  const rings = new Map<number, string[]>()
  ids.forEach((id) => {
    const ring = Math.min(ringById.get(id) ?? 2, 2)
    rings.set(ring, [...(rings.get(ring) || []), id])
  })

  return ids.map((id) => {
    const ring = ringById.get(id) ?? 2
    if (id === hub) return { id, label: labels.get(id) || id, x: 50, y: 50, level: 0 }

    const clampedRing = Math.min(ring, 2)
    const group = rings.get(clampedRing) || [id]
    const index = group.indexOf(id)
    const start = clampedRing === 1 ? -90 : -112
    const angle = (start + (360 / group.length) * index) * Math.PI / 180
    const radiusX = clampedRing === 1 ? 24 : 40
    const radiusY = clampedRing === 1 ? 22 : 34
    return {
      id,
      label: labels.get(id) || id,
      x: 50 + Math.cos(angle) * radiusX,
      y: 50 + Math.sin(angle) * radiusY,
      level: clampedRing,
    }
  })
}
</script>

<template>
  <div v-if="isDiagram" class="diagram-block">
    <div class="code-header">
      <div class="code-dots">
        <span class="dot dot-red"></span>
        <span class="dot dot-yellow"></span>
        <span class="dot dot-green"></span>
      </div>
      <span class="code-lang">{{ lang || 'code' }}</span>
      <button class="copy-btn" @click="copy">
        <svg v-if="!copied" aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        <svg v-else aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        {{ copied ? '已复制' : '复制' }}
      </button>
    </div>
    <div class="diagram-scroll">
      <div class="diagram-canvas">
        <svg class="diagram-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line
            v-for="(edge, i) in diagram.edges"
            :key="`${edge.from}-${edge.to}-${i}`"
            :x1="edge.a?.x"
            :y1="edge.a?.y"
            :x2="edge.b?.x"
            :y2="edge.b?.y"
            class="diagram-line"
            :style="{ '--delay': `${i * 70}ms` }"
          />
        </svg>
        <div
          v-for="(node, i) in diagram.nodes"
          :key="node.id"
          class="diagram-node"
          :class="{ source: node.level === 0 }"
          :style="{ left: `${node.x}%`, top: `${node.y}%`, '--delay': `${i * 55}ms` }"
        >
          <span class="node-dot"></span>
          <span class="node-label">{{ node.label }}</span>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="code-block">
    <div class="code-header">
      <div class="code-dots">
        <span class="dot dot-red"></span>
        <span class="dot dot-yellow"></span>
        <span class="dot dot-green"></span>
      </div>
      <span class="code-lang">{{ lang || 'code' }}</span>
      <button class="copy-btn" @click="copy">
        <svg v-if="!copied" aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        <svg v-else aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        {{ copied ? '已复制' : '复制' }}
      </button>
    </div>
    <pre><code>{{ code }}</code></pre>
  </div>
</template>

<style scoped>
.code-block,
.diagram-block {
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--code-border);
  background: var(--bg-code);
  box-shadow: var(--shadow-card);
  transition: box-shadow 0.25s ease;
}
.code-block:hover,
.diagram-block:hover {
  box-shadow: var(--shadow-card-hover);
}
.code-header {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--code-border);
  background: rgba(0,0,0,0.02);
}
[data-theme="dark"] .code-header { background: rgba(255,255,255,0.02); }

.code-dots { display: flex; gap: 6px; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot-red { background: #ff5f57; }
.dot-yellow { background: #febc2e; }
.dot-green { background: #28c840; }

.code-lang {
  flex: 1; font-size: 12px; color: var(--text-3);
  font-family: var(--font-mono); text-transform: uppercase;
  letter-spacing: 0.5px;
}
.copy-btn {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 10px; border-radius: 5px;
  background: transparent; border: 1px solid var(--border);
  color: var(--text-3); font-size: 12px; cursor: pointer;
  font-family: var(--font-sans); transition: all 0.15s ease;
}
.copy-btn:hover { color: var(--accent); border-color: var(--accent); }

pre {
  margin: 0; padding: 16px 18px;
  overflow-x: auto;
}
code {
  font-family: var(--font-mono); font-size: 14px;
  color: var(--code-text); line-height: 1.75;
  white-space: pre; display: block;
}

.diagram-scroll {
  overflow-x: auto;
  background:
    radial-gradient(circle at 15% 20%, rgba(99,102,241,0.12), transparent 28%),
    radial-gradient(circle at 82% 72%, rgba(20,184,166,0.10), transparent 32%),
    var(--bg-code);
}
.diagram-canvas {
  position: relative;
  min-width: 100%;
  height: 390px;
}
.diagram-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.diagram-line {
  stroke: color-mix(in srgb, var(--accent) 58%, transparent);
  stroke-width: 0.24;
  stroke-linecap: round;
  stroke-dasharray: 7;
  animation: draw-line 0.9s var(--ease-out) both;
  animation-delay: var(--delay);
  filter: drop-shadow(0 0 5px color-mix(in srgb, var(--accent) 34%, transparent));
}
.diagram-node {
  --node-bg: rgba(255,255,255,0.86);
  position: absolute;
  width: 126px;
  min-height: 52px;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.24);
  background: var(--node-bg);
  box-shadow: 0 16px 40px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.72);
  color: #111118;
  animation: node-in 0.5s var(--ease-out) both;
  animation-delay: var(--delay);
}
[data-theme="dark"] .diagram-node {
  --node-bg: rgba(247,248,255,0.9);
}
.diagram-node.source {
  border-color: color-mix(in srgb, var(--accent) 34%, white);
  box-shadow: 0 18px 46px rgba(8,145,178,0.18), inset 0 1px 0 rgba(255,255,255,0.78);
}
.node-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent-3));
  box-shadow: 0 0 0 5px color-mix(in srgb, var(--accent) 14%, transparent);
  flex-shrink: 0;
}
.node-label {
  min-width: 0;
  font-size: 12px;
  font-weight: 650;
  line-height: 1.25;
}
@keyframes draw-line {
  from { stroke-dashoffset: 22; opacity: 0; }
  to { stroke-dashoffset: 0; opacity: 0.78; }
}
@keyframes node-in {
  from { opacity: 0; transform: translate(-50%, -42%) scale(0.92); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
@media (max-width: 640px) {
  .diagram-canvas { min-width: 760px; height: 360px; }
  .diagram-node { width: 122px; }
  .node-label { font-size: 11px; }
}
</style>
