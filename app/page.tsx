"use client";

import { useEffect, useMemo, useState } from "react";
import flashcardsData from "../flashcards.json";
import quizData from "../quiz.json";

type Flashcard = {
  id: number;
  category: string;
  question: string;
  answer: string;
  difficulty: string;
};

type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: string;
};

type View =
  | "menu"
  | "selectFlashcards"
  | "flashcards"
  | "completedFlashcards"
  | "selectQuiz"
  | "quiz"
  | "completedQuiz"
  | "chatbot";

const shuffle = <T,>(items: T[]) => {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const getCategories = (data: (Flashcard | QuizQuestion)[]): string[] => {
  const unique = new Set(data.map((item) => item.category));
  return Array.from(unique).sort();
};

const getDifficulties = (data: (Flashcard | QuizQuestion)[]): string[] => {
  const unique = new Set(data.map((item) => item.difficulty));
  return Array.from(unique).sort();
};

const filterByCategory = <T extends { category: string; difficulty: string }>(
  items: T[],
  category: string | null,
  difficulty: string | null,
): T[] => {
  return items.filter(
    (item) =>
      (category === null || item.category === category) &&
      (difficulty === null || item.difficulty === difficulty),
  );
};

const motivationalMessages = [
  "Eres increíble, sigue así ❤️",
  "Cada respuesta te acerca más a tu meta 💪",
  "Estoy orgulloso de lo lejos que has llegado 🌟",
  "Tu dedicación es inspiradora ✨",
  "Vas avanzando paso a paso, ¡genial! 🚀",
  "No te rindas, eres capaz de todo 💖",
  "Cada pregunta es una oportunidad de aprender 📚",
  "Tu esfuerzo vale la pena, sigue adelante ❤️",
  "Estoy aquí apoyándote en cada paso 💕",
  "Eres fuerte y determinada, ¡lo lograrás! 🌈",
  "Cada respuesta correcta es una victoria 🎉",
  "Tu perseverancia me impresiona 💫",
  "Sigue brillando, mi amor 🌟",
  "Cada desafío te hace más fuerte 💪",
  "Estoy emocionado por tus logros futuros 🚀",
];

export default function Home() {
  const cards = (flashcardsData.flashcards as Flashcard[]) ?? [];
  const quizQuestions = (quizData.questions as QuizQuestion[]) ?? [];
  const [view, setView] = useState<View>("menu");

  // Flashcards state
  const [fcCategory, setFcCategory] = useState<string | null>(null);
  const [fcDifficulty, setFcDifficulty] = useState<string | null>(null);
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Quiz state
  const [quizCategory, setQuizCategory] = useState<string | null>(null);
  const [quizDifficulty, setQuizDifficulty] = useState<string | null>(null);
  const [quizDeck, setQuizDeck] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizAnswerState, setQuizAnswerState] = useState<
    "unanswered" | "correct" | "incorrect"
  >("unanswered");
  const [quizScore, setQuizScore] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  const currentCard = deck[index] ?? null;
  const currentQuestion = quizDeck[quizIndex] ?? null;

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const progressLabel = useMemo(
    () => `${index + 1} / ${deck.length}`,
    [index, deck.length],
  );
  const quizProgressLabel = useMemo(
    () => `${quizIndex + 1} / ${quizDeck.length}`,
    [quizIndex, quizDeck.length],
  );

  const startFlashcards = (cat: string | null, diff: string | null) => {
    setFcCategory(cat);
    setFcDifficulty(diff);
    const filtered = filterByCategory(cards, cat, diff);
    const shuffled = shuffle(filtered);
    setDeck(shuffled);
    setIndex(0);
    setShowAnswer(false);
    setView("flashcards");
  };

  const startQuiz = (cat: string | null, diff: string | null) => {
    setQuizCategory(cat);
    setQuizDifficulty(diff);
    const filtered = filterByCategory(quizQuestions, cat, diff);
    const shuffled = shuffle(filtered).slice(0, 10);
    setQuizDeck(shuffled);
    setQuizIndex(0);
    setSelectedOption(null);
    setQuizAnswerState("unanswered");
    setQuizScore(0);
    setView("quiz");
  };

  const handleNext = () => {
    setShowAnswer(false);
    if (index + 1 >= deck.length) {
      setView("completedFlashcards");
    } else {
      setIndex((prev) => prev + 1);
      setMessageIndex((prev) => prev + 1);
    }
  };

  const handleSelectOption = (optionValue: number) => {
    if (quizAnswerState !== "unanswered") return;
    setSelectedOption(optionValue);
  };

  const handleSubmitAnswer = () => {
    if (currentQuestion == null || selectedOption == null) return;
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    setQuizAnswerState(isCorrect ? "correct" : "incorrect");
    if (isCorrect) setQuizScore((prev) => prev + 1);
  };

  const handleNextQuiz = () => {
    if (quizIndex + 1 >= quizDeck.length) {
      setView("completedQuiz");
      return;
    }
    setQuizIndex((prev) => prev + 1);
    setSelectedOption(null);
    setQuizAnswerState("unanswered");
    setMessageIndex((prev) => prev + 1);
  };

  const handleRestartFlashcards = () => {
    setView("selectFlashcards");
    setMessageIndex(0);
  };

  const handleRestartQuiz = () => {
    setView("selectQuiz");
    setMessageIndex(0);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#fff2e5] via-[#ffe1c6] to-[#ffd8b0] px-3 py-4 sm:px-5 sm:py-8 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:gap-8">
        <header className="rounded-2xl sm:rounded-4xl border border-white/70 bg-white/70 p-4 sm:p-8 shadow-[0_24px_80px_rgba(252,183,105,0.14)] backdrop-blur-xl">
          <div className="flex flex-col gap-2 sm:gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2 sm:space-y-3">
              <p className="inline-flex rounded-full bg-orange-100 px-3 py-0.5 text-xs sm:text-sm font-semibold text-orange-900 shadow-sm">
                Bienvenida de nuevo ❤️
              </p>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-950">
                ¿Qué vamos a estudiar hoy?
              </h1>
              <p className="max-w-2xl text-sm sm:text-base lg:text-lg leading-6 sm:leading-7 text-slate-700">
                Tómate tu tiempo. Aquí estoy para acompañarte en cada paso de tu
                tesis. Tú puedes. ❤️
              </p>
            </div>
            <div className="rounded-2xl sm:rounded-3xl bg-amber-50 px-3 py-2 sm:px-5 sm:py-4 text-xs sm:text-sm text-slate-700 shadow-inner shadow-amber-100/70">
              Hecho para apoyarte
            </div>
          </div>
        </header>

        {view === "menu" ? (
          <main className="grid gap-3 sm:gap-6 sm:grid-cols-3">
            {[
              {
                label: "Flashcards",
                description: "Repasa los conceptos clave sin presionarte.",
                action: () => setView("selectFlashcards"),
              },
              {
                label: "Quiz",
                description: "Pon a prueba lo que ya sabes.",
                action: () => setView("selectQuiz"),
              },
              {
                label: "Chatbot",
                description: "Resuelve todas tus dudas aquí.",
                action: () => setView("chatbot"),
              },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="group relative overflow-hidden rounded-[20px] sm:rounded-[28px] border border-white/80 bg-linear-to-br from-[#ffba86] to-[#ff8a5c] px-4 sm:px-6 py-6 sm:py-10 text-left text-white shadow-lg sm:shadow-xl shadow-orange-200/50 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.27),transparent_40%)] opacity-70" />
                <div className="relative space-y-2 sm:space-y-4">
                  <span className="inline-flex rounded-full bg-white/20 px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
                    {item.label}
                  </span>
                  <h2 className="text-lg sm:text-2xl font-semibold tracking-tight">
                    {item.label}
                  </h2>
                  <p className="max-w-sm text-xs sm:text-sm leading-5 sm:leading-6 text-white/90">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </main>
        ) : view === "selectFlashcards" ? (
          <main className="grid gap-3 sm:gap-6">
            <div className="rounded-2xl sm:rounded-4xl border border-white/80 bg-white/80 p-4 sm:p-8 shadow-[0_20px_60px_rgba(252,183,105,0.12)]">
              <button
                type="button"
                onClick={() => setView("menu")}
                className="mb-3 sm:mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-orange-900 transition hover:bg-orange-100"
              >
                ← Atrás
              </button>
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-950">
                ¿Por dónde empezamos? ❤️
              </h2>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base text-slate-700">
                Escoge qué quieres estudiar hoy.
              </p>
            </div>

            <div className="grid gap-2 sm:gap-4 sm:grid-cols-2">
              <div className="rounded-2xl sm:rounded-4xl border border-white/80 bg-white/90 p-3 sm:p-6 shadow-sm shadow-orange-100/70">
                <p className="font-semibold text-orange-900 mb-2 sm:mb-4 text-sm sm:text-base">
                  Categoría:
                </p>
                <div className="grid gap-1.5 sm:gap-2">
                  <button
                    onClick={() => startFlashcards(null, fcDifficulty)}
                    className="w-full rounded-2xl sm:rounded-3xl border border-orange-300 bg-orange-50 px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-orange-900 transition hover:bg-orange-100"
                  >
                    Todas
                  </button>
                  {getCategories(cards).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => startFlashcards(cat, fcDifficulty)}
                      className="w-full rounded-2xl sm:rounded-3xl border border-slate-200 bg-white px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-900 transition hover:border-orange-300 hover:bg-orange-50"
                    >
                      {cat.replace(/_/g, " ").toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl sm:rounded-4xl border border-white/80 bg-white/90 p-3 sm:p-6 shadow-sm shadow-orange-100/70">
                <p className="font-semibold text-orange-900 mb-2 sm:mb-4 text-sm sm:text-base">
                  Dificultad:
                </p>
                <div className="grid gap-1.5 sm:gap-2">
                  <button
                    onClick={() => startFlashcards(fcCategory, null)}
                    className="w-full rounded-2xl sm:rounded-3xl border border-orange-300 bg-orange-50 px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-orange-900 transition hover:bg-orange-100"
                  >
                    Todas
                  </button>
                  {getDifficulties(cards).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => startFlashcards(fcCategory, diff)}
                      className="w-full rounded-2xl sm:rounded-3xl border border-slate-200 bg-white px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-900 transition hover:border-orange-300 hover:bg-orange-50"
                    >
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </main>
        ) : view === "selectQuiz" ? (
          <main className="grid gap-3 sm:gap-6">
            <div className="rounded-2xl sm:rounded-4xl border border-white/80 bg-white/80 p-4 sm:p-8 shadow-[0_20px_60px_rgba(252,183,105,0.12)]">
              <button
                type="button"
                onClick={() => setView("menu")}
                className="mb-3 sm:mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-orange-900 transition hover:bg-orange-100"
              >
                ← Atrás
              </button>
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-950">
                Vamos con un reto 💪
              </h2>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base text-slate-700">
                Hasta 10 preguntas. Tú decides la dificultad.
              </p>
            </div>

            <div className="grid gap-2 sm:gap-4 sm:grid-cols-2">
              <div className="rounded-2xl sm:rounded-4xl border border-white/80 bg-white/90 p-3 sm:p-6 shadow-sm shadow-orange-100/70">
                <p className="font-semibold text-orange-900 mb-2 sm:mb-4 text-sm sm:text-base">
                  Categoría:
                </p>
                <div className="grid gap-1.5 sm:gap-2">
                  <button
                    onClick={() => startQuiz(null, quizDifficulty)}
                    className="w-full rounded-2xl sm:rounded-3xl border border-orange-300 bg-orange-50 px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-orange-900 transition hover:bg-orange-100"
                  >
                    Todas
                  </button>
                  {getCategories(quizQuestions).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => startQuiz(cat, quizDifficulty)}
                      className="w-full rounded-2xl sm:rounded-3xl border border-slate-200 bg-white px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-900 transition hover:border-orange-300 hover:bg-orange-50"
                    >
                      {cat.replace(/_/g, " ").toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl sm:rounded-4xl border border-white/80 bg-white/90 p-3 sm:p-6 shadow-sm shadow-orange-100/70">
                <p className="font-semibold text-orange-900 mb-2 sm:mb-4 text-sm sm:text-base">
                  Dificultad:
                </p>
                <div className="grid gap-1.5 sm:gap-2">
                  <button
                    onClick={() => startQuiz(quizCategory, null)}
                    className="w-full rounded-2xl sm:rounded-3xl border border-orange-300 bg-orange-50 px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-orange-900 transition hover:bg-orange-100"
                  >
                    Todas
                  </button>
                  {getDifficulties(quizQuestions).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => startQuiz(quizCategory, diff)}
                      className="w-full rounded-2xl sm:rounded-3xl border border-slate-200 bg-white px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-900 transition hover:border-orange-300 hover:bg-orange-50"
                    >
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </main>
        ) : view === "completedFlashcards" ? (
          <main className="rounded-2xl sm:rounded-4xl border border-white/80 bg-linear-to-br from-[#fff5e6] via-[#ffe7cc] to-[#ffd4a8] p-6 sm:p-12 shadow-[0_20px_80px_rgba(255,147,61,0.18)] text-center">
            <p className="text-5xl sm:text-6xl mb-3 sm:mb-4">🌟❤️✨</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-950 mb-3 sm:mb-4">
              ¡Hermoso trabajo!
            </h2>
            <p className="text-lg sm:text-xl text-slate-800 mb-2">
              Repasaste {deck.length} tarjetas
            </p>
            <p className="text-base sm:text-lg text-slate-700 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
              Mira cuánto has avanzado. Cada concepto que dominas te acerca más
              a tu tesis. Eres una persona dedicada y eso es algo que admiro
              mucho en ti. ❤️
            </p>
            <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row justify-center">
              <button
                type="button"
                onClick={handleRestartFlashcards}
                className="rounded-full bg-orange-900 px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-white transition hover:bg-orange-800"
              >
                Otra ronda
              </button>
              <button
                type="button"
                onClick={() => setView("menu")}
                className="rounded-full border border-orange-900 bg-white px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-orange-900 transition hover:bg-orange-50"
              >
                Menú
              </button>
            </div>
          </main>
        ) : view === "completedQuiz" ? (
          <main className="rounded-2xl sm:rounded-4xl border border-white/80 bg-linear-to-br from-[#fff7e9] via-[#ffe5cd] to-[#ffd0a5] p-6 sm:p-12 shadow-[0_20px_80px_rgba(255,155,63,0.18)] text-center">
            <p className="text-5xl sm:text-6xl mb-3 sm:mb-4">🎉❤️🏆</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-950 mb-3 sm:mb-4">
              ¡Qué bien te fue!
            </h2>
            <p className="text-4xl sm:text-5xl font-bold text-orange-900 mb-2">
              {quizScore}/{quizDeck.length}
            </p>
            <p className="text-base sm:text-lg text-slate-700 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
              {quizScore === quizDeck.length
                ? "¡Perfecto! Sabía que podías. Eres increíble y esto lo demuestra. Sigue así."
                : quizScore >= quizDeck.length * 0.8
                  ? "¡Muy bien! Lo estás manejando con seguridad. Vas muy en serio con tu tesis y se nota."
                  : quizScore >= quizDeck.length * 0.6
                    ? "¡Vamos bien! Cada vez entiendes más. No es una carrera, es un proceso, y vamos juntos en esto."
                    : "Está bien, es normal sentir que falta dominar más. Cada intento es práctica. Vamos otra vez."}
            </p>
            <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row justify-center">
              <button
                type="button"
                onClick={handleRestartQuiz}
                className="rounded-full bg-orange-900 px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-white transition hover:bg-orange-800"
              >
                Otro reto
              </button>
              <button
                type="button"
                onClick={() => setView("menu")}
                className="rounded-full border border-orange-900 bg-white px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-orange-900 transition hover:bg-orange-50"
              >
                Menú
              </button>
            </div>
          </main>
        ) : (
          <main className="rounded-2xl sm:rounded-4xl border border-white/80 bg-white/80 p-4 sm:p-10 text-slate-700 shadow-[0_20px_60px_rgba(255,167,78,0.16)]">
            <button
              type="button"
              onClick={() => setView("menu")}
              className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-orange-900 transition hover:bg-orange-100"
            >
              ← Atrás
            </button>
            <p className="text-base sm:text-lg font-semibold text-slate-950">
              Pronto aquí tendrás el chatbot 🚀
            </p>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base leading-6 sm:leading-7">
              Lo estoy armando para que puedas resolver tus dudas cuando las
              necesites. Todavía un poco de paciencia. ❤️
            </p>
          </main>
        )}

        {["flashcards", "quiz"].includes(view) && (
          <section className="grid gap-3 sm:gap-6">
            <div className="flex flex-col gap-2 sm:gap-4 rounded-2xl sm:rounded-4xl border border-white/80 bg-white/80 p-4 sm:p-6 shadow-[0_20px_60px_rgba(252,183,105,0.12)] sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1 sm:space-y-2">
                <button
                  type="button"
                  onClick={() => setView("menu")}
                  className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-orange-900 transition hover:bg-orange-100"
                >
                  ← Atrás
                </button>
                <p className="text-xs sm:text-sm text-slate-700">
                  {view === "flashcards" ? "Flashcards" : "Quiz"}
                </p>
                <h2 className="text-xl sm:text-3xl font-semibold text-slate-950">
                  {view === "flashcards"
                    ? "Repasa tranquila"
                    : "Vamos a ver qué sabes"}
                </h2>
              </div>
              {view === "flashcards" && (
                <div className="inline-flex flex-col items-end gap-1 sm:gap-2 text-right text-xs sm:text-sm text-slate-700">
                  <span className="rounded-full bg-amber-100 px-2 sm:px-3 py-0.5 sm:py-1 text-amber-900">
                    {progressLabel}
                  </span>
                </div>
              )}
              {view === "quiz" && (
                <div className="inline-flex flex-col items-end gap-1 sm:gap-2 text-right text-xs sm:text-sm text-slate-700">
                  <span className="rounded-full bg-amber-100 px-2 sm:px-3 py-0.5 sm:py-1 text-amber-900">
                    {quizProgressLabel}
                  </span>
                  <span className="rounded-full bg-white px-2 sm:px-3 py-0.5 sm:py-1 text-slate-700">
                    Aciertos {quizScore}
                  </span>
                </div>
              )}
            </div>

            {view === "flashcards" ? (
              <div className="rounded-2xl sm:rounded-[36px] border border-white/80 bg-linear-to-br from-[#fff5e6] via-[#ffe7cc] to-[#ffd4a8] p-4 sm:p-8 shadow-[0_20px_80px_rgba(255,147,61,0.18)]">
                <div className="flex flex-col gap-3 sm:gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2 sm:space-y-3">
                    <p className="text-xs sm:text-sm uppercase tracking-[0.24em] text-orange-800/90">
                      Tarjeta aleatoria
                    </p>
                    <div className="rounded-2xl sm:rounded-3xl bg-white/90 p-4 sm:p-6 shadow-sm shadow-orange-100/80">
                      <p className="text-xs sm:text-sm uppercase tracking-[0.22em] text-slate-500">
                        Categoría:{" "}
                        {currentCard?.category.replace(/_/g, " ") ?? "-"}
                      </p>
                      <h3 className="mt-2 sm:mt-3 text-lg sm:text-2xl font-semibold text-slate-950">
                        {currentCard?.question ??
                          "No hay tarjetas disponibles."}
                      </h3>
                    </div>
                  </div>
                  <div className="rounded-2xl sm:rounded-3xl bg-orange-50 p-3 sm:p-4 text-right text-xs sm:text-sm leading-5 sm:leading-6 text-slate-700 shadow-inner shadow-orange-100/80">
                    <p className="font-semibold text-orange-900">Dificultad</p>
                    <p>
                      {currentCard?.difficulty
                        ? currentCard.difficulty.charAt(0).toUpperCase() +
                          currentCard.difficulty.slice(1)
                        : "-"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 sm:mt-8 grid gap-3 sm:gap-4 sm:grid-cols-[1fr_260px]">
                  <div className="rounded-2xl sm:rounded-4xl border border-white/80 bg-slate-950/95 p-5 sm:p-8 text-white shadow-[0_24px_60px_rgba(35,27,17,0.22)] transition-transform duration-500 hover:-translate-y-1">
                    <div className="space-y-3 sm:space-y-4">
                      <p className="text-xs sm:text-sm uppercase tracking-[0.24em] text-amber-200">
                        Pregunta
                      </p>
                      <p className="text-base sm:text-lg leading-6 sm:leading-8 text-slate-100">
                        {currentCard?.question ??
                          "Vamos a recordar esto juntas. 🌟"}
                      </p>
                    </div>
                    <div className="mt-4 sm:mt-8 rounded-2xl sm:rounded-3xl bg-white/10 p-3 sm:p-5 text-xs sm:text-sm text-slate-200 shadow-inner shadow-black/10">
                      <p className="text-amber-100/90">
                        {showAnswer
                          ? currentCard?.answer
                          : "Tómate tu tiempo, después descubre la respuesta. 💭"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setShowAnswer((prev) => !prev)}
                      className="rounded-2xl sm:rounded-3xl border-2 border-slate-200 bg-slate-100 px-4 sm:px-5 py-3 sm:py-4 text-left text-slate-700 transition hover:border-orange-300 hover:bg-orange-50"
                    >
                      <p className="font-semibold text-xs sm:text-sm">
                        {showAnswer ? "Ocultar" : "Ver respuesta"}
                      </p>
                      <p className="mt-1 text-xs sm:text-sm text-slate-700">
                        Repasa bien cada una.
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="rounded-2xl sm:rounded-3xl bg-orange-900 px-4 sm:px-5 py-3 sm:py-4 text-left text-white shadow-lg shadow-orange-300/50 transition hover:bg-orange-800"
                    >
                      <p className="font-semibold text-xs sm:text-sm">
                        Siguiente
                      </p>
                      <p className="mt-1 text-xs sm:text-sm text-orange-100/90">
                        Vamos, sigue adelante 🚀
                      </p>
                    </button>
                    <div className="rounded-2xl sm:rounded-3xl bg-white/80 p-3 sm:p-4 text-xs sm:text-sm text-slate-700 shadow-sm">
                      <p className="font-semibold text-orange-900 text-xs sm:text-sm">
                        � Un mensaje para ti
                      </p>
                      <p className="mt-1 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 italic">
                        {
                          motivationalMessages[
                            messageIndex % motivationalMessages.length
                          ]
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : view === "quiz" ? (
              <div className="rounded-2xl sm:rounded-[36px] border border-white/80 bg-linear-to-br from-[#fff7e9] via-[#ffe5cd] to-[#ffd0a5] p-4 sm:p-8 shadow-[0_20px_80px_rgba(255,155,63,0.18]]">
                <div className="flex flex-col gap-3 sm:gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2 sm:space-y-3">
                    <p className="text-xs sm:text-sm uppercase tracking-[0.24em] text-orange-800/90">
                      Quiz de opción múltiple
                    </p>
                    <div className="rounded-2xl sm:rounded-3xl bg-white/90 p-4 sm:p-6 shadow-sm shadow-orange-100/80">
                      <p className="text-xs sm:text-sm uppercase tracking-[0.22em] text-slate-500">
                        Categoría:{" "}
                        {currentQuestion?.category.replace(/_/g, " ") ?? "-"}
                      </p>
                      <h3 className="mt-2 sm:mt-3 text-lg sm:text-2xl font-semibold text-slate-950">
                        {currentQuestion?.question ??
                          "Vamos con la siguiente pregunta 🌟"}
                      </h3>
                    </div>
                  </div>
                  <div className="rounded-2xl sm:rounded-3xl bg-orange-50 p-3 sm:p-4 text-right text-xs sm:text-sm leading-5 sm:leading-6 text-slate-700 shadow-inner shadow-orange-100/80">
                    <p className="font-semibold text-orange-900">Progreso</p>
                    <p>{quizProgressLabel}</p>
                  </div>
                </div>

                <div className="mt-4 sm:mt-8 grid gap-3 sm:gap-6">
                  <div className="rounded-2xl sm:rounded-4xl border border-white/80 bg-white/90 p-4 sm:p-6 shadow-sm shadow-orange-100/70">
                    <p className="text-xs sm:text-sm uppercase tracking-[0.22em] text-slate-500">
                      Elige la respuesta correcta
                    </p>
                    <div className="mt-3 sm:mt-4 grid gap-2 sm:gap-3">
                      {currentQuestion?.options.map((option, idx) => {
                        const optionValue = idx + 1;
                        const selected = selectedOption === optionValue;
                        const isCorrect =
                          quizAnswerState !== "unanswered" &&
                          optionValue === currentQuestion.correctAnswer;
                        const isWrong =
                          quizAnswerState === "incorrect" && selected;

                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => handleSelectOption(optionValue)}
                            disabled={quizAnswerState !== "unanswered"}
                            className={`w-full rounded-2xl sm:rounded-3xl border px-3 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm font-semibold transition duration-200 ${
                              selected
                                ? "border-orange-400 bg-orange-100 text-slate-900"
                                : "border-slate-200 bg-white text-slate-900"
                            } ${
                              isCorrect
                                ? "border-emerald-400 bg-emerald-100 text-emerald-900"
                                : isWrong
                                  ? "border-rose-400 bg-rose-100 text-rose-900"
                                  : "hover:border-orange-300 hover:bg-orange-50"
                            } ${quizAnswerState !== "unanswered" ? "cursor-default opacity-95" : "cursor-pointer"}`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-2 sm:gap-3 sm:grid-cols-[1fr_1fr]">
                    <button
                      type="button"
                      onClick={handleSubmitAnswer}
                      disabled={
                        selectedOption == null ||
                        quizAnswerState !== "unanswered"
                      }
                      className="rounded-2xl sm:rounded-3xl bg-orange-900 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-white transition hover:bg-orange-800 disabled:cursor-not-allowed disabled:bg-orange-300"
                    >
                      Comprobar
                    </button>
                    <button
                      type="button"
                      onClick={handleNextQuiz}
                      disabled={quizAnswerState === "unanswered"}
                      className="rounded-2xl sm:rounded-3xl bg-white px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-orange-900 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100"
                    >
                      {quizIndex + 1 >= quizDeck.length
                        ? "Resultado"
                        : "Siguiente"}
                    </button>
                  </div>

                  {quizAnswerState !== "unanswered" && (
                    <div
                      className={`rounded-2xl sm:rounded-3xl p-3 sm:p-5 text-xs sm:text-sm ${
                        quizAnswerState === "correct"
                          ? "bg-emerald-50 text-emerald-900"
                          : "bg-rose-50 text-rose-900"
                      } shadow-sm`}
                    >
                      <p className="font-semibold text-sm sm:text-base">
                        {quizAnswerState === "correct"
                          ? "¡Sí! Correcto 🎯"
                          : "No fue, pero la próxima va"}
                      </p>
                      <p className="mt-1 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6">
                        {quizAnswerState === "correct"
                          ? motivationalMessages[
                              messageIndex % motivationalMessages.length
                            ]
                          : `Era: ${currentQuestion?.options[currentQuestion.correctAnswer - 1]}. ${motivationalMessages[messageIndex % motivationalMessages.length]}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </section>
        )}
      </div>
    </div>
  );
}
