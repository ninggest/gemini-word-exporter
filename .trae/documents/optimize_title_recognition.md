# Plan: Optimize Title Recognition

The user wants to refine the auto-title recognition logic in `background/docx-generator.js`.
Currently, titles are identified purely by regex (matching patterns like "1.", "一、").
The new requirement adds a length constraint: a line matches the title pattern ONLY IF its length is **30 Chinese characters or less**. If it's longer, it should be treated as normal text (not bolded).

## Task
- [ ] Modify `background/docx-generator.js`
  - Update the `isAutoTitle` logic in `parseMarkdown` method.
  - Add a condition to check if `trimmed.length <= 30`.

## Implementation Details
In `background/docx-generator.js`:
Change:
```javascript
const isAutoTitle = titlePattern.test(trimmed);
```
To:
```javascript
// Title matches pattern AND does not exceed 30 characters
const isAutoTitle = titlePattern.test(trimmed) && trimmed.length <= 30;
```

This ensures that long paragraphs that happen to start with a numbering pattern (e.g. "1. This is a very long sentence that starts with a number...") are not mistakenly bolded as titles.
