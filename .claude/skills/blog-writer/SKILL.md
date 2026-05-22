---
name: blog-writer
description: 'Write high-quality technical blog posts with structured workflow. Use when asked to "write a blog post", "create a post about", "blog about", "tạo bài viết", "viết bài blog", or any request to create blog content. Handles research, outlining, diagram creation, writing in Vietnamese first, English translation, and dual-perspective review.'
---

# Blog Writer

A skill for writing high-quality technical blog posts with a structured 5-phase workflow. Produces bilingual content (Vietnamese + English) with Excalidraw diagrams, following established writing patterns and quality standards.

## When to Use This Skill

- "Write a blog post about..."
- "Create a post about..."
- "Blog about..."
- "Viết bài blog về..."
- "Tạo bài viết về..."
- Any request to create new blog content

## Workflow Overview

The skill follows 5 phases with 3 STOP gates requiring user approval:

```
Phase 1: Input Gathering
    ↓
Phase 2: Research & Outline → STOP #1 (user approves outline)
    ↓
Phase 3: Writing Vietnamese + Diagrams → STOP #2 (user reviews Vietnamese draft)
    ↓
Phase 4: English Translation
    ↓
Phase 5: Dual-Perspective Review → STOP #3 (user reviews findings)
```

---

## Phase 1: Input Gathering

Collect these parameters from the user. If not provided, ask explicitly:

| Parameter | Required | Description |
|-----------|----------|-------------|
| **Topic** | Yes | The subject of the blog post |
| **Depth** | Yes | `overview` or `deep-dive` |
| **Target audience** | Yes | Technical level of the reader (e.g., junior devs, mid-senior backend engineers) |
| **Pre-research summary** | No | Knowledge the user has already gathered |
| **Series info** | No | Which series, which part (e.g., "Cache Handbook 2/4") |
| **Date** | No | Publish date (default: today) |

### Depth definitions

**Overview** — The big picture:
- Full feature/property overview of the subject
- Ecosystem and how it fits in the broader landscape
- Practical deployment patterns and when to use
- Decision-making guidance (when to choose what)
- Target: 2,000-4,000 words, 4-6 sections, 1-3 diagrams

**Deep-dive** — Under the hood:
- Internal architecture and implementation details
- How it works mechanically (data structures, algorithms, protocols)
- Why it's designed that way (technical reasoning, trade-offs)
- Performance characteristics and optimizations
- Target: 3,500-8,000+ words, 7-12 sections, 5-8 diagrams

---

## Phase 2: Research & Outline

### 2.1 Research

Use web search to research the topic thoroughly. Combine findings with the user's pre-research summary (if provided). Focus on:

- Official documentation and architecture docs
- Authoritative technical blog posts and papers
- Real-world usage patterns and best practices
- Performance benchmarks and comparisons
- Common misconceptions and pitfalls

### 2.2 Structure the outline

Based on depth type, create a detailed section outline:

**For overview posts:**
1. Opening hook (real-world scenario)
2. Hero diagram placement
3. "What is X?" — definition + ecosystem positioning
4. Key features/properties (3-5 subsections)
5. Practical usage / when to use
6. Comparison with alternatives (table)
7. Conclusion + key takeaways

**For deep-dive posts:**
1. Opening hook (real-world scenario → failure → root cause)
2. Hero diagram placement
3. "What is X?" — definition + high-level architecture
4. Core concepts (2-3 foundational sections)
5. Internals / how it works under the hood (3-5 detailed sections)
6. Performance / why it's fast (or reliable, or scalable)
7. Advanced topics / edge cases
8. Comparison with alternatives (table)
9. Conclusion revisiting the opening question

### 2.3 Identify diagram opportunities

For each section, evaluate whether a diagram would help explain the concept. Mark sections that need diagrams in the outline. Prioritize diagrams for:

- Architecture overviews
- Data flow / request lifecycle
- Internal data structures
- Comparison of approaches
- Decision trees
- Storage layouts

### 2.4 Plan the hero image

The hero image is the most important diagram in the post. It must give readers an **instant mental model** of the entire topic before they read a single section. Think of it as the "if you only look at one diagram" image.

**What makes a great hero image:**

1. **Full ecosystem flow** — Show the complete data/request flow from input to output (e.g., Producers → Kafka Cluster → Consumers). The reader should see where the topic sits in a real system, not in isolation.

2. **Internal architecture at a glance** — Don't just show boxes. Reveal key internals that the post will explain (e.g., partitions with Leader/Follower replicas, internal topics like `__cluster_metadata`). This gives readers a preview of the depth to come.

3. **Real-world integration patterns** — Include how the topic connects to external systems in production (e.g., CDC with Debezium + PostgreSQL for Kafka, CloudFront + S3 + Lambda@Edge for S3). Show patterns practitioners actually use, not textbook-only configurations.

4. **Consistent color coding** — Use distinct colors to categorize component types:
   - One color family for external inputs (e.g., blue for producers/clients)
   - One color family for the core system internals (e.g., green for leaders, gray for followers)
   - One color family for external integrations (e.g., yellow for databases, purple for internal/metadata components)
   - Dashed borders + muted color for deprecated components

5. **Descriptive arrow labels** — Arrows should explain the interaction, not just connect boxes. Write what happens on each connection (e.g., "Send message directly to broker where partition leader located" instead of just an arrow from Producer to Broker).

6. **Evolution and context markers** — Show deprecated paths alongside current ones (e.g., ZooKeeper marked as deprecated with "← Replaced by KRaft"). This helps readers understand the technology's evolution.

7. **Multiple usage patterns** — If the topic supports different consumption/usage modes, show them (e.g., multiple Consumer Groups with different sizes to illustrate independent consumption).

**Layout:**
- Left-to-right flow as the primary direction
- Group related components in dashed containers with labels (e.g., "Kafka Cluster", "VPC")
- Title centered at the top of the diagram
- Placed immediately after the opening hook paragraphs, before `## 1.`

### 2.5 Suggest interactive components (if applicable)

If the topic would benefit from an interactive component (like a simulator, visualizer, or step-through demo), suggest it to the user. Do NOT create it automatically — only propose:

- What the component would visualize
- Why it would enhance the post
- Example interactions

### STOP Gate #1

Present the complete outline to the user including:
- Proposed title
- Section structure with brief descriptions
- Which sections will have diagrams (and what each diagram shows)
- Hero image description
- Interactive component suggestion (if any)
- Estimated word count

**Wait for user approval before proceeding.**

---

## Phase 3: Writing (Vietnamese First)

### 3.1 Create diagrams

Use the `/excalidraw-diagram-generator` skill to create all diagrams:

1. **Hero image first** — save to `public/{topic}-overview.excalidraw`
2. **Section diagrams** — save to `public/{topic}-{concept}.excalidraw`

Follow diagram guidelines below.

### 3.2 Write the Vietnamese post

Create the file at `content/vi/posts/{slug}.mdx`.

#### Frontmatter

```yaml
---
title: 'Descriptive title with engagement hook'
date: 'YYYY-MM-DD'
tags: ['Tag1', 'Tag2', 'Tag3']
description: '1-2 sentence summary covering the key points'
enableComment: true
---
```

**Title conventions:**
- Deep-dive: Include "Deep Dive" and a compelling metric or hook
  - Example: `'Apache Kafka: Deep Dive kiến trúc Event Streaming Platform xử lý hàng triệu events/giây'`
- Overview: Include a question or contrast that hooks the reader
  - Example: `'Load Balancer: Chọn ALB "Thông Minh" hay NLB "Thần Tốc"?'`

**Tags:** Use 2-4 tags from existing taxonomy: `Backend`, `System Design`, `Devops`, `AWS`, `SAA`, `Redis`, `Kafka`, `Data Structures`, `Cache`, `Database`, etc.

#### Opening hook

Every post MUST start with a real-world scenario using this pattern:

1. **Set the scene** — "Bạn đang xây..." / "Imagine you're building..." (2nd person, present tense)
2. **Escalate to failure** — Something goes wrong in a realistic way
3. **Identify root cause** — Why did this happen? What's the underlying problem?
4. **Introduce the solution** — This is what [Topic] solves
5. **Thesis statement** — What this post will cover

Example pattern from existing posts:
```
Bạn đang xây một hệ thống microservices. Service Order vừa tạo xong một đơn hàng...
[scenario builds up]
Đây chính là bài toán mà Apache Kafka giải quyết.
Bài viết này sẽ đi sâu vào kiến trúc bên trong của Kafka — từ...
```

#### Hero diagram placement

Immediately after the opening hook paragraphs, before the first `## 1.` section:

```mdx
<ExcalidrawDiagram
  src="/topic-overview.excalidraw"
  alt="Descriptive alt text — Key Component 1, Key Component 2, Key Component 3"
/>
```

#### Section structure

- Number major sections: `## 1. Title`, `## 2. Title`
- Number subsections: `### 1.1. Title`, `### 1.2. Title`
- Use `---` (horizontal rule) to separate major sections
- Each section should be self-contained but flow logically to the next

#### Writing style rules

1. **Explain every technical term on first mention**: Bold the term and explain inline
   - Example: `**Broker** là một server (hay process) trong Kafka cluster chịu trách nhiệm nhận, lưu trữ, và phục vụ dữ liệu.`

2. **Use analogies for complex concepts**:
   - Example: `Cache chính là cái bàn làm việc ngay trước mặt bạn (RAM). Database là thư viện khổng lồ nằm ở ngoại ô (Disk/SSD).`

3. **Direct address**: Use "bạn" / "you", "imagine", "hãy tưởng tượng"

4. **Conversational but technical tone**: Accessible without being dumbed down

5. **Tables for comparisons**: Use markdown tables with clear headers
   - Include emoji for yes/no columns where appropriate

6. **Code examples**: Always Node.js + TypeScript
   - No semicolons, single quotes, no comments
   - Use real libraries (e.g., `kafkajs`, `ioredis`, `@aws-sdk/*`)
   - Show practical, working code — not pseudocode

7. **Conclusion**: Revisit the opening question, provide 4-6 bullet-point key takeaways

#### Series posts

If this is part of a series, add a blockquote attribution near the top:

```mdx
> Đây là phần **X/Y** trong series [Series Name].
```

### STOP Gate #2

Present the completed Vietnamese draft to the user for review. The user may request:
- Content additions or removals
- Restructuring sections
- Tone adjustments
- Additional diagrams
- Deeper explanations of specific concepts

**Apply all requested changes before proceeding to translation.**

---

## Phase 4: English Translation

Create the file at `content/en/posts/{slug}.mdx` (same filename as Vietnamese).

### Translation guidelines

- **Natural translation**, not literal word-by-word
- Keep technical terms in English (they're already English in Vietnamese posts)
- Tags remain the same (already in English)
- Same diagram references (diagrams use English text)
- Adapt idioms and cultural references for English readers
- Maintain the same tone: conversational but technical
- Title should be equally engaging in English

---

## Phase 5: Dual-Perspective Review

### 5.1 Expert Review

Review the post as a **domain expert** in the topic. Check:

| Criteria | What to verify |
|----------|---------------|
| **Accuracy** | Are all technical facts correct? Any outdated information? |
| **Completeness** | Are there important aspects of the topic not covered? |
| **Depth calibration** | Does the depth match what was requested (overview vs deep-dive)? |
| **Technical reasoning** | Are the "why" explanations sound? Any logical gaps? |
| **Code correctness** | Do code examples work? Are they idiomatic? |
| **Comparison fairness** | Are comparisons balanced and accurate? |

### 5.2 Audience Review

Review the post as the **target audience**. Check:

| Criteria | What to verify |
|----------|---------------|
| **Accessibility** | Can the target audience follow the explanations? |
| **Search intent** | Does the post answer questions the audience would Google? |
| **Engagement** | Is the opening hook compelling? Does the narrative hold attention? |
| **Practical value** | Can the reader apply what they learned? |
| **Concept explanations** | Are all technical terms explained when first introduced? |
| **Flow** | Does the post build knowledge progressively? |

### STOP Gate #3

Present the review findings to the user:

1. **Expert findings**: List any accuracy issues, gaps, or improvements
2. **Audience findings**: List any accessibility or engagement concerns
3. **Recommended fixes**: Specific changes to make

Apply approved corrections to both Vietnamese and English versions.

---

## Diagram Guidelines

### General rules

- Save `.excalidraw` files to the `public/` directory
- Reference in MDX: `<ExcalidrawDiagram src="/filename.excalidraw" alt="Description" />`
- **All text inside diagrams MUST be in English** (even for Vietnamese posts)
- Never generate raw SVG files or ASCII art
- Use the `/excalidraw-diagram-generator` skill to create all diagrams
- Naming convention: `{topic}-{concept}.excalidraw` (kebab-case)

### Hero diagram

- See the detailed hero image guidelines in **Phase 2 → Section 2.4**
- Named: `{topic}-overview.excalidraw` or `{topic}-architecture-overview.excalidraw`
- Placed immediately after the opening hook, before `## 1.`

### Section diagrams

- Illustrate a specific concept within a section
- Placed right after the section that introduces the concept
- Named: `{topic}-{specific-concept}.excalidraw`

### AWS Architecture diagram style

When the topic involves AWS services, follow the official AWS reference architecture style:

- **No duplicate labels**: AWS icons already contain service names. Only add labels that describe role/purpose (e.g., "CDN Cache", "Private Bucket"), NOT the service name
- **Grouping containers**: Dashed or solid border rectangles (no fill or very light fill) to group related services. Label at top-left (e.g., "VPC", "Customer's AWS Account")
- **Numbered step circles**: Small filled dark circles (#1e1e1e) with white text numbers for flow order
- **Arrows**: Solid dark arrows (#1e1e1e), straight (horizontal/vertical) when possible
- **Layout**: Clean grid, flow left-to-right or top-to-bottom
- **No colored backgrounds** on individual services; only grouping containers have subtle borders
- **Official names**: Use "Amazon DynamoDB" not "DynamoDB", "AWS Lambda" not "Lambda" — but only in purpose labels
- **Icon library**: Use AWS icons from `.claude/skills/excalidraw-diagram-generator/libraries/aws-architecture-icons/`
- Never wrap individual services in colored rectangle boxes

### Non-AWS technical diagrams

- Clean, minimal style with white background
- Consistent color palette for related elements
- Clear flow direction (left-to-right or top-to-bottom)
- Short, descriptive labels
- Grouping containers for logical sections
- Numbered steps for sequential flows
- Legend when diagram has multiple element types

---

## Quality Checklists

### Deep-dive post checklist

- [ ] 7+ major sections with subsections
- [ ] 5+ Excalidraw diagrams including hero
- [ ] Internal architecture / implementation explained
- [ ] Performance / optimization section
- [ ] Code examples with real Node.js + TypeScript libraries
- [ ] Comparison tables with alternatives
- [ ] Every technical term explained on first mention
- [ ] At least 2 analogies for complex concepts
- [ ] Opening hook follows the scenario → failure → root cause → solution pattern
- [ ] Conclusion revisits opening question with 4-6 bullet takeaways
- [ ] 3,500-8,000+ words
- [ ] Both Vietnamese and English versions created
- [ ] All diagram text in English

### Overview post checklist

- [ ] 4-6 major sections
- [ ] 1-3 Excalidraw diagrams including hero
- [ ] "When to use" decision guidance
- [ ] Practical examples and real-world scenarios
- [ ] Comparison matrix with alternatives
- [ ] Every technical term explained on first mention
- [ ] Opening hook follows the established pattern
- [ ] Conclusion with key takeaways
- [ ] 2,000-4,000 words
- [ ] Both Vietnamese and English versions created
- [ ] All diagram text in English

---

## File Conventions

| Item | Convention |
|------|-----------|
| Vietnamese post | `content/vi/posts/{slug}.mdx` |
| English post | `content/en/posts/{slug}.mdx` |
| Diagrams | `public/{slug}-{concept}.excalidraw` |
| Slug format | kebab-case (e.g., `kafka-architecture-deep-dive`) |
| Code style | No semicolons, single quotes, 2-space indent, 120 char width |
| Code language | Always Node.js + TypeScript when possible |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Topic too broad for single post | Suggest splitting into a series. Follow series convention with blockquote attribution |
| Limited pre-research | Rely more heavily on web search. Flag to user if authoritative sources are scarce |
| Overlaps with existing post | Check `content/vi/posts/` for existing posts on the same topic. Link to them or differentiate clearly |
| Diagram too complex | Break into multiple simpler diagrams. Each diagram should communicate one clear idea |
| No good analogy available | Use a step-by-step walkthrough instead. Trace through a concrete example with real data |
