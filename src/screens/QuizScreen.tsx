import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;
const BG = require('../assets/background.png');
const IC_BACK = require('../assets/ic_back.png');

const INTRO_IMG = require('../assets/onboard1.png');

const GAME_OVER_IMG = require('../assets/game_over.png');
const VICTORY_IMG = require('../assets/win.png'); 
const STORAGE_QUIZ_STATE = 'hm_quiz_state_v1';
type Story = { id: string; title: string; body: string };

type Question = {
  id: string;
  prompt: string;
  options: string[]; 
  correctIndex: number; 
};

type Mode = 'intro' | 'quiz' | 'gameover' | 'victory';

type PersistedQuizState = {
  round: number; 
  qIndex: number; 
  wrongCount: number; 
  inProgress: boolean; 
  questionIds: string[]; 
};

const TOTAL_ROUNDS = 10;
const QUESTIONS_PER_ROUND = 10;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffleWithSeed<T>(arr: T[], seed: number) {
  const rnd = mulberry32(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function pickDifferentTitles(allTitles: string[], correctTitle: string, seed: number) {
  const others = allTitles.filter((t) => t !== correctTitle);
  const shuffled = shuffleWithSeed(others, seed);
  return shuffled.slice(0, 2);
}

export default function QuizScreen({ navigation }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isSmallH = height < 740;
  const isTinyH = height < 680;
  const isNarrow = width < 360;

  const topPad = Math.max(10, insets.top + 8);
  const bottomPad = Math.max(12, insets.bottom + 10);
  const stories = useMemo<Story[]>(
    () => [
      {
        id: '1',
        title: 'The Place Where Nothing Happens',
        body:
          `There is a place underground where nothing ever seems to happen...` +
          `\n\nI stay.\n\n` +
          `Staying teaches you how quickly the mind tries to escape boredom...`,
      },
      {
        id: '2',
        title: 'Why I Appear So Briefly',
        body:
          `People often complain that I disappear too fast...` +
          `\n\nQuick appearance forces honesty...` +
          `\n\nI leave quickly because staying would soften that truth.`,
      },
      {
        id: '3',
        title: 'The Day My Hands Moved First',
        body:
          `There was a day when my hands moved before I realized what was happening...` +
          `\n\nSince then, I stopped trying to be fast. I started trying to be present...`,
      },
      {
        id: '7',
        title: 'The Moment I Stopped Looking Ahead',
        body:
          `For a long time, I was always slightly ahead of myself...` +
          `\n\nOne day, I decided to stop expecting anything...`,
      },
      {
        id: '8',
        title: 'The Comfort of Repetition',
        body:
          `Many people fear repetition...` +
          `\n\nRepetition is honest...` +
          `\n\nNot loud. Not impressive. Just precise.`,
      },
      {
        id: '9',
        title: 'When Silence Answers',
        body:
          `Silence is not the absence of an answer...` +
          `\n\nSilence never lies. It only reflects what you bring into it.`,
      },
      {
        id: '10',
        title: 'The Weight I Didn’t Notice',
        body:
          `For years, I carried tension without realizing it...` +
          `\n\nTrue readiness is light...`,
      },
      {
        id: '11',
        title: 'The False Comfort of Control',
        body:
          `Control feels safe...` +
          `\n\nLetting go of control did not mean becoming careless...`,
      },
      {
        id: '12',
        title: 'The Quiet Confidence',
        body:
          `There is a kind of confidence that makes noise...` +
          `\n\nQuiet confidence does not need confirmation. It only needs presence.`,
      },
      {
        id: '13',
        title: 'The Moment After Success',
        body:
          `Success has a strange echo...` +
          `\n\nThe next moment does not care what you did before...`,
      },
      {
        id: '14',
        title: 'Learning to End a Session',
        body:
          `Stopping is a skill most people never practice...` +
          `\n\nEnding a session early is not failure. It is preservation.`,
      },
      {
        id: '15',
        title: 'Still Digging',
        body:
          `People often ask how long I plan to keep digging...` +
          `\n\nI am still here... ready for the moment that will arrive without warning.`,
      },
    ],
    []
  );

  const allTitles = useMemo(() => stories.map((s) => s.title), [stories]);
  const questionPool = useMemo<Question[]>(() => {
    const pool: Question[] = [];

    for (const s of stories) {
      const clean = s.body.replace(/\s+/g, ' ').trim();
      const cuts = [
        clean.slice(0, 90),
        clean.slice(90, 180),
        clean.slice(180, 270),
      ].filter((x) => x.length > 30);

      cuts.forEach((excerpt, idx) => {
        const seed = Number(s.id.replace(/\D/g, '') || '1') * 100 + idx * 7;
        const wrong = pickDifferentTitles(allTitles, s.title, seed);
        const optionsRaw = [s.title, ...wrong];
        const options = shuffleWithSeed(optionsRaw, seed + 33);
        const correctIndex = options.indexOf(s.title);

        pool.push({
          id: `${s.id}_${idx}`,
          prompt: `Which story matches this excerpt?\n“${excerpt}…”`,
          options,
          correctIndex,
        });
      });
    }

    return pool;
  }, [stories, allTitles]);

  const [mode, setMode] = useState<Mode>('intro');

  const [round, setRound] = useState(1); 
  const [qIndex, setQIndex] = useState(0); 
  const [wrongCount, setWrongCount] = useState(0);

  const [questionIds, setQuestionIds] = useState<string[]>([]); 

  const [locked, setLocked] = useState(false);
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);

  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearAutoTimer = () => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    autoTimerRef.current = null;
  };

  const sidePad = isNarrow ? 14 : 18;

  const introImgW = Math.min(width * 0.9, 420);
  const introImgH = Math.min(height * (isTinyH ? 0.46 : 0.5), 520);

  const titleSize = isTinyH ? 24 : 26;
  const promptSize = isTinyH ? 15 : 16;
  const optionSize = isTinyH ? 14 : 15;

  const btnH = isTinyH ? 50 : 54;
  const btnW = Math.min(width * 0.76, 340);

  const optionH = isTinyH ? 56 : 62;
  const saveState = async (next?: Partial<PersistedQuizState>) => {
    const state: PersistedQuizState = {
      round,
      qIndex,
      wrongCount,
      inProgress: mode !== 'intro', 
      questionIds,
      ...(next || {}),
    };
    try {
      await AsyncStorage.setItem(STORAGE_QUIZ_STATE, JSON.stringify(state));
    } catch {}
  };

  const loadState = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_QUIZ_STATE);
      if (!raw) return;

      const parsed = JSON.parse(raw) as PersistedQuizState;
      if (!parsed || typeof parsed !== 'object') return;

      const r = clamp(Number(parsed.round || 1), 1, TOTAL_ROUNDS);
      const qi = clamp(Number(parsed.qIndex || 0), 0, QUESTIONS_PER_ROUND - 1);
      const wc = Math.max(0, Number(parsed.wrongCount || 0));
      const ids = Array.isArray(parsed.questionIds) ? parsed.questionIds.filter(Boolean) : [];

      setRound(r);
      setQIndex(qi);
      setWrongCount(wc);
      setQuestionIds(ids.length === QUESTIONS_PER_ROUND ? ids : []);
      setMode('intro');
    } catch {}
  };
  useEffect(() => {
    loadState();
    return () => clearAutoTimer();
  }, []);

  useEffect(() => {
    saveState();
  }, [round, qIndex, wrongCount, mode, questionIds]);

  const buildRoundQuestionIds = (r: number) => {
    const seed = 1000 + r * 77;
    const shuffled = shuffleWithSeed(questionPool, seed);
    const ten = shuffled.slice(0, QUESTIONS_PER_ROUND).map((q) => q.id);
    return ten.length === QUESTIONS_PER_ROUND ? ten : [];
  };

  const currentQuestion = useMemo(() => {
    if (questionIds.length !== QUESTIONS_PER_ROUND) return null;
    const id = questionIds[qIndex];
    return questionPool.find((q) => q.id === id) || null;
  }, [questionIds, qIndex, questionPool]);
  const goHome = () => {
    clearAutoTimer();
    navigation.replace('Home');
  };

  const onBack = () => {
    if (mode === 'intro') {
      goHome();
      return;
    }
    clearAutoTimer();
    setLocked(false);
    setPickedIndex(null);
    setMode('intro');
  };

  const startOrResume = () => {
    clearAutoTimer();
    setQuestionIds((prev) => {
      if (prev.length === QUESTIONS_PER_ROUND) return prev;
      return buildRoundQuestionIds(round);
    });

    setLocked(false);
    setPickedIndex(null);
    setMode('quiz');
  };

  const restartRound = () => {
    clearAutoTimer();
    setWrongCount(0);
    setQIndex(0);
    setQuestionIds(buildRoundQuestionIds(round));
    setLocked(false);
    setPickedIndex(null);
    setMode('quiz');
  };

  const nextRound = () => {
    clearAutoTimer();
    const nr = clamp(round + 1, 1, TOTAL_ROUNDS);
    setRound(nr);
    setWrongCount(0);
    setQIndex(0);
    setQuestionIds(buildRoundQuestionIds(nr));
    setLocked(false);
    setPickedIndex(null);
    setMode('quiz');
  };

  const answer = (idx: number) => {
    if (!currentQuestion) return;
    if (locked) return;

    setLocked(true);
    setPickedIndex(idx);

    const isCorrect = idx === currentQuestion.correctIndex;
    if (!isCorrect) setWrongCount((v) => v + 1);

    clearAutoTimer();
    autoTimerRef.current = setTimeout(() => {
      const next = qIndex + 1;

      setLocked(false);
      setPickedIndex(null);

      if (next < QUESTIONS_PER_ROUND) {
        setQIndex(next);
        return;
      }
      if (wrongCount + (isCorrect ? 0 : 1) > 0) {
        setMode('gameover');
      } else {
        setMode('victory');
      }
    }, 650);
  };
  const renderOption = (text: string, idx: number) => {
    const q = currentQuestion;
    const isPicked = pickedIndex === idx;
    const isCorrect = q ? idx === q.correctIndex : false;
    const showResult = locked && pickedIndex !== null;

    let bg = 'rgba(35, 46, 120, 0.55)';
    let border = 'rgba(255,255,255,0.92)';

    if (showResult) {
      if (isCorrect) {
        bg = 'rgba(42, 190, 90, 0.95)'; 
        border = 'rgba(20,90,40,0.9)';
      } else if (isPicked) {
        bg = 'rgba(230, 70, 70, 0.95)'; 
        border = 'rgba(120,30,30,0.9)';
      } else {
        bg = 'rgba(35, 46, 120, 0.45)';
        border = 'rgba(255,255,255,0.65)';
      }
    }

    return (
      <Pressable
        key={idx}
        onPress={() => answer(idx)}
        disabled={locked}
        style={[
          styles.option,
          { height: optionH, backgroundColor: bg, borderColor: border },
        ]}
      >
        <Text style={[styles.optionText, { fontSize: optionSize }]} numberOfLines={2}>
          {text}
        </Text>
      </Pressable>
    );
  };
  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={[styles.header, { paddingTop: topPad, paddingHorizontal: sidePad }]}>
          <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
            <Image source={IC_BACK} style={styles.backIcon} resizeMode="contain" />
          </Pressable>

          <Text style={[styles.headerTitle, { fontSize: titleSize }]}>
            Quiz
          </Text>

          <View style={{ width: 44 }} />
        </View>
        {mode === 'intro' && (
          <View style={[styles.introWrap, { paddingHorizontal: sidePad, paddingBottom: bottomPad }]}>
            <Image source={INTRO_IMG} style={{ width: introImgW, height: introImgH }} resizeMode="contain" />

            <Pressable style={[styles.startBtn, { width: btnW, height: btnH }]} onPress={startOrResume}>
              <Text style={styles.startText}>START</Text>
            </Pressable>

            <Text style={styles.smallInfo}>
              Level {round} / {TOTAL_ROUNDS} • Question {qIndex + 1} / {QUESTIONS_PER_ROUND}
            </Text>

            <Text style={styles.smallInfo2}>
              Your progress is saved automatically.
            </Text>
          </View>
        )}

        {mode === 'quiz' && currentQuestion && (
          <View style={[styles.quizWrap, { paddingHorizontal: sidePad, paddingBottom: bottomPad }]}>
            <Text style={styles.progress}>
              Level {round} / {TOTAL_ROUNDS} • {qIndex + 1} / {QUESTIONS_PER_ROUND}
            </Text>

            <View style={styles.promptCard}>
              <Text style={[styles.promptText, { fontSize: promptSize }]}>{currentQuestion.prompt}</Text>
            </View>

            <View style={{ height: 14 }} />

            <View style={styles.optionsWrap}>
              {currentQuestion.options.map((t, i) => renderOption(t, i))}
            </View>
          </View>
        )}

        {mode === 'gameover' && (
          <View style={[styles.centerWrap, { paddingHorizontal: sidePad, paddingBottom: bottomPad }]}>
            <Image source={GAME_OVER_IMG} style={{ width: Math.min(width * 0.82, 360), height: 150 }} resizeMode="contain" />

            <Text style={styles.resultTitle}>Game Over</Text>
            <Text style={styles.resultSub}>
              Level {round} • Mistakes: {wrongCount}
            </Text>

            <Pressable style={[styles.startBtn, { width: btnW, height: btnH }]} onPress={restartRound}>
              <Text style={styles.startText}>TRY AGAIN</Text>
            </Pressable>

            <Pressable
              style={[styles.altBtn, { width: btnW, height: btnH }]}
              onPress={goHome}
            >
              <Text style={styles.altText}>HOME</Text>
            </Pressable>
          </View>
        )}

        {mode === 'victory' && (
          <View style={[styles.centerWrap, { paddingHorizontal: sidePad, paddingBottom: bottomPad }]}>
            <Image source={VICTORY_IMG} style={{ width: Math.min(width * 0.82, 360), height: 190 }} resizeMode="contain" />

            <Text style={styles.resultTitle}>Victory!</Text>
            <Text style={styles.resultSub}>Level {round} completed</Text>

            <Pressable
              style={[styles.startBtn, { width: btnW, height: btnH }]}
              onPress={round >= TOTAL_ROUNDS ? goHome : nextRound}
            >
              <Text style={styles.startText}>
                {round >= TOTAL_ROUNDS ? 'FINISH' : 'NEXT LEVEL'}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.altBtn, { width: btnW, height: btnH }]}
              onPress={goHome}
            >
              <Text style={styles.altText}>HOME</Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backIcon: { width: 26, height: 26 },

  headerTitle: {
    color: '#fff',
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  introWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  startBtn: {
    borderRadius: 999,
    backgroundColor: '#F6C200',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3A1D00',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    marginTop: 12,
  },
  startText: { color: '#3A1D00', fontSize: 16, fontWeight: '900' },

  smallInfo: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.92)',
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  smallInfo2: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '800',
  },
  quizWrap: {
    flex: 1,
    paddingTop: 14,
  },

  progress: {
    color: 'rgba(255,255,255,0.92)',
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  promptCard: {
    borderRadius: 18,
    backgroundColor: '#F6C200',
    borderWidth: 2,
    borderColor: '#3A1D00',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  promptText: {
    color: '#2A1400',
    fontWeight: '900',
    lineHeight: 22,
  },

  optionsWrap: {
    gap: 12,
  },

  option: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 2,
    justifyContent: 'center',
  },
  optionText: {
    color: '#fff',
    fontWeight: '900',
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  resultTitle: {
    marginTop: 10,
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  resultSub: {
    marginTop: 6,
    marginBottom: 10,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '900',
    textAlign: 'center',
  },

  altBtn: {
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    marginTop: 10,
  },
  altText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
});
