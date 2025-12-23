---
title: "PlanetScale 向量索引设计"
description: "design of vector index in PlanetScale"
date: "Dec 03 2025"
---

本文是《[Larger than RAM Vector Indexes for Relational Databases](https://planetscale.com/blog/larger-than-ram-vector-indexes-for-relational-databases)》的笔记。

## 架构

索引由两层构成：
1. Head Index（头部索引）
    - in-memory HNSW 子集
    - 默认占总向量的 ~20%
    - 存放向量的代表点（centroids 或 heads）
2. 在磁盘上的 Posting Lists（倒排列表）
    - 剩余 ~80% 向量存放在 InnoDB 中
    - 每个 head 都有对应的 posting list
    - 数据以二进制 blob 形式存储

## 插入流程
1. 在 Head Index 上执行 ANN 查询
2. 找到向量所属的若干 posting lists（一个向量可归属多个 posting list）
3. 每个 posting list 追加向量

使用较为底层的接口（InnoDB’s B-tree API）完成 posting 的更新。

可以将 posting list 想象成一张内部表，那么insert流程实际上就是如下更新操作：

```sql
UPDATE vector_index_table
SET postings = CONCAT(postings, :new_vector_data)
WHERE head_id = :target_head_id;
```

问题：blob无法原地更新 ，必须申请新的空间，将原来的内容拷贝过去，过程中需要加行锁，性能影响巨大。

最好的解决方案：LSMTree（Meta MyRocks）

解决方案：模仿 lsm-tree，使用组合索引 (head_vector_id, sequence)。用自增序号序列作为第二维 key，避免主 B-tree 全量重写。

带来的问题：posting table 中会存在大量的数据，会对查询性能造成影响。

### Posting List 分裂机制
随着持续插入，某些 posting list 会变得过大，影响查询效率。
他们引入了 Split 后台任务：
- 把过大列表拆分为 K 个子集
- 使用 k-means 聚类来发现新的 heads
- 将它们插入 Head Index

### Reassignments（重分配）
Splits 会打破 “向量属于最近 head”（NPA：nearest partition assignment） 的判定条件。需要进行重分配以保证 NPA 属性，为此，将会面临两个棘手的问题：
- 如何高效地找出哪些向量需要移动
- 如何移动？包含插入和删除两个动作
    - 利用“模仿 lsm-tree”的解决方案可以解决插入问题
    - 如何 remove 呢？

为了高效 remove，他们采用了：版本号机制 (~versioning)。
每条向量带一个版本字节；每次重分配增加版本。
查询时旧版本视为 stale，从而达到逻辑删除效果而无需物理剔除的效果。
维护纯内存的 version table，记录每个向量的最新版本。

## 更新和删除

采用标记删除，在 version table 中增加删除标记

更新：拆解成删除加插入操作

### Merge & Defragment 操作
随着版本累积，posting lists 可能积累大量过期向量（Reassignments带来的问题），降低效率。

他们引入：

#### Merge（合并）
合并邻近 heads 的 posting lists，去除 stale 数据，
重新计算中心向量，维护索引平衡

#### Defragment
对 InnoDB 中底层存储进行碎片整理，独立于 stale 移除机制。
这些都是后台任务，不阻塞用户查询

## 事务与崩溃恢复
所有 posting lists 数据都由 InnoDB ACID 引擎管理，自然继承事务语义。
为了管理 Head Index 的日志，他们引入：
Head Index Compaction
序列化当前内存索引到磁盘，然后清理 WAL。
这一过程暂停后台合并/分裂任务，但允许普通查询和写入继续执行


