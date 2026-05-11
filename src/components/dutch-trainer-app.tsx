"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "../lib/theme-context";
import {
  allCategories,
  buildQuestionSet,
  categoryLabels,
  createPracticeItem,
  isCloseAnswer,
  normalizeAnswer
} from "../lib/dutch-data";
import { ConjugationTable } from "./conjugation-table";
import { dutchLexicon, LEXICON_CATEGORY_LABEL, lexiconMatchesQuery } from "../lib/dutch-lexicon";
import { FLASHCARD_GROUP_LABEL, cardBelongsToDeck, createDefaultFlashcards, gradeFlashcard, mergeFlashcards } from "../lib/flashcards";
import { clearAppSessionData, loadAdaptiveProfile, loadDrillLog, loadFlashcards, saveAdaptiveProfile, saveDrillLog, saveFlashcards } from "../lib/storage";
import { analyzeAnswer } from "../lib/feedback-analyzer";
import { AdaptiveLearningTracker, AdaptiveProfile } from "../adaptive-learning/tracker";
import {
  DeckType,
  Direction,
  DrillLogEntry,
  DrillQuestionResult,
  Feedback as FeedbackType,
  Flashcard,
  FlashcardGrade,
  LexiconCategory,
  LexiconEntry,
  PracticeCategory,
  PracticeItem
} from "../lib/types";

type Tab = "practice" | "drill" | "flashcards" | "log";
type DrillState = "setup" | "running" | "results";
type FlashcardMode = "spaced" | "infinite";

const FLASHCARD_DECK_OPTIONS: DeckType[] = [
  "all",
  "verbs",
  "modal_verbs",
  "nouns",
  "pronouns",
  "adjectives",
  "prepositions",
  "conjunctions",
  "grammar_terms",
  "articles",
  "particles",
  "numerals",
  "determiners",
  "adverbs",
  "names",
  "phrases",
  "demonstratives"
];

function shuffleItems<T>(items: T[]) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function buildFlashcardQueue(cards: Flashcard[]) {
  const weightedIds = cards.flatMap((card) => {
    const weight = card.mastery < 0.35 ? 3 : card.mastery < 0.7 ? 2 : 1;
    return Array.from({ length: weight }, () => card.id);
  });
  return shuffleItems(weightedIds.length ? weightedIds : cards.map((card) => card.id));
}

function getFlashcardSides(card: Flashcard, direction: Direction) {
  if (direction === "nl-to-en") {
    return {
      frontLabel: "Dutch",
      front: card.back,
      backLabel: "English",
      back: card.front
    };
  }

  return {
    frontLabel: "English",
    front: card.front,
    backLabel: "Dutch",
    back: card.back
  };
}

function randomCategory(categories: PracticeCategory[]) {
  return categories[Math.floor(Math.random() * categories.length)];
}

function downloadText(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function DutchTrainerApp() {
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState<Tab>("practice");
  const [direction, setDirection] = useState<Direction>("en-to-nl");

  const [practiceCategories, setPracticeCategories] = useState<PracticeCategory[]>([...allCategories]);
  const [practiceItem, setPracticeItem] = useState<PracticeItem | null>(null);
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [practiceFeedback, setPracticeFeedback] = useState<FeedbackType | null>(null);
  const [practiceStats, setPracticeStats] = useState({ done: 0, correct: 0, streak: 0 });
  const [isCheckingPractice, setIsCheckingPractice] = useState(false);

  const [drillState, setDrillState] = useState<DrillState>("setup");
  const [drillCategory, setDrillCategory] = useState<PracticeCategory | "all">("all");
  const [drillCount, setDrillCount] = useState(20);
  const [drillQuestions, setDrillQuestions] = useState<PracticeItem[]>([]);
  const [drillIndex, setDrillIndex] = useState(0);
  const [drillAnswer, setDrillAnswer] = useState("");
  const [drillResults, setDrillResults] = useState<DrillQuestionResult[]>([]);
  const [drillLog, setDrillLog] = useState<DrillLogEntry[]>([]);
  const [isCheckingDrill, setIsCheckingDrill] = useState(false);
  const [drillCopyStatus, setDrillCopyStatus] = useState<string | null>(null);

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [deck, setDeck] = useState<DeckType>("all");
  const [flashcardMode, setFlashcardMode] = useState<FlashcardMode>("infinite");
  const [flashcardQueue, setFlashcardQueue] = useState<string[]>([]);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [showFlashAnswer, setShowFlashAnswer] = useState(false);
  const [flashcardFocusMode, setFlashcardFocusMode] = useState(false);

  const trackerRef = useRef(new AdaptiveLearningTracker(loadAdaptiveProfile()));
  const [adaptiveProfile, setAdaptiveProfile] = useState<AdaptiveProfile>(
    trackerRef.current.getProfile()
  );

  const [showReference, setShowReference] = useState(true);
  const [referenceQuery, setReferenceQuery] = useState("");
  const [lexiconCategoryFilter, setLexiconCategoryFilter] = useState<LexiconCategory | "all">("all");
  const [selectedLexiconEntry, setSelectedLexiconEntry] = useState<LexiconEntry | null>(() => dutchLexicon[0] ?? null);

  useEffect(() => {
    if (!practiceCategories.length) {
      setPracticeItem(null);
      return;
    }
    setPracticeItem(createPracticeItem(direction, randomCategory(practiceCategories)));
  }, [direction, practiceCategories]);

  useEffect(() => {
    setDrillLog(loadDrillLog());
    const existingCards = loadFlashcards();
    const defaultCards = createDefaultFlashcards();
    setFlashcards(existingCards.length ? mergeFlashcards(existingCards, defaultCards) : defaultCards);
  }, []);

  useEffect(() => {
    if (flashcards.length) saveFlashcards(flashcards);
  }, [flashcards]);

  const practiceScore = useMemo(() => {
    if (!practiceStats.done) return 0;
    return Math.round((practiceStats.correct / practiceStats.done) * 100);
  }, [practiceStats]);

  const filteredFlashcards = useMemo(() => {
    return flashcards.filter((card: Flashcard) => cardBelongsToDeck(card, deck));
  }, [flashcards, deck]);

  const currentFlashcard = useMemo(() => {
    if (!flashcardQueue.length || !filteredFlashcards.length) return null;
    const currentId = flashcardQueue[flashcardIndex];
    return filteredFlashcards.find((card) => card.id === currentId) ?? filteredFlashcards[0] ?? null;
  }, [flashcardQueue, flashcardIndex, filteredFlashcards]);

  const reviewedToday = useMemo(() => {
    const today = new Date().toDateString();
    return flashcards.filter((card: Flashcard) => card.lastReviewedAt && new Date(card.lastReviewedAt).toDateString() === today)
      .length;
  }, [flashcards]);

  const filteredLexicon = useMemo(() => {
    return dutchLexicon.filter(
      (e: LexiconEntry) =>
        lexiconMatchesQuery(e, referenceQuery) && (lexiconCategoryFilter === "all" || e.category === lexiconCategoryFilter)
    );
  }, [referenceQuery, lexiconCategoryFilter]);

  useEffect(() => {
    if (!filteredLexicon.length) {
      setSelectedLexiconEntry(null);
      return;
    }
    setSelectedLexiconEntry((prev) => {
      if (prev && filteredLexicon.some((e) => e.dutch === prev.dutch && e.category === prev.category)) return prev;
      return filteredLexicon[0];
    });
  }, [filteredLexicon]);

  useEffect(() => {
    if (!filteredFlashcards.length) {
      setFlashcardQueue([]);
      setFlashcardIndex(0);
      setShowFlashAnswer(false);
      return;
    }

    setFlashcardQueue(buildFlashcardQueue(filteredFlashcards));
    setFlashcardIndex(0);
    setShowFlashAnswer(false);
  }, [deck, flashcardMode, flashcards.length]);

  useEffect(() => {
    setShowFlashAnswer(false);
  }, [direction]);

  useEffect(() => {
    if (flashcardFocusMode) {
      setShowFlashAnswer(false);
    }
  }, [flashcardFocusMode]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setFlashcardFocusMode(false);
      }
    }

    if (flashcardFocusMode) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }

    return undefined;
  }, [flashcardFocusMode]);

  useEffect(() => {
    if (tab !== "flashcards") {
      setFlashcardFocusMode(false);
    }
  }, [tab]);

  const currentDrillQuestion = drillQuestions[drillIndex] ?? null;

  function getFlashcardById(cardId?: string) {
    if (!cardId) return null;
    return flashcards.find((card) => card.id === cardId) ?? null;
  }

  function nextPractice() {
    if (!practiceCategories.length) return;
    const category = randomCategory(practiceCategories);
    setPracticeItem(createPracticeItem(direction, category));
    setPracticeAnswer("");
    setPracticeFeedback(null);
    setIsCheckingPractice(false);
  }

  function moveToNextFlashcard() {
    if (!flashcardQueue.length || !filteredFlashcards.length) return;

    const nextIndex = flashcardIndex + 1;
    if (nextIndex >= flashcardQueue.length) {
      setFlashcardQueue(buildFlashcardQueue(filteredFlashcards));
      setFlashcardIndex(0);
      setShowFlashAnswer(false);
      return;
    }

    setFlashcardIndex(nextIndex);
    setShowFlashAnswer(false);
  }

  function evaluate(input: string, expected: string, accepted: string[]) {
    const normalized = normalizeAnswer(input);
    const valid = accepted.some((value) => normalizeAnswer(value) === normalized);
    if (valid) return { correct: true, close: false };
    return { correct: false, close: isCloseAnswer(input, expected) };
  }

  function checkPractice() {
    if (!practiceItem || isCheckingPractice || !practiceAnswer.trim()) return;

    setIsCheckingPractice(true);
    const result = evaluate(practiceAnswer, practiceItem.expected, practiceItem.accepted);

    // Use advanced feedback analyzer for detailed errors
    let feedback = analyzeAnswer(
      practiceAnswer,
      practiceItem.expected,
      practiceItem.category,
      practiceItem.grammar
    );

    // Reconcile analyzer result with strict evaluation to avoid false positives
    if (!result.correct && feedback.type === "ok") {
      feedback = {
        type: "bad",
        text: `Expected: ${practiceItem.expected}`,
        diffTokens: [],
        details: []
      };
    }

    // Only increment done counter once per question
    setPracticeStats((prev: { done: number; correct: number; streak: number }) => ({
      done: prev.done + 1,
      correct: prev.correct + (result.correct ? 1 : 0),
      streak: result.correct ? prev.streak + 1 : 0
    }));

    setPracticeFeedback(feedback);

    if (feedback.errorTypes && feedback.errorTypes.length) {
      const updated = trackerRef.current.recordAttempt(feedback.errorTypes);
      setAdaptiveProfile(updated);
      saveAdaptiveProfile(updated);
    }
  }

  function toggleCategory(category: PracticeCategory) {
    setPracticeCategories((prev: PracticeCategory[]) => {
      if (prev.includes(category)) {
        const next = prev.filter((c: PracticeCategory) => c !== category);
        return next.length ? next : [...allCategories];
      }
      return [...prev, category];
    });
  }

  function startDrill() {
    setDrillCopyStatus(null);
    const count = Math.min(100, Math.max(5, drillCount));
    const questions = buildQuestionSet(count, drillCategory, direction);
    setDrillQuestions(questions);
    setDrillIndex(0);
    setDrillResults([]);
    setDrillAnswer("");
    setDrillState("running");
  }

  function submitDrillAnswer() {
    const item = currentDrillQuestion;
    if (!item || isCheckingDrill || !drillAnswer.trim()) return;

    setIsCheckingDrill(true);

    const result = evaluate(drillAnswer, item.expected, item.accepted);
    const updated = [
      ...drillResults,
      {
        item,
        userAnswer: drillAnswer,
        correct: result.correct
      }
    ];
    setDrillResults(updated);
    setDrillAnswer("");

    // Move to next question or finish
    if (drillIndex + 1 >= drillQuestions.length) {
      setDrillState("results");
      const score = updated.filter((r) => r.correct).length;
      const entry: DrillLogEntry = {
        id: crypto.randomUUID(),
        completedAt: new Date().toISOString(),
        category: drillCategory,
        questionCount: drillQuestions.length,
        score,
        percentage: Math.round((score / drillQuestions.length) * 100)
      };
      const nextLog = [entry, ...drillLog].slice(0, 200);
      setDrillLog(nextLog);
      saveDrillLog(nextLog);
      setIsCheckingDrill(false);
      return;
    }

    setDrillIndex((prev) => prev + 1);
    setIsCheckingDrill(false);
  }

  async function copyFiftyQuestions() {
    const questions = buildQuestionSet(50, drillCategory, direction);
    const text = questions
      .map((item, index) => `${index + 1}. ${item.prompt}\n   Answer: ${item.expected}\n   Hint: ${item.hint}`)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(text);
      setDrillCopyStatus("Copied 50 questions to clipboard.");
    } catch {
      setDrillCopyStatus("Clipboard copy failed. Try again or use a secure context.");
    }
  }

  function clearDrillLog() {
    if (!window.confirm("Clear all drill history?")) return;
    setDrillLog([]);
    saveDrillLog([]);
  }

  function exportLogCsv() {
    const header = "date,category,questions,score,percentage";
    const rows = drillLog.map((entry: DrillLogEntry) =>
      [
        new Date(entry.completedAt).toLocaleString(),
        entry.category,
        entry.questionCount,
        entry.score,
        `${entry.percentage}%`
      ].join(",")
    );
    downloadText("dutch-drill-log.csv", [header, ...rows].join("\n"), "text/csv");
  }

  function gradeCurrentCard(grade: FlashcardGrade) {
    const card = currentFlashcard;
    if (!card) return;
    const next = flashcards.map((c) => (c.id === card.id ? gradeFlashcard(c, grade) : c));
    setFlashcards(next);
    setShowFlashAnswer(false);

    if (flashcardMode === "infinite") {
      moveToNextFlashcard();
      return;
    }

    const nextQueue = [...flashcardQueue];
    const currentId = card.id;
    nextQueue.splice(flashcardIndex, 1);

    if (grade === "again") {
      nextQueue.splice(Math.min(flashcardIndex + 1, nextQueue.length), 0, currentId);
    } else if (grade === "hard") {
      nextQueue.splice(Math.min(flashcardIndex + 10, nextQueue.length), 0, currentId);
    } else if (grade === "good") {
      nextQueue.splice(Math.min(flashcardIndex + 20, nextQueue.length), 0, currentId);
    }

    if (!nextQueue.length) {
      setFlashcardQueue(buildFlashcardQueue(filteredFlashcards));
      setFlashcardIndex(0);
      return;
    }

    setFlashcardQueue(nextQueue);
    setFlashcardIndex(grade === "easy" ? Math.min(flashcardIndex, nextQueue.length - 1) : Math.min(flashcardIndex + 1, nextQueue.length - 1));
  }

  function exportFlashcards() {
    downloadText("dutch-flashcards.json", JSON.stringify(flashcards, null, 2), "application/json");
  }

  function clearAllSessionData() {
    const confirmed = window.confirm("Clear flashcards, drill history, and adaptive session data?");
    if (!confirmed) return;

    clearAppSessionData();
    trackerRef.current = new AdaptiveLearningTracker({ weaknessByType: {}, attempts: 0 });
    setAdaptiveProfile(trackerRef.current.getProfile());
    setDrillLog([]);
    setFlashcards(createDefaultFlashcards());
    setFlashcardQueue([]);
    setFlashcardIndex(0);
    setShowFlashAnswer(false);
    setDrillQuestions([]);
    setDrillResults([]);
    setDrillIndex(0);
    setDrillAnswer("");
    setDrillState("setup");
    setDrillCopyStatus("Session data cleared.");
  }

  return (
    <>
      <div className="app-shell">
        <main className="card main-card">
          <h1>🇳🇱 Dutch Trainer Pro</h1>
          <p className="muted" style={{ margin: "0 0 24px 0", fontSize: "0.95rem" }}>
            Master Dutch with practice, drills, flashcards & grammar references
          </p>

          <div className="tabs">
            {(["practice", "drill", "flashcards", "log"] as Tab[]).map((name: Tab) => (
              <button
                key={name}
                className={`tab-btn ${tab === name ? "active" : ""}`}
                onClick={() => setTab(name)}
              >
                {name === "practice" && "🎯 "}
                {name === "drill" && "📝 "}
                {name === "flashcards" && "🗂️ "}
                {name === "log" && "📊 "}
                {name[0].toUpperCase() + name.slice(1)}
              </button>
            ))}
          </div>

          {tab === "practice" && practiceItem && (
            <section>
              <div className="stats" style={{ maxWidth: 520 }}>
                <div className="stat">
                  <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>Done</div>
                  <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--accent)" }}>
                    {practiceStats.done}
                  </div>
                </div>
                <div className="stat">
                  <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>Correct</div>
                  <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--ok)" }}>
                    {practiceStats.correct}
                  </div>
                </div>
                <div className="stat">
                  <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>Streak</div>
                  <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--warn)" }}>
                    {practiceStats.streak}
                  </div>
                </div>
                <div className="stat">
                  <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>Score</div>
                  <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--accent)" }}>
                    {practiceScore}%
                  </div>
                </div>
              </div>

              <div className="prompt">{practiceItem.prompt}</div>
              <input
                value={practiceAnswer}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPracticeAnswer(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") {
                    // If feedback is already shown, go to next question
                    if (practiceFeedback) {
                      nextPractice();
                    } else {
                      // Otherwise, check the answer
                      checkPractice();
                    }
                  }
                }}
                placeholder="Type your answer here..."
                style={{ width: "100%", marginBottom: 16 }}
              />
              <div className="row" style={{ gap: 12 }}>
                {/* Show Check button only when no feedback yet */}
                {!practiceFeedback && (
                  <>
                    <button 
                      className="btn success" 
                      onClick={checkPractice}
                      disabled={isCheckingPractice || !practiceAnswer.trim()}
                      style={{ opacity: isCheckingPractice ? 0.6 : 1, cursor: isCheckingPractice ? "not-allowed" : "pointer" }}
                    >
                      ✓ Check
                    </button>
                    <button className="btn" onClick={nextPractice}>
                      → Skip
                    </button>
                  </>
                )}
                {/* Show Next button after feedback appears */}
                {practiceFeedback && (
                  <button
                    className="btn success"
                    onClick={nextPractice}
                    style={{ width: "100%" }}
                  >
                    Next Question →
                  </button>
                )}
              </div>
              {practiceFeedback && (
                <div style={{ marginTop: 16 }}>
                  {/* Simple UI for correct answers */}
                  {practiceFeedback.type === "ok" ? (
                    <div style={{
                      background: "rgba(34, 197, 94, 0.15)",
                      border: "2px solid var(--ok)",
                      borderRadius: "8px",
                      padding: "20px",
                      marginTop: "10px",
                      textAlign: "center"
                    }}>
                      <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>
                        ✓
                      </div>
                      <div style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--ok)" }}>
                        Perfect!
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Feedback text for close/bad answers */}
                      <p className={`feedback ${practiceFeedback.type}`}>
                        {practiceFeedback.type === "close" && "≈ "}
                        {practiceFeedback.type === "bad" && "✗ "}
                        {practiceFeedback.text}
                      </p>

                      {/* Show detailed error explanations */}
                      {practiceFeedback.details && practiceFeedback.details.length > 0 && (
                        <div style={{
                          background: "var(--accent-soft)",
                          border: "1px solid var(--accent)",
                          borderRadius: "8px",
                          padding: "12px",
                          marginTop: "10px"
                        }}>
                          <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "8px", color: "var(--text)" }}>
                            💡 Specific errors:
                          </div>
                          {practiceFeedback.details.map((detail, idx) => (
                            <div key={idx} style={{ marginBottom: "8px", fontSize: "0.9rem" }}>
                              <div style={{ display: "flex", gap: "12px", alignItems: "start" }}>
                                <span style={{ color: "var(--bad)", fontWeight: 600 }}>&quot;{detail.yourWord}&quot;</span>
                                <span style={{ color: "var(--muted)" }}>→</span>
                                <span style={{ color: "var(--ok)", fontWeight: 600 }}>&quot;{detail.correctWord}&quot;</span>
                              </div>
                              <div style={{ marginLeft: "4px", color: "var(--muted)", fontSize: "0.85rem", marginTop: "4px" }}>
                                {detail.explanation}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {practiceFeedback.diffTokens && practiceFeedback.diffTokens.length > 0 && (
                        <div style={{
                          background: "rgba(15, 23, 42, 0.08)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          padding: "10px",
                          marginTop: "10px"
                        }}>
                          <div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px", color: "var(--text)" }}>
                            Diff highlights
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {practiceFeedback.diffTokens.map((token, idx) => {
                              const color = token.status === "correct"
                                ? "var(--ok)"
                                : token.status === "missing"
                                  ? "var(--warn)"
                                  : token.status === "extra"
                                    ? "var(--bad)"
                                    : "var(--accent)";
                              const background = token.status === "correct"
                                ? "rgba(34, 197, 94, 0.12)"
                                : token.status === "missing"
                                  ? "rgba(217, 119, 6, 0.12)"
                                  : token.status === "extra"
                                    ? "rgba(239, 68, 68, 0.12)"
                                    : "rgba(59, 130, 246, 0.12)";

                              return (
                                <span
                                  key={`${token.token}-${idx}`}
                                  title={token.actual ? `Your: ${token.actual}` : undefined}
                                  style={{
                                    padding: "4px 8px",
                                    borderRadius: "999px",
                                    background,
                                    color,
                                    fontSize: "0.85rem",
                                    fontWeight: 600
                                  }}
                                >
                                  {token.token}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Show word order hints */}
                      {practiceFeedback.inversionNote && (
                        <div style={{
                          background: "rgba(217, 119, 6, 0.1)",
                          border: "1px solid var(--warn)",
                          borderRadius: "8px",
                          padding: "12px",
                          marginTop: "10px",
                          color: "var(--warn)",
                          fontSize: "0.9rem"
                        }}>
                          {practiceFeedback.inversionNote}
                        </div>
                      )}

                      {/* Show the correct sentence for wrong/close answers */}
                      {practiceItem && (
                        <div style={{
                          background: "rgba(34, 197, 94, 0.1)",
                          border: "1px solid var(--ok)",
                          borderRadius: "8px",
                          padding: "12px",
                          marginTop: "10px"
                        }}>
                          <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "6px", color: "var(--ok)" }}>
                            ✓ Correct answer:
                          </div>
                          <div style={{ fontSize: "1rem", fontWeight: 500, color: "var(--text)" }}>
                            {practiceItem.expected}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              <p className="muted">
                <strong>Hint:</strong> {practiceItem.hint}
              </p>
              <p className="muted">
                <strong>Grammar:</strong> {practiceItem.grammarNote}
              </p>

              

              <h3>📚 Category Filters</h3>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <button className="btn" onClick={() => setPracticeCategories([...allCategories])}>Select all</button>
                <button className="btn" onClick={() => setPracticeCategories([allCategories[0]])}>Deselect all</button>
                <div style={{ marginBottom: 18 }}>
                <select className="btn" value={direction} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDirection(e.target.value as Direction)}>
                  <option value="en-to-nl">English → Dutch</option>
                  <option value="nl-to-en">Dutch → English</option>
                </select>
              </div>
              </div>
              <div className="chips">
                {allCategories.map((category: PracticeCategory) => (
                  <button
                    key={category}
                    className={`chip ${practiceCategories.includes(category) ? "active" : ""}`}
                    onClick={() => toggleCategory(category)}
                  >
                    {categoryLabels[category]}
                  </button>
                ))}
              </div>
              {!practiceCategories.length && (
                <div style={{ marginTop: 12, color: "var(--muted)", fontSize: "0.95rem" }}>
                  No categories selected — choose at least one or use &quot;Select all&quot;.
                </div>
              )}
            </section>
          )}

          {tab === "drill" && (
            <section>
              {drillState === "setup" && (
                <>
                  <h3>Drill Setup</h3>
                  <div className="row" style={{ marginBottom: 10 }}>
                    <label>Category</label>
                    <select
                      value={drillCategory}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDrillCategory(e.target.value as PracticeCategory | "all")}
                    >
                      <option value="all">All categories</option>
                      {allCategories.map((category: PracticeCategory) => (
                        <option key={category} value={category}>
                          {categoryLabels[category]}
                        </option>
                      ))}
                    </select>
                    <label>Question count</label>
                    <input
                      type="number"
                      min={5}
                      max={100}
                      value={drillCount}
                      onChange={(e) => setDrillCount(Number(e.target.value))}
                    />
                    <button className="btn success" onClick={startDrill}>
                      Start Drill
                    </button>
                    <button className="btn" onClick={copyFiftyQuestions}>
                      Copy 50 Questions
                    </button>
                  </div>
                  {drillCopyStatus && (
                    <p className="muted" style={{ marginTop: 8 }}>
                      {drillCopyStatus}
                    </p>
                  )}
                  <h4>Recent Sessions</h4>
                  <div className="list">
                    {drillLog.slice(0, 8).map((entry) => (
                      <div className="list-item" key={entry.id}>
                        {new Date(entry.completedAt).toLocaleString()} - {entry.category} - {entry.score}/
                        {entry.questionCount} ({entry.percentage}%)
                      </div>
                    ))}
                    {!drillLog.length && <p className="muted">No drill sessions yet.</p>}
                  </div>
                </>
              )}

              {drillState === "running" && (
                <>
                  <h3>Drill in Progress</h3>
                  <div className="progress" style={{ marginBottom: 10 }}>
                    <span style={{ width: `${((drillIndex + 1) / drillQuestions.length) * 100}%` }} />
                  </div>
                  <p className="muted">
                    Question {drillIndex + 1} / {drillQuestions.length}
                  </p>
                  <div className="prompt">{currentDrillQuestion?.prompt ?? ""}</div>
                  <input
                    value={drillAnswer}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDrillAnswer(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter") submitDrillAnswer();
                    }}
                    placeholder="Type translation..."
                    style={{ width: "100%", marginBottom: 10 }}
                    disabled={isCheckingDrill}
                  />
                  <button
                    className="btn success"
                    onClick={submitDrillAnswer}
                    disabled={isCheckingDrill || !drillAnswer.trim()}
                    style={{ opacity: isCheckingDrill ? 0.6 : 1, cursor: isCheckingDrill ? "not-allowed" : "pointer" }}
                  >
                    Submit
                  </button>
                </>
              )}

              {drillState === "results" && (
                <>
                  <h3>Drill Results</h3>
                  <p>
                    Score: <strong>{drillResults.filter((r) => r.correct).length}</strong> / {drillResults.length} (
                    {Math.round((drillResults.filter((r) => r.correct).length / Math.max(1, drillResults.length)) * 100)}
                    %)
                  </p>
                  <div className="row" style={{ marginBottom: 10 }}>
                    <button className="btn" onClick={() => setDrillState("setup")}>
                      Back to Setup
                    </button>
                    <button className="btn success" onClick={startDrill}>
                      Retry Same Drill
                    </button>
                  </div>
                  <h4>Missed Questions</h4>
                  <div className="list">
                    {drillResults
                      .filter((r) => !r.correct)
                      .map((r) => (
                        <div className="list-item" key={r.item.id}>
                          <div>
                            <strong>Prompt:</strong> {r.item.prompt}
                          </div>
                          <div>
                            <strong>Your answer:</strong> {r.userAnswer || "(empty)"}
                          </div>
                          <div>
                            <strong>Expected:</strong> {r.item.expected}
                          </div>
                        </div>
                      ))}
                    {!drillResults.some((r) => !r.correct) && <p className="feedback ok">Perfect run.</p>}
                  </div>
                </>
              )}
            </section>
          )}

          {tab === "flashcards" && (
            <section>
              {flashcardFocusMode ? (
                <div
                  onClick={() => setFlashcardFocusMode(false)}
                  style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 80,
                    background: "radial-gradient(circle at top, rgba(15,23,42,0.97), rgba(2,6,23,0.995) 60%)",
                    padding: "clamp(12px, 3vw, 24px)",
                    display: "grid",
                    placeItems: "center"
                  }}
                >
                  {currentFlashcard ? (
                    <div
                      onClick={(event) => event.stopPropagation()}
                      style={{
                        width: "min(1020px, 100%)",
                        minHeight: "min(92dvh, 900px)",
                        borderRadius: 28,
                        padding: "clamp(18px, 4vw, 34px)",
                        background: "linear-gradient(180deg, rgba(15,23,42,0.985), rgba(30,41,59,0.96))",
                        border: "1px solid rgba(148,163,184,0.18)",
                        boxShadow: "0 28px 80px rgba(0,0,0,0.52)",
                        color: "#f8fafc",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: 22
                      }}
                    >
                      <div style={{ overflowY: "auto", paddingRight: 4 }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            fontSize: 12,
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            padding: "6px 10px",
                            borderRadius: 999,
                            background: "rgba(59, 130, 246, 0.18)",
                            color: "#bfdbfe",
                            marginBottom: 18
                          }}
                        >
                          {currentFlashcard.group === "modal_verbs" ? "Modal verb" : FLASHCARD_GROUP_LABEL[currentFlashcard.group as Exclude<DeckType, "all">] ?? currentFlashcard.group}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#93c5fd", marginBottom: 8 }}>
                          {getFlashcardSides(currentFlashcard, direction).frontLabel} side
                        </div>
                        <div style={{ fontSize: "clamp(2.25rem, 5vw, 4.6rem)", lineHeight: 1.05, fontWeight: 800, letterSpacing: "-0.03em", wordBreak: "break-word" }}>
                          {getFlashcardSides(currentFlashcard, direction).front}
                        </div>
                        <div style={{ marginTop: 14, color: "rgba(226, 232, 240, 0.72)", fontSize: 15, lineHeight: 1.5 }}>
                          {(() => {
                            const tags = currentFlashcard.extra?.tags ?? [] as string[];
                            if (currentFlashcard.type === "verb") {
                              const groupTag = tags.length ? tags[0] : undefined;
                              return groupTag ? groupTag : "Tap reveal to check the answer.";
                            }
                            return tags.length ? tags.join(" • ") : "Tap reveal to check the answer.";
                          })()}
                        </div>

                        {showFlashAnswer && (
                          <div style={{ marginTop: 20 }}>
                            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "#cbd5e1" }}>
                              {getFlashcardSides(currentFlashcard, direction).backLabel} side
                            </div>
                            <div style={{ fontSize: "clamp(1.55rem, 3vw, 2.4rem)", lineHeight: 1.45, fontWeight: 500, wordBreak: "break-word" }}>
                              {getFlashcardSides(currentFlashcard, direction).back}
                            </div>

                            {currentFlashcard.extra?.conjugations?.length ? (
                              <div style={{ marginTop: 18 }}>
                                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: "#bfdbfe" }}>Present tense</div>
                                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 10px", background: "rgba(15, 23, 42, 0.38)", borderRadius: 14, overflow: "hidden", padding: 8 }}>
                                  <tbody>
                                    {currentFlashcard.extra.conjugations.map((row) => (
                                      <tr key={`${row.left.label}-${row.right.label}`}>
                                        <td style={{ width: "50%", paddingRight: 6 }}>
                                          <div style={{ borderRadius: 12, padding: "10px 12px", background: "rgba(30,41,59,0.8)", border: "1px solid rgba(148,163,184,0.16)" }}>
                                            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#93c5fd", marginBottom: 4 }}>
                                              {row.left.label}
                                            </div>
                                            <div style={{ fontSize: 18, color: "#f8fafc", fontWeight: 800 }}>{row.left.form}</div>
                                          </div>
                                        </td>
                                        <td style={{ width: "50%", paddingLeft: 6 }}>
                                          <div style={{ borderRadius: 12, padding: "10px 12px", background: "rgba(30,41,59,0.8)", border: "1px solid rgba(148,163,184,0.16)" }}>
                                            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#93c5fd", marginBottom: 4 }}>
                                              {row.right.label}
                                            </div>
                                            <div style={{ fontSize: 18, color: "#f8fafc", fontWeight: 800 }}>{row.right.form}</div>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : null}

                            {currentFlashcard.extra?.note ? (
                              <div style={{ marginTop: 12, fontSize: 14, color: "#cbd5e1", lineHeight: 1.5 }}>{currentFlashcard.extra.note}</div>
                            ) : null}

                            <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
                              <span style={{ fontSize: 12, padding: "5px 10px", borderRadius: 999, background: "rgba(16,185,129,0.16)", color: "#a7f3d0" }}>
                                mastery {Math.round(currentFlashcard.mastery * 100)}%
                              </span>
                              {currentFlashcard.extra?.article ? (
                                <span style={{ fontSize: 12, padding: "5px 10px", borderRadius: 999, background: "rgba(251,191,36,0.16)", color: "#fde68a" }}>
                                  article {currentFlashcard.extra.article}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
                        {showFlashAnswer ? (
                          flashcardMode === "spaced" ? (
                            <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
                              <button
                                className="btn"
                                onClick={() => gradeCurrentCard("again")}
                                style={{ background: "linear-gradient(135deg, #ef4444, #f97316)", color: "white", border: "none" }}
                              >
                                Again
                              </button>
                              <button
                                className="btn"
                                onClick={() => gradeCurrentCard("hard")}
                                style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)", color: "#111827", border: "none" }}
                              >
                                Hard
                              </button>
                              <button
                                className="btn"
                                onClick={() => gradeCurrentCard("good")}
                                style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white", border: "none" }}
                              >
                                Good
                              </button>
                              <button
                                className="btn"
                                onClick={() => gradeCurrentCard("easy")}
                                style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)", color: "white", border: "none" }}
                              >
                                Easy
                              </button>
                            </div>
                          ) : (
                            <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
                              <button
                                className="btn"
                                onClick={moveToNextFlashcard}
                                style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "white", border: "none", fontWeight: 700 }}
                              >
                                Next Card
                              </button>
                              <button
                                className="btn"
                                onClick={() => setShowFlashAnswer(false)}
                                style={{ background: "rgba(255,255,255,0.08)", color: "#e2e8f0", border: "1px solid rgba(148,163,184,0.25)" }}
                              >
                                Hide answer
                              </button>
                            </div>
                          )
                        ) : (
                          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                            <button
                              className="btn"
                              onClick={() => setShowFlashAnswer(true)}
                              style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)", color: "white", border: "none", fontWeight: 800, fontSize: 15 }}
                            >
                              Reveal
                            </button>
                            <button
                              className="btn"
                              onClick={moveToNextFlashcard}
                              style={{ background: "rgba(255,255,255,0.08)", color: "#e2e8f0", border: "1px solid rgba(148,163,184,0.25)" }}
                            >
                              Skip
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={(event) => event.stopPropagation()}
                      style={{
                        width: "min(720px, 100%)",
                        borderRadius: 24,
                        padding: "clamp(20px, 5vw, 30px)",
                        background: "linear-gradient(180deg, rgba(15,23,42,0.98), rgba(30,41,59,0.95))",
                        border: "1px solid rgba(148,163,184,0.18)",
                        color: "#f8fafc",
                        textAlign: "center",
                        boxShadow: "0 24px 70px rgba(0,0,0,0.5)"
                      }}
                    >
                      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>No cards match the selected category.</div>
                      <button
                        className="btn"
                        onClick={() => setFlashcardFocusMode(false)}
                        style={{ background: "rgba(255,255,255,0.08)", color: "#e2e8f0", border: "1px solid rgba(148,163,184,0.25)" }}
                      >
                        Exit focus mode
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    padding: 22,
                    borderRadius: 18,
                    border: "1px solid var(--border)",
                    background: "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.95))",
                    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
                    marginBottom: 16
                  }}
                >
                  <h3 style={{ marginTop: 0, marginBottom: 6 }}>Flashcards</h3>
                  <p className="muted" style={{ marginTop: 0, marginBottom: 18, lineHeight: 1.5 }}>
                    Fast vocabulary review with category filters, infinite looping, and lightweight adaptive spacing.
                  </p>

                  <div className="row" style={{ marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="muted">Category</span>
                      <select value={deck} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDeck(e.target.value as DeckType)}>
                        {FLASHCARD_DECK_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option === "all" ? "All" : FLASHCARD_GROUP_LABEL[option]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="muted">Mode</span>
                      <select value={flashcardMode} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFlashcardMode(e.target.value as FlashcardMode)}>
                        <option value="infinite">Infinite repetition</option>
                        <option value="spaced">Spaced infinite repetition</option>
                      </select>
                    </label>
                    <button className="btn small" onClick={exportFlashcards} style={{ background: "rgba(59, 130, 246, 0.12)", borderColor: "rgba(59, 130, 246, 0.35)" }}>
                      Export JSON
                    </button>
                    <button
                      className="btn small"
                      onClick={() => setFlashcardFocusMode((value) => !value)}
                      style={{ background: flashcardFocusMode ? "rgba(14, 165, 233, 0.18)" : "rgba(255,255,255,0.06)", borderColor: flashcardFocusMode ? "rgba(14, 165, 233, 0.45)" : "rgba(148,163,184,0.25)", color: flashcardFocusMode ? "#e0f2fe" : "inherit" }}
                    >
                      {flashcardFocusMode ? "Exit focus mode" : "Focus mode"}
                    </button>
                    <button className="btn small" onClick={clearAllSessionData} style={{ background: "rgba(239, 68, 68, 0.12)", borderColor: "rgba(239, 68, 68, 0.35)" }}>
                      Clear session data
                    </button>
                  </div>

                  <div className="stats" style={{ marginBottom: 16 }}>
                    <div className="stat">Cards: {filteredFlashcards.length}</div>
                    <div className="stat">Loop size: {flashcardQueue.length}</div>
                    <div className="stat">Reviewed today: {reviewedToday}</div>
                    <div className="stat">Mode: {flashcardMode === "infinite" ? "Infinite" : "Spaced infinite"}</div>
                  </div>

                  {currentFlashcard ? (
                    <div
                      style={{
                        borderRadius: 20,
                        padding: 22,
                        background: "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.94))",
                        color: "#f8fafc",
                        border: "1px solid rgba(148,163,184,0.25)",
                        minHeight: 320,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: 20
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            fontSize: 12,
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            padding: "6px 10px",
                            borderRadius: 999,
                            background: "rgba(59, 130, 246, 0.18)",
                            color: "#bfdbfe",
                            marginBottom: 18
                          }}
                        >
                          {currentFlashcard.group === "modal_verbs" ? "Modal verb" : FLASHCARD_GROUP_LABEL[currentFlashcard.group as Exclude<DeckType, "all">] ?? currentFlashcard.group}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#93c5fd", marginBottom: 8 }}>
                          {getFlashcardSides(currentFlashcard, direction).frontLabel} side
                        </div>
                        <div style={{ fontSize: 34, lineHeight: 1.05, fontWeight: 800, letterSpacing: "-0.03em" }}>
                          {getFlashcardSides(currentFlashcard, direction).front}
                        </div>
                        <div style={{ marginTop: 14, color: "rgba(226, 232, 240, 0.72)", fontSize: 15 }}>
                          {(() => {
                            const tags = currentFlashcard.extra?.tags ?? [] as string[];
                            if (currentFlashcard.type === "verb") {
                              const groupTag = tags.length ? tags[0] : undefined;
                              return groupTag ? groupTag : "Tap reveal to check the answer.";
                            }
                            return tags.length ? tags.join(" • ") : "Tap reveal to check the answer.";
                          })()}
                        </div>

                        {showFlashAnswer && (
                          <div style={{ marginTop: 20 }}>
                            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "#cbd5e1" }}>
                              {getFlashcardSides(currentFlashcard, direction).backLabel} side
                            </div>
                            <div style={{ fontSize: 20, lineHeight: 1.5, fontWeight: 500 }}>
                              {getFlashcardSides(currentFlashcard, direction).back}
                            </div>

                            {currentFlashcard.extra?.conjugations?.length ? (
                              <div style={{ marginTop: 18 }}>
                                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: "#bfdbfe" }}>Present tense</div>
                                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 10px", background: "rgba(15, 23, 42, 0.38)", borderRadius: 14, overflow: "hidden", padding: 8 }}>
                                  <tbody>
                                    {currentFlashcard.extra.conjugations.map((row) => (
                                      <tr key={`${row.left.label}-${row.right.label}`}>
                                        <td style={{ width: "50%", paddingRight: 6 }}>
                                          <div style={{ borderRadius: 12, padding: "10px 12px", background: "rgba(30,41,59,0.8)", border: "1px solid rgba(148,163,184,0.16)" }}>
                                            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#93c5fd", marginBottom: 4 }}>
                                              {row.left.label}
                                            </div>
                                            <div style={{ fontSize: 18, color: "#f8fafc", fontWeight: 800 }}>{row.left.form}</div>
                                          </div>
                                        </td>
                                        <td style={{ width: "50%", paddingLeft: 6 }}>
                                          <div style={{ borderRadius: 12, padding: "10px 12px", background: "rgba(30,41,59,0.8)", border: "1px solid rgba(148,163,184,0.16)" }}>
                                            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#93c5fd", marginBottom: 4 }}>
                                              {row.right.label}
                                            </div>
                                            <div style={{ fontSize: 18, color: "#f8fafc", fontWeight: 800 }}>{row.right.form}</div>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : null}

                            {currentFlashcard.extra?.note ? (
                              <div style={{ marginTop: 12, fontSize: 14, color: "#cbd5e1" }}>{currentFlashcard.extra.note}</div>
                            ) : null}

                            <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
                              <span style={{ fontSize: 12, padding: "5px 10px", borderRadius: 999, background: "rgba(16,185,129,0.16)", color: "#a7f3d0" }}>
                                mastery {Math.round(currentFlashcard.mastery * 100)}%
                              </span>
                              {currentFlashcard.extra?.article ? (
                                <span style={{ fontSize: 12, padding: "5px 10px", borderRadius: 999, background: "rgba(251,191,36,0.16)", color: "#fde68a" }}>
                                  article {currentFlashcard.extra.article}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        {showFlashAnswer ? (
                          flashcardMode === "spaced" ? (
                            <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
                              <button
                                className="btn"
                                onClick={() => gradeCurrentCard("again")}
                                style={{ background: "linear-gradient(135deg, #ef4444, #f97316)", color: "white", border: "none" }}
                              >
                                Again
                              </button>
                              <button
                                className="btn"
                                onClick={() => gradeCurrentCard("hard")}
                                style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)", color: "#111827", border: "none" }}
                              >
                                Hard
                              </button>
                              <button
                                className="btn"
                                onClick={() => gradeCurrentCard("good")}
                                style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white", border: "none" }}
                              >
                                Good
                              </button>
                              <button
                                className="btn"
                                onClick={() => gradeCurrentCard("easy")}
                                style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)", color: "white", border: "none" }}
                              >
                                Easy
                              </button>
                            </div>
                          ) : (
                            <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
                              <button
                                className="btn"
                                onClick={moveToNextFlashcard}
                                style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "white", border: "none", fontWeight: 700 }}
                              >
                                Next Card
                              </button>
                              <button
                                className="btn"
                                onClick={() => setShowFlashAnswer(false)}
                                style={{ background: "rgba(255,255,255,0.08)", color: "#e2e8f0", border: "1px solid rgba(148,163,184,0.25)" }}
                              >
                                Hide answer
                              </button>
                            </div>
                          )
                        ) : (
                          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                            <button
                              className="btn"
                              onClick={() => setShowFlashAnswer(true)}
                              style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)", color: "white", border: "none", fontWeight: 800, fontSize: 15 }}
                            >
                              Reveal
                            </button>
                            <button
                              className="btn"
                              onClick={moveToNextFlashcard}
                              style={{ background: "rgba(255,255,255,0.08)", color: "#e2e8f0", border: "1px solid rgba(148,163,184,0.25)" }}
                            >
                              Skip
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="muted">No cards match the selected category.</p>
                  )}
                </div>
              )}
            </section>
          )}

          {tab === "log" && (
            <section>
              <h3>Session Log</h3>
              <div className="row" style={{ marginBottom: 10 }}>
                <button className="btn small" onClick={exportLogCsv}>
                  Export CSV
                </button>
                <button className="btn small danger" onClick={clearDrillLog}>
                  Clear Log
                </button>
              </div>
              <div className="list">
                {drillLog.map((entry) => (
                  <div className="list-item" key={entry.id}>
                    {new Date(entry.completedAt).toLocaleString()} - {entry.category} - {entry.score}/
                    {entry.questionCount} ({entry.percentage}%)
                  </div>
                ))}
                {!drillLog.length && <p className="muted">No sessions logged yet.</p>}
              </div>
            </section>
          )}
        </main>

        {showReference && (
          <aside className="card reference-card">
            <h3>Word reference</h3>
            <p className="muted" style={{ fontSize: 12, marginTop: -6 }}>
              One list: nouns, verbs, and other words from practice sentences. Search matches inflected verb forms too (e.g. ben → zijn).
            </p>
            <div className="row" style={{ marginBottom: 8, gap: 8, alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="muted">Type</span>
                <select
                  value={lexiconCategoryFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setLexiconCategoryFilter(e.target.value as LexiconCategory | "all")
                  }
                >
                  <option value="all">All</option>
                  {(Object.keys(LEXICON_CATEGORY_LABEL) as LexiconCategory[]).map((c) => (
                    <option key={c} value={c}>
                      {LEXICON_CATEGORY_LABEL[c]}
                    </option>
                  ))}
                </select>
              </label>

              <input
                value={referenceQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReferenceQuery(e.target.value)}
                placeholder="Search Dutch or English (e.g. eat, film, op)"
                style={{ flex: 1, minWidth: 120 }}
              />
            </div>

            <div className="list" style={{ maxHeight: 200, marginTop: 6 }}>
              {filteredLexicon.map((entry: LexiconEntry) => {
                const isSelected =
                  selectedLexiconEntry?.dutch === entry.dutch && selectedLexiconEntry?.category === entry.category;
                const label = LEXICON_CATEGORY_LABEL[entry.category];
                return (
                  <button
                    key={`${entry.category}:${entry.dutch}`}
                    className="list-item"
                    onClick={() => setSelectedLexiconEntry(entry)}
                    style={{
                      textAlign: "left",
                      borderLeft: isSelected ? "3px solid var(--accent, #3b82f6)" : undefined,
                      paddingLeft: isSelected ? 9 : 12
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                      <strong>{entry.dutch}</strong>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          color: "var(--muted, #64748b)",
                          background: "var(--surface-2, rgba(0,0,0,0.06))",
                          padding: "2px 6px",
                          borderRadius: 4
                        }}
                      >
                        {label}
                      </span>
                    </span>
                    <span className="muted" style={{ display: "block", fontSize: 13 }}>
                      {entry.english}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedLexiconEntry?.verb && (
              <div style={{ marginTop: 10 }}>
                <ConjugationTable verb={selectedLexiconEntry.verb} infinitive={selectedLexiconEntry.verb.infinitive} />
                <table style={{ marginTop: 12 }}>
                  <tbody>
                    <tr>
                      <td>Infinitive</td>
                      <td>{selectedLexiconEntry.verb.infinitive}</td>
                    </tr>
                    <tr>
                      <td>Imperative</td>
                      <td>{selectedLexiconEntry.verb.imperative}</td>
                    </tr>
                    <tr>
                      <td>Auxiliary</td>
                      <td>{selectedLexiconEntry.verb.auxiliary}</td>
                    </tr>
                    <tr>
                      <td>Present</td>
                      <td>
                        ik {selectedLexiconEntry.verb.present.ik}, jij {selectedLexiconEntry.verb.present.jij}, hij {" "}
                        {selectedLexiconEntry.verb.present.hij}, wij {selectedLexiconEntry.verb.present.wij}, jullie {" "}
                        {selectedLexiconEntry.verb.present.jullie}, zij {selectedLexiconEntry.verb.present.zij}
                      </td>
                    </tr>
                    <tr>
                      <td>Simple past</td>
                      <td>
                        sg: {selectedLexiconEntry.verb.past.singular}, pl: {selectedLexiconEntry.verb.past.plural}
                      </td>
                    </tr>
                    <tr>
                      <td>Past participle</td>
                      <td>{selectedLexiconEntry.verb.pastParticiple}</td>
                    </tr>
                    <tr>
                      <td>Perfect</td>
                      <td>{selectedLexiconEntry.verb.perfect}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {selectedLexiconEntry?.noun && !selectedLexiconEntry.verb && (
              <table style={{ marginTop: 12 }}>
                <tbody>
                  <tr>
                    <td>Article</td>
                    <td>{selectedLexiconEntry.noun.article}</td>
                  </tr>
                  <tr>
                    <td>Gender</td>
                    <td>{selectedLexiconEntry.noun.gender}</td>
                  </tr>
                  <tr>
                    <td>Singular / plural</td>
                    <td>
                      {selectedLexiconEntry.noun.dutch} / {selectedLexiconEntry.noun.plural}
                    </td>
                  </tr>
                  <tr>
                    <td>English</td>
                    <td>{selectedLexiconEntry.noun.english}</td>
                  </tr>
                  <tr>
                    <td>This / that</td>
                    <td>
                      {selectedLexiconEntry.noun.thisForm} / {selectedLexiconEntry.noun.thatForm}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}

            {selectedLexiconEntry && !selectedLexiconEntry.verb && !selectedLexiconEntry.noun && (
              <div style={{ marginTop: 12 }}>
                <p>
                  <strong>{selectedLexiconEntry.dutch}</strong>{" "}
                  <span className="muted">({LEXICON_CATEGORY_LABEL[selectedLexiconEntry.category]})</span>
                </p>
                <p className="muted">{selectedLexiconEntry.english}</p>
                {selectedLexiconEntry.note && <p className="muted">{selectedLexiconEntry.note}</p>}
              </div>
            )}
          </aside>
        )}
      </div>

      <button 
        className="btn floating-toggle-theme" 
        onClick={toggleTheme} 
        title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
        aria-label="Toggle theme"
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>
      <button 
        className="btn floating-toggle" 
        onClick={() => setShowReference((prev: boolean) => !prev)}
        title={showReference ? "Hide reference" : "Show reference"}
        aria-label="Toggle reference panel"
      >
        {showReference ? "📖 Hide" : "📖 Show"}
      </button>
    </>
  );
}

