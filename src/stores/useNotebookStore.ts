import { create } from 'zustand';
import { Notebook } from '../types';

const INITIAL_JAVA_CONTENT = `
<h1>01. Java 内存模型与并发编程精髓</h1>
<p>在现代多核处理器架构下，理解 <strong>JMM (Java Memory Model)</strong> 是编写高并发、无锁或细粒度锁程序的核心基石。JMM 规范了 JVM 如何通过内存屏障与重排序规则来保证多线程环境下的可见性、有序性与原子性。</p>

<blockquote>
  <strong>核心原则：</strong> volatile 关键字仅保证可见性与禁止指令重排（通过插入 LoadStore / StoreStore 内存屏障），并不保证 i++ 等复合操作的原子性。
</blockquote>

<h2>1.1 Volatile 双重检查锁定单例 (DCL)</h2>
<p>在单例模式中，为什么 <code>instance</code> 变量必须加上 <code>volatile</code> 修饰？我们来看下面的经典实现：</p>

<pre><code class="language-java">public class LazySingleton {
    // 关键点：volatile 防止第 14 行实例化时的指令重排序
    private static volatile LazySingleton instance;

    private LazySingleton() {
        // 防止反射破坏单例
    }

    public static LazySingleton getInstance() {
        if (instance == null) { // 第一次检查：避免无意义加锁
            synchronized (LazySingleton.class) {
                if (instance == null) { // 第二次检查：保证只初始化一次
                    instance = new LazySingleton();
                }
            }
        }
        return instance;
    }
}</code></pre>

<p>执行 <code>new LazySingleton()</code> 在底层实际上包含三步指令：</p>
<ol>
  <li>分配对象的内存空间 (<code>memory = allocate()</code>)</li>
  <li>初始化对象 (<code>ctorInstance(memory)</code>)</li>
  <li>将 <code>instance</code> 指向刚分配的内存地址 (<code>instance = memory</code>)</li>
</ol>
<p>如果发生 2 与 3 的指令重排序，其他线程可能在第一次 <code>null</code> 检查时拿到尚未初始化完毕的半成品对象，导致未知异常。</p>

<h2>1.2 锁膨胀与偏向锁 / 轻量级锁演化</h2>
<p>HotSpot 虚拟机针对 <code>synchronized</code> 内置锁的优化遵循锁升级路径，下表对比了锁状态的优缺点：</p>

<table>
  <thead>
    <tr>
      <th>锁状态</th>
      <th>Mark Word 标志位</th>
      <th>加锁机制与代价</th>
      <th>典型适用场景</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>无锁 (Unlocked)</strong></td>
      <td>001 (无偏向)</td>
      <td>无锁竞争，自由访问</td>
      <td>纯单线程或只读数据</td>
    </tr>
    <tr>
      <td><strong>偏向锁 (Biased)</strong></td>
      <td>101</td>
      <td>仅记录 ThreadID，零 CAS 开销</td>
      <td>单个线程反复进入临界区</td>
    </tr>
    <tr>
      <td><strong>轻量级锁 (Lightweight)</strong></td>
      <td>000</td>
      <td>自旋 CAS 替换栈帧锁记录指针</td>
      <td>同步周期极短、线程交替执行</td>
    </tr>
    <tr>
      <td><strong>重量级锁 (Heavyweight)</strong></td>
      <td>010</td>
      <td>OS 互斥原语（Mutex Lock），涉及内核态切换</td>
      <td>多线程高强度并发锁竞争</td>
    </tr>
  </tbody>
</table>

<h1>02. JVM 垃圾回收器进阶剖析</h1>
<p>现代生产环境中主要采用 <strong>ZGC</strong> 与 <strong>G1 GC</strong>。ZGC 实现了低毫秒级的 STW (Stop-The-World) 暂停时间，其核心依靠<strong>着色指针（Colored Pointers）</strong>与<strong>读屏障（Load Barrier）</strong>。</p>

<h2>2.1 ZGC 核心特性速记</h2>
<ul>
  <li><strong>超大堆支持</strong>：支持从 8MB 到 16TB 的堆内存，暂停时间始终稳定在 1ms 以内。</li>
  <li><strong>着色指针</strong>：将指针的高 4 位用于标记标记位（Marked0, Marked1, Remapped 等），无需额外的标记对象头。</li>
</ul>
`;

const INITIAL_PAPER_CONTENT = `
<h1>Attention Is All You Need：论文精读与数学原理</h1>
<p>Vaswani 等人于 2017 年发表的开创性论文《Attention Is All You Need》彻底颠覆了自然语言处理领域，提出了完全基于自注意力机制的 <strong>Transformer</strong> 架构，彻底抛弃了循环神经网络（RNN）和卷积网络（CNN）的时间递归依赖。</p>

<blockquote>
  <strong>论文摘要核心：</strong> 传统序列转录模型依赖循环机制，存在顺序计算无法大规模并行的问题。Transformer 架构通过多头注意力机制（Multi-Head Attention）与位置编码（Positional Encoding），实现了全并行化训练并刷新了机器翻译 SOTA。
</blockquote>

<h2>1. 缩放点积注意力 (Scaled Dot-Product Attention)</h2>
<p>给定查询矩阵 $Q$、键矩阵 $K$ 和值矩阵 $V$，缩放点积注意力的计算公式定义如下：</p>

<p>$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{Q K^T}{\\sqrt{d_k}}\\right) V$$</p>

<p>其中 $d_k$ 是键向量的维度。引入缩放因子 $\\frac{1}{\\sqrt{d_k}}$ 的关键原因在于：当维度较大时，点积结果的量级增大，导致进入 Softmax 函数后处于极小梯度的饱和区域，从而产生梯度消失现象。</p>

<h2>2. 多头注意力机制 (Multi-Head Attention)</h2>
<p>多头注意力允许模型同时关注不同位置上不同表征子空间的信息：</p>

<pre><code class="language-python">import torch
import torch.nn as nn
import math

class ScaledDotProductAttention(nn.Module):
    def __init__(self, d_k):
        super().__init__()
        self.scale = 1.0 / math.sqrt(d_k)

    def forward(self, q, k, v, mask=None):
        scores = torch.matmul(q, k.transpose(-2, -1)) * self.scale
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        p_attn = torch.softmax(scores, dim=-1)
        return torch.matmul(p_attn, v), p_attn</code></pre>

<h2>3. 模块架构对比</h2>
<table>
  <thead>
    <tr>
      <th>模型架构</th>
      <th>时间复杂度 (每层)</th>
      <th>连续操作复杂度 (顺序执行)</th>
      <th>最大路径长度</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>RNN (LSTM / GRU)</strong></td>
      <td>$O(n \\cdot d^2)$</td>
      <td>$O(n)$ （无法并行）</td>
      <td>$O(n)$</td>
    </tr>
    <tr>
      <td><strong>CNN</strong></td>
      <td>$O(k \\cdot n \\cdot d^2)$</td>
      <td>$O(1)$</td>
      <td>$O(\\log_k(n))$</td>
    </tr>
    <tr>
      <td><strong>Self-Attention</strong></td>
      <td>$O(n^2 \\cdot d)$</td>
      <td>$O(1)$ （全并行）</td>
      <td>$O(1)$</td>
    </tr>
  </tbody>
</table>
`;

const DEFAULT_NOTEBOOKS: Notebook[] = [
  {
    id: 'nb-java-concurrency',
    title: 'Java 核心进阶与并发模型手记',
    description: '深入 JMM、volatile 屏障、synchronized 锁升级与 JVM 垃圾回收机制',
    colorKey: 'clay',
    createdAt: Date.now() - 3600000 * 24 * 3,
    updatedAt: Date.now() - 1000 * 60 * 15,
    content: INITIAL_JAVA_CONTENT.trim(),
    fontSize: 16,
    alignment: 'left',
  },
  {
    id: 'nb-transformer-paper',
    title: 'Attention Is All You Need 研读手记',
    description: 'Transformer 原始论文精读、自注意力机制数学推导与代码实现',
    colorKey: 'slate',
    createdAt: Date.now() - 3600000 * 24 * 7,
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
    content: INITIAL_PAPER_CONTENT.trim(),
    fontSize: 16,
    alignment: 'left',
  },
];

const STORAGE_KEY = 'qnote_notebooks_v1';

interface NotebookState {
  notebooks: Notebook[];
  createNotebook: (title: string, colorKey: string, description?: string) => Notebook;
  updateNotebookContent: (id: string, content: string) => void;
  updateNotebookSettings: (id: string, settings: { fontSize?: number; zoomLevel?: number; alignment?: 'left' | 'center' | 'right'; title?: string; colorKey?: string }) => void;
  deleteNotebook: (id: string) => void;
  getNotebook: (id: string) => Notebook | undefined;
}

export const useNotebookStore = create<NotebookState>((set, get) => {
  // Load from localStorage or defaults
  const stored = localStorage.getItem(STORAGE_KEY);
  const initialNotebooks: Notebook[] = stored ? JSON.parse(stored) : DEFAULT_NOTEBOOKS;

  const saveToStorage = (list: Notebook[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  return {
    notebooks: initialNotebooks,

    createNotebook: (title, colorKey, description = '') => {
      const newBook: Notebook = {
        id: 'nb_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        title,
        colorKey,
        description,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        content: `<h1>${title}</h1><p>开始记录你的长卷学习笔记...</p>`,
        fontSize: 16,
        alignment: 'left',
      };
      const updated = [newBook, ...get().notebooks];
      set({ notebooks: updated });
      saveToStorage(updated);
      return newBook;
    },

    updateNotebookContent: (id, content) => {
      const updated = get().notebooks.map((nb) =>
        nb.id === id ? { ...nb, content, updatedAt: Date.now() } : nb
      );
      set({ notebooks: updated });
      saveToStorage(updated);
    },

    updateNotebookSettings: (id, settings) => {
      const updated = get().notebooks.map((nb) =>
        nb.id === id ? { ...nb, ...settings, updatedAt: Date.now() } : nb
      );
      set({ notebooks: updated });
      saveToStorage(updated);
    },

    deleteNotebook: (id) => {
      const updated = get().notebooks.filter((nb) => nb.id !== id);
      set({ notebooks: updated });
      saveToStorage(updated);
    },

    getNotebook: (id) => get().notebooks.find((nb) => nb.id === id),
  };
});
