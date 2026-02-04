import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Pressable,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Gameplay'>;

const BG = require('../assets/background.png');
const TOP_LOGO = require('../assets/logo2.png');
const PILE = require('../assets/pile.png');
const MINER = require('../assets/miner.png');
const IC_BACK = require('../assets/ic_back.png');

const STORAGE_STATE = 'hm_game_state_v5';
const COLS = 3;
const TOTAL_CELLS = 12; 
const MAX_LEVELS = 30;
const LEVEL_SECONDS = 30;

type Phase = 'intro' | 'play' | 'paused' | 'lose' | 'win';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function needForLevel(level: number) {
  return 10 + (clamp(level, 1, MAX_LEVELS) - 1) * 5;
}

function getTimingForLevel(level: number) {
  const lv = clamp(level, 1, MAX_LEVELS);
  const showMs = clamp(1100 - (lv - 1) * 20, 480, 1100);
  const gapMs = clamp(1000 - (lv - 1) * 15, 400, 1000);
  const popIn = clamp(180 - (lv - 1) * 2, 100, 180);
  return { showMs, gapMs, popIn };
}

export default function GameplayScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [phase, setPhase] = useState<Phase>('intro');
  const [level, setLevel] = useState(1);
  const [caught, setCaught] = useState(0);
  const [timeLeft, setTimeLeft] = useState(LEVEL_SECONDS);
  const [totalCoins, setTotalCoins] = useState(0);
  const [visibleIndex, setVisibleIndex] = useState<number | null>(null);

  const phaseRef = useRef<Phase>('intro');
  const caughtRef = useRef(0);
  const tappedThisSpawn = useRef(false);
  const lastIndexRef = useRef<number | null>(null);

  const pop = useRef(new Animated.Value(0)).current;
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAllTimers = () => {
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    pop.stopAnimation();
  };

  const cellSize = useMemo(() => {
    const sidePad = 25; 
    const gap = 12;
    const available = width - sidePad * 2 - gap * (COLS - 1);
    return clamp(Math.floor(available / COLS), 90, 140);
  }, [width]);

  const minerSize = Math.round(cellSize * 0.75);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { caughtRef.current = caught; }, [caught]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_STATE);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.level) setLevel(parsed.level);
          if (parsed.totalCoins) setTotalCoins(parsed.totalCoins || 0);
        }
      } catch {}
    })();
    return () => clearAllTimers();
  }, []);

  const finishLevel = async () => {
    clearAllTimers();
    setVisibleIndex(null);
    const isWin = caughtRef.current >= needForLevel(level);
    
    const newTotal = totalCoins + caughtRef.current;
    setTotalCoins(newTotal);

    const nextLevel = isWin ? level + 1 : level;
    if (isWin) setLevel(nextLevel);

    try {
      await AsyncStorage.setItem(STORAGE_STATE, JSON.stringify({ 
        level: nextLevel, 
        totalCoins: newTotal 
      }));
    } catch {}

    setPhase(isWin ? 'win' : 'lose');
  };

  const runSpawnStep = () => {
    if (phaseRef.current !== 'play') return;
    const { showMs, gapMs, popIn } = getTimingForLevel(level);
    
    tappedThisSpawn.current = false;
    let idx = Math.floor(Math.random() * TOTAL_CELLS);
    while (idx === lastIndexRef.current) idx = Math.floor(Math.random() * TOTAL_CELLS);
    lastIndexRef.current = idx;

    setVisibleIndex(idx);
    pop.setValue(0);
    Animated.timing(pop, { toValue: 1, duration: popIn, useNativeDriver: true }).start();

    spawnTimerRef.current = setTimeout(() => {
      setVisibleIndex(null);
      spawnTimerRef.current = setTimeout(() => runSpawnStep(), gapMs);
    }, showMs);
  };

  const startLevelPlay = () => {
    clearAllTimers();
    setCaught(0);
    caughtRef.current = 0;
    setTimeLeft(LEVEL_SECONDS);
    phaseRef.current = 'play';
    setPhase('play');

    tickTimerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { finishLevel(); return 0; }
        return prev - 1;
      });
    }, 1000);
    runSpawnStep();
  };

  const onMinerTap = () => {
    if (phaseRef.current !== 'play' || tappedThisSpawn.current) return;
    
    tappedThisSpawn.current = true;
    setCaught(prev => {
      const next = prev + 1;
      caughtRef.current = next;
      return next;
    });

    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);

    Animated.sequence([
      Animated.timing(pop, { toValue: 1.3, duration: 70, useNativeDriver: true }),
      Animated.timing(pop, { toValue: 0, duration: 70, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => {
        setVisibleIndex(null);
        if (phaseRef.current === 'play') {
          spawnTimerRef.current = setTimeout(runSpawnStep, 100);
        }
      }, 0);
    });
  };

  const goHome = () => {
    clearAllTimers();
    navigation.replace('Home');
  };

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

        <View style={[styles.topBar, { paddingHorizontal: 20 }]}>
          <Pressable onPress={goHome} hitSlop={25} style={styles.backBtn}>
            <Image source={IC_BACK} style={styles.backIcon} resizeMode="contain" />
          </Pressable>

          <View style={styles.scoreContainer}>
             <Text style={styles.scoreLabel}>LEVEL SCORE</Text>
             <Text style={styles.scoreValue}>{caught}</Text>
          </View>

          <View style={styles.totalCoinsBadge}>
             <Text style={styles.totalCoinsLabel}>TOTAL</Text>
             <Text style={styles.totalCoinsValue}>💰 {totalCoins}</Text>
          </View>
        </View>

        {phase === 'intro' && (
          <View style={styles.center}>
            <Image source={TOP_LOGO} style={styles.logoIntro} resizeMode="contain" />
            <View style={styles.levelCard}>
              <Text style={styles.levelCardTitle}>LEVEL {level}</Text>
              <Text style={styles.levelCardSub}>Target: {needForLevel(level)} miners</Text>
            </View>
            <Pressable style={styles.startBtn} onPress={startLevelPlay}>
              <Text style={styles.startText}>START</Text>
            </Pressable>
          </View>
        )}

        {phase === 'play' && (
          <>
            <View style={styles.hud}>
              <View style={styles.timerBadge}>
                <Text style={styles.timerText}>TIME: {timeLeft}s</Text>
              </View>
            </View>

            <View style={styles.grid}>
              {Array.from({ length: TOTAL_CELLS }).map((_, i) => (
                <View key={i} style={[styles.cell, { width: cellSize, height: cellSize }]}>
                  <Image source={PILE} style={styles.pile} resizeMode="contain" />
                  {i === visibleIndex && (
                    <Pressable 
                      onPressIn={onMinerTap} 
                      hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }} 
                      style={styles.minerTouch}
                    >
                      <Animated.Image
                        source={MINER}
                        style={[styles.miner, { 
                          width: minerSize, 
                          height: minerSize,
                          opacity: pop,
                          transform: [{ scale: pop }]
                        }]}
                        resizeMode="contain"
                      />
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        {(phase === 'win' || phase === 'lose') && (
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>{phase === 'win' ? 'SUCCESS!' : 'FAILED'}</Text>
              <Text style={styles.modalSub}>Caught: {caught}</Text>
              <Text style={styles.modalCoins}>Total Balance: {totalCoins}</Text>
              <Pressable style={styles.modalBtn} onPress={startLevelPlay}>
                <Text style={styles.modalBtnText}>{phase === 'win' ? 'NEXT LEVEL' : 'RETRY'}</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, { backgroundColor: '#444' }]} onPress={goHome}>
                <Text style={styles.modalBtnText}>HOME</Text>
              </Pressable>
            </View>
          </View>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  topBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    width: '100%',
    paddingVertical: 10,
    zIndex: 50
  },
  backBtn: { 
    width: 44, 
    height: 44, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  backIcon: { 
    width: 32, 
    height: 32 
  },
  
  scoreContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F6C200',
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: 'center',
    minWidth: 90,
  },
  scoreLabel: { color: '#fff', fontSize: 8, fontWeight: '900' },
  scoreValue: { color: '#F6C200', fontSize: 18, fontWeight: '900', marginTop: -2 },

  totalCoinsBadge: {
    backgroundColor: '#3A1D00',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F6C200',
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    minWidth: 80,
  },
  totalCoinsLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 8, fontWeight: '900' },
  totalCoinsValue: { color: '#fff', fontSize: 15, fontWeight: '900' },

  logoIntro: { width: 220, height: 90, marginBottom: 10 },
  levelCard: { alignItems: 'center', marginBottom: 30 },
  levelCardTitle: { color: '#F6C200', fontSize: 44, fontWeight: '900', textShadowColor: '#000', textShadowRadius: 4 },
  levelCardSub: { color: '#fff', fontSize: 18, fontWeight: '700' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  startBtn: { backgroundColor: '#F6C200', paddingHorizontal: 60, paddingVertical: 18, borderRadius: 35, borderWidth: 4, borderColor: '#3A1D00' },
  startText: { fontSize: 26, fontWeight: '900', color: '#3A1D00' },
  
  hud: { alignItems: 'center', marginTop: 10 },
  timerBadge: {
    backgroundColor: '#3A1D00',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F6C200'
  },
  timerText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  
  grid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center', gap: 10, paddingHorizontal: 15 },
  cell: { justifyContent: 'center', alignItems: 'center' },
  pile: { width: '100%', height: '100%', position: 'absolute' },
  minerTouch: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  miner: { marginBottom: 15 },
  
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  modal: { width: '85%', backgroundColor: '#1A1A1A', borderRadius: 25, padding: 30, alignItems: 'center', borderWidth: 2, borderColor: '#F6C200' },
  modalTitle: { color: '#F6C200', fontSize: 32, fontWeight: '900', marginBottom: 5 },
  modalSub: { color: '#fff', fontSize: 22, fontWeight: '700' },
  modalCoins: { color: 'rgba(255,255,255,0.5)', fontSize: 16, marginBottom: 25 },
  modalBtn: { backgroundColor: '#F6C200', width: '100%', padding: 15, borderRadius: 20, alignItems: 'center', marginBottom: 12 },
  modalBtnText: { color: '#3A1D00', fontWeight: '900', fontSize: 18 }
});