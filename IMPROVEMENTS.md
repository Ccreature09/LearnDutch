# Dutch Trainer Improvements - Input Validation & Spam Prevention

## New Features

### 1. Enhanced Feedback System
The app now provides **specific, detailed error messages** for each word that differs, including word order issues:

#### Example 1: Article + Verb Errors

**User Input:** `Wij bent niet in het stad`
**Expected:** `Wij zijn niet in de stad`

**Feedback shown:**
```
≈ One word differs: "bent" should be "zijn"

💡 Specific errors:
"bent" → "zijn"
  Use "zijn" with "wij" (verb: zijn)

"het" → "de"
  "stad" is a common noun (uses "de")
```

#### Example 2: Perfect Tense + Word Order

**User Input:** `Wij werken hebt`
**Expected:** `Wij hebben gewerkt`

**Feedback shown:**
```
≈ 2 words differ and word order is incorrect

💡 Specific errors:
"werken" → "hebben"
  Use the auxiliary verb "hebben" here, not the main verb
  Perfect tense uses: hebben + past participle

"hebt" → "gewerkt"
  Use the past participle "gewerkt" here, not the auxiliary
  Example structure: hebben gewerkt

📍 Word order: Perfect tense: Use "hebben" in position 2, 
with the past participle at the end. Example: 
"Wij hebben gewerkt" (We have worked)
```

### 2. Grammar-Specific Explanations
Each error now shows:
- **What's wrong:** Side-by-side comparison of your word vs. the correct word
- **Why it's wrong:** Dutch grammar rule explanation (e.g., noun gender, verb conjugation, perfect tense)
- **Practical rule:** Help text based on the error type

#### Error Types Detected:

1. **Article Errors (de/het)**
   - Explains if a noun is "common" (de) or "neuter" (het)
   - Example: "stad" is a common noun (uses "de")

2. **Verb Conjugation Errors**
   - Shows correct conjugation for each pronoun
   - Example: Use "zijn" with "wij" (verb: zijn)

3. **Perfect Tense Errors (hebben/zijn + past participle)**
   - Detects when auxiliary and participle are swapped or in wrong positions
   - Explains the structure: auxiliary verb in position 2, participle at end
   - Example: "Use 'hebben' here, not 'werken'. Perfect tense uses: hebben + past participle"

4. **Word Order/Inversion Issues**
   - Detects when words are correct but in wrong order
   - Detects when words are wrong AND in wrong order (combined feedback)
   - Points out verb position problems and perfect tense structure
   - Example: "📍 Word order: Perfect tense: Use 'hebben' in position 2, with the past participle at the end"

5. **Typos and Close Words**
   - Uses Levenshtein distance algorithm
   - Shows: "Very close! Did you mean 'stad'?"

### 3. Spam-Check Prevention

#### Problem Fixed:
- Users could click "Check" button repeatedly without moving to next question
- The "done" counter would increment multiple times for one question

#### Solution:
- **`isCheckingPractice` state** in practice mode
- **`isCheckingDrill` state** in drill mode
- Once answer is submitted:
  - Button becomes disabled with reduced opacity
  - Input field becomes disabled (in drill mode)
  - Can only proceed by clicking "Skip" or "Next Question"
  - `done` counter now increments **exactly once** per question

#### UI Changes:
```jsx
<button 
  className="btn success" 
  onClick={checkPractice}
  disabled={isCheckingPractice || !practiceAnswer.trim()}
  style={{ opacity: isCheckingPractice ? 0.6 : 1 }}
>
  ✓ Check
</button>
```

### 4. Improved UX Flow

#### Practice Mode:
1. User types answer
2. Clicks "Check" button (or presses Enter)
3. Receives detailed feedback with specific errors highlighted
4. Correct answer is shown in a green box at the bottom
5. "Check" and "Skip" buttons are replaced with "Next Question" button
6. Clicks "Next Question" to proceed to next question
7. Done counter increments exactly once
8. Works the same for correct, close, and wrong answers

#### Drill Mode:
1. User types answer
2. Clicks "Submit" (or presses Enter)
3. Automatically moves to next question
4. Input field clears for next question
5. Button re-enables for next answer

### 5. Better Error Display

Feedback now shows in a styled box with:
- **Error header:** Shows number of words that differ
- **Detailed list:** Each word error with explanation
- **Word order hints:** Specific advice about verb position
- **Correct answer:** Always shown in a green box at the bottom
- **Navigation:** Full-width "Next Question" button to proceed

```
┌─────────────────────────────────────┐
│ ✗ 2 words differ and word order...  │
│                                      │
│ 💡 Specific errors:                 │
│ "werken" → "hebben"                 │
│   Use the auxiliary verb "hebben"   │
│ "hebt" → "gewerkt"                  │
│   Use the past participle...        │
│                                      │
│ 📍 Word order: Perfect tense...     │
│                                      │
│ ✓ Correct answer:                   │
│ Wij hebben gewerkt                  │
│                                      │
│        [Next Question →]             │
└─────────────────────────────────────┘
```

### 6. Consistent Feedback for All Answer States

Whether the answer is **correct**, **close**, or **wrong**:
- Detailed errors are shown
- Correct sentence is always visible
- User clicks "Next Question" to proceed
- No "Check" or "Skip" buttons after answering

## Technical Implementation

### New/Modified Files:

1. **`src/lib/feedback-analyzer.ts`** (Enhanced)
   - Added `nounArticles` database for de/het rules
   - Added `verbConjugations` for verb forms
   - Improved `getExplanation()` with Dutch-specific rules
   - Enhanced `detectInversionError()` for word order hints
   - Added `levenshteinDistance()` for typo detection

2. **`src/components/dutch-trainer-app.tsx`** (Updated)
   - Imported `analyzeAnswer` from feedback-analyzer
   - Added `isCheckingPractice` state
   - Added `isCheckingDrill` state
   - Updated `checkPractice()` to use detailed feedback
   - Updated `submitDrillAnswer()` with spam prevention
   - Updated UI to show detailed error breakdown
   - Added disabled states and visual feedback

3. **`src/lib/types.ts`** (Already had)
   - `Feedback` interface with `details` array and `inversionNote`

## Behavior Changes

### Before:
```
User types: "Wij bent niet in het stad"
Click Check
Feedback: "Not quite. Expected: Wij zijn niet in de stad"
Can click Check again (spam)
Done: 2 (incremented twice)
```

### After:
```
User types: "Wij bent niet in het stad"
Click Check
Feedback (detailed):
  "bent" → "zijn" (Use "zijn" with "wij")
  "het" → "de" (stad is common noun)
  
✓ Correct answer: Wij zijn niet in de stad

Check button replaced with "Next Question"
Can't click Check again
Done: 1 (incremented once)
```

## Testing Checklist

- [ ] Practice mode shows detailed error explanations
- [ ] Can't spam check on same question
- [ ] Done counter increments exactly once per question
- [ ] Drill mode prevents multiple submissions per question
- [ ] Correct answers show "Next Question" button
- [ ] Empty input submissions are blocked
- [ ] Word order errors show position hints
- [ ] Article errors explain de/het rules
- [ ] Verb conjugation errors show correct form
- [ ] Skip button works in practice mode
- [ ] Drill mode flows correctly to next question

## Future Enhancements

1. More nouns in the `nounArticles` database
2. Additional verb conjugation patterns
3. Preposition error detection (in, op, onder, etc.)
4. Tense error detection (past vs. present)
5. Pluralization error detection
6. Sentence structure analysis for complex sentences
