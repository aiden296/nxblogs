---
name: sync-english-post
description: 'Bring English blog posts in this Nextra blog up to date with manual edits the user made to their Vietnamese counterparts. Use this whenever the user has finished auditing, reviewing, or editing posts under content/vi/posts/ and wants the matching content/en/posts/ files synced — phrases like "update the English posts", "sync EN with the Vietnamese changes", "I edited the Vietnamese version, now update English", "cập nhật bài tiếng anh", "đồng bộ bài tiếng anh theo bản tiếng việt". It patches only what changed so already-reviewed English prose is preserved, never re-translated wholesale. If an English counterpart does not exist yet, it creates one from the Vietnamese post using the blog-writer skill.'
---

# Sync English Post

In this blog, every post is written in Vietnamese first, finalized, then translated to English (see `CLAUDE.md`). The Vietnamese post under `content/vi/posts/` is the source of truth. This skill propagates edits the user has already made to a Vietnamese post into its English twin under `content/en/posts/`.

## The mental model: patch, don't re-translate

The English posts have usually been human-reviewed already. If you re-translate a whole post from scratch, you throw that review away and introduce drift in passages the user never touched. So treat this as applying a **patch**: find exactly what changed in the Vietnamese file, locate the corresponding spot in the English file, and change only that. Everything the user did not touch in Vietnamese must stay byte-for-byte identical in English.

The one exception is a missing English file — there is nothing to patch, so you translate the whole post (see "When the English post does not exist").

## Step 1 — Find what changed in Vietnamese

Decide which Vietnamese posts to sync and what changed in each. In order of preference:

1. **The user named specific posts** (e.g. "sync learn-security-group"). Use those slugs.
2. **Uncommitted working-tree edits** — the common case right after a manual review session:
   ```bash
   git diff --name-only -- content/vi/posts/
   git diff --cached --name-only -- content/vi/posts/
   ```
   For each changed file, read the actual edits with `git diff -- content/vi/posts/<slug>.mdx` (add `--cached` for staged changes). This diff is your work list — it tells you precisely which lines to translate and mirror.
3. **Already committed** — if the working tree is clean but the user says they updated Vietnamese, ask which commit or range, then `git diff <ref>..HEAD -- content/vi/posts/`. If they can't pin it down, fall back to a semantic comparison: read both the Vietnamese and English files in full and treat anything present in Vietnamese but absent or stale in English as the change set.

A Vietnamese post and its English twin always share the same filename (the slug). `content/vi/posts/foo-bar.mdx` pairs with `content/en/posts/foo-bar.mdx`.

## Step 2 — For each changed post, branch

- English file exists → **patch it** (Step 3).
- English file missing → **translate the whole post** via blog-writer (see "When the English post does not exist").

Handle one post at a time so each stays a focused, reviewable change.

## Step 3 — Apply the diff to the English file

Read the full English file first so you can match structure and preserve untouched prose. Then walk the Vietnamese diff hunk by hunk and apply the equivalent change to English.

### Classify each hunk

- **Prose changed** (a sentence reworded, a paragraph added or removed, a callout inserted). Translate the new/changed Vietnamese into natural English following blog-writer's Phase 4 translation guidelines and `CLAUDE.md` writing conventions, then edit the corresponding English passage. Match the existing English voice in surrounding paragraphs — do not let a freshly translated sentence read in a different register from its neighbors.
- **Formatting only** (bullet marker `*` to `-`, table column padding, a trailing newline, heading level). Mirror the same formatting change in English. There is nothing to translate — just make the English structure match.
- **Frontmatter** — apply the field-specific rules below.

### Frontmatter sync rules

The frontmatter block is partly mirrored and partly translated:

| Field | Action |
|-------|--------|
| `date` | Mirror exactly — same date in both locales |
| `tags` | Mirror exactly — tags are English in both files |
| `enableComment` | Mirror exactly |
| `title` | Translate/adapt — keep it leading with the topic and equally engaging, per `CLAUDE.md` title rules |
| `description` | Translate naturally |

So if a Vietnamese edit only added a tag (e.g. `+'Exam Prep'`), the English change is just adding that same tag — nothing else moves.

### Special elements

- `<ExcalidrawDiagram src="..." />` — diagram text is always English, so the `src` and the diagram itself are shared. Copy `src` verbatim. The `alt` text is English prose; if the Vietnamese `alt` changed, translate it.
- Code blocks — copy verbatim. Translate only comments, and recall this blog's code has no comments anyway, so code almost always copies unchanged.
- Tables — translate cell prose; keep numbers, identifiers, and emoji as-is.

### Translation reminders (from blog-writer Phase 4 + CLAUDE.md)

- Natural translation, not word-for-word. Keep technical terms in English.
- Emphasis is bold only, never italic — if a Vietnamese edit introduced italic, render the English as bold or plain, not italic.
- Explain a technical term on first mention, inline in prose (e.g. a parenthetical or em-dash aside).
- Conversational-but-technical tone, second person ("you").

## When the English post does not exist

There is no patch to apply, so create the full English translation from the finalized Vietnamese post. Use the **blog-writer** skill and run its Phase 4 (English Translation) against the existing Vietnamese file: read `content/vi/posts/<slug>.mdx`, produce `content/en/posts/<slug>.mdx` with the same slug, same `date`/`tags`/`enableComment`, translated `title`/`description`/body, and identical diagram references. You are not researching or re-outlining — the Vietnamese post is already finalized; you are only translating it. Skip blog-writer's earlier phases and STOP gates.

## Step 4 — Verify parity

After editing, confirm the two files are back in sync. Run the bundled check across the slugs you touched:

```bash
python3 .claude/skills/sync-english-post/scripts/check_parity.py <slug> [<slug> ...]
```

It compares `date`, `tags`, `enableComment`, and the set of `<ExcalidrawDiagram src>` values between the Vietnamese and English files and reports any mismatch or missing English file. Pass no arguments to scan every post pair.

Then eyeball the things a script can't judge:

- The English change covers everything the Vietnamese diff changed — no hunk silently dropped.
- No English passage outside the changed regions was altered.
- Section count and heading structure match between the two files.
- Newly translated prose reads naturally and matches the surrounding voice.

## Step 5 — Report

Tell the user, per post: what changed in Vietnamese, what you changed in English, anything you translated that warrants a second look, and the parity-check result. If you created a new English file, say so explicitly. Keep edits per post small and self-contained so the user can review each as its own diff.
