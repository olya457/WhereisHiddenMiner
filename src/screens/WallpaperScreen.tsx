import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Pressable,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Wallpaper'>;

const STORAGE_WALLPAPERS = 'hm_unlocked_wallpapers_v1';
const STORAGE_STATE = 'hm_game_state_v5'; 
const WP_PRICE = 30; 

const BG = require('../assets/background.png');
const ICON_BACK = require('../assets/ic_back.png');
const ICON_LOCK = require('../assets/ic_lock.png');

const WALLPAPERS = [
  require('../assets/wp1.png'), require('../assets/wp2.png'),
  require('../assets/wp3.png'), require('../assets/wp4.png'),
  require('../assets/wp5.png'), require('../assets/wp6.png'),
  require('../assets/wp7.png'), require('../assets/wp8.png'),
  require('../assets/wp9.png'),
];

export default function WallpaperScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  const [unlocked, setUnlocked] = useState<boolean[]>([true, ...Array(8).fill(false)]);
  const [selected, setSelected] = useState<number | null>(null);
  const [totalCoins, setTotalCoins] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const stateRaw = await AsyncStorage.getItem(STORAGE_STATE);
      if (stateRaw) {
        const parsed = JSON.parse(stateRaw);
        setTotalCoins(parsed.totalCoins || 0);
      }
      const wpRaw = await AsyncStorage.getItem(STORAGE_WALLPAPERS);
      if (wpRaw) {
        setUnlocked(JSON.parse(wpRaw));
      }
    } catch {}
  };

  const unlockWallpaper = async (index: number) => {
    if (totalCoins < WP_PRICE) {
      Alert.alert('Not enough coins', `You need ${WP_PRICE} coins to unlock this.`);
      return;
    }

    Alert.alert('Unlock', `Spend ${WP_PRICE} coins to unlock?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Unlock', 
        onPress: async () => {
          const newCoins = totalCoins - WP_PRICE;
          const newUnlocked = [...unlocked];
          newUnlocked[index] = true;

          setTotalCoins(newCoins);
          setUnlocked(newUnlocked);
          
          await AsyncStorage.setItem(STORAGE_WALLPAPERS, JSON.stringify(newUnlocked));
          const stateRaw = await AsyncStorage.getItem(STORAGE_STATE);
          const state = stateRaw ? JSON.parse(stateRaw) : {};
          await AsyncStorage.setItem(STORAGE_STATE, JSON.stringify({ ...state, totalCoins: newCoins }));
        }
      }
    ]);
  };

  const gridSize = useMemo(() => {
    const gap = 12;
    const pad = 20;
    const cell = Math.floor((width - pad * 2 - gap * 2) / 3);
    return { cell, gap, pad };
  }, [width]);

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable 
              onPress={() => navigation.goBack()} 
              hitSlop={20} 
              style={styles.backBtn}
            >
              <Image source={ICON_BACK} style={styles.backIcon} resizeMode="contain" />
            </Pressable>
          </View>
          
          <View style={styles.coinBadge}>
            <Text style={styles.coinText}>💰 {totalCoins}</Text>
          </View>
          
          <View style={styles.headerRight} /> 
        </View>

        <Text style={styles.screenTitle}>Wallpapers</Text>

        <View style={[styles.grid, { paddingHorizontal: gridSize.pad }]}>
          {WALLPAPERS.map((src, i) => (
            <Pressable
              key={i}
              style={[styles.cell, { width: gridSize.cell, height: gridSize.cell * 1.4 }]}
              onPress={() => unlocked[i] ? setSelected(i) : unlockWallpaper(i)}
            >
              <Image source={src} style={[styles.thumb, !unlocked[i] && { opacity: 0.3 }]} />
              {!unlocked[i] && (
                <View style={styles.lockOverlay}>
                  <Image source={ICON_LOCK} style={styles.lockIcon} />
                  <View style={styles.priceTag}>
                    <Text style={styles.priceText}>{WP_PRICE}</Text>
                  </View>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        {selected !== null && (
          <View style={styles.overlay}>
             <Image source={WALLPAPERS[selected]} style={styles.previewFull} resizeMode="contain" />
             <View style={styles.previewActions}>
                <Pressable style={styles.actionBtn} onPress={() => setSelected(null)}>
                  <Text style={styles.actionText}>Close</Text>
                </Pressable>
             </View>
          </View>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  mainContainer: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20, 
    height: 60,
    marginTop: 10,
  },
  headerLeft: {
    width: 50,
    alignItems: 'flex-start',
  },
  headerRight: {
    width: 50,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { 
    width: 32, 
    height: 32 
  },
  coinBadge: { 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    paddingHorizontal: 15, 
    paddingVertical: 6, 
    borderRadius: 20, 
    borderWidth: 2, 
    borderColor: '#F6C200',
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinText: { fontWeight: '900', color: '#F6C200', fontSize: 16 },
  screenTitle: { color: '#fff', fontSize: 30, fontWeight: '900', textAlign: 'center', marginVertical: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  cell: { 
    borderRadius: 15, 
    overflow: 'hidden', 
    backgroundColor: '#000', 
    borderWidth: 2, 
    borderColor: 'rgba(255,255,255,0.1)' 
  },
  thumb: { width: '100%', height: '100%' },
  lockOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  lockIcon: { width: 26, height: 26, marginBottom: 6 },
  priceTag: { backgroundColor: '#F6C200', paddingHorizontal: 8, borderRadius: 10 },
  priceText: { color: '#3A1D00', fontWeight: '900', fontSize: 13 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  previewFull: { width: '85%', height: '75%', borderRadius: 20 },
  previewActions: { marginTop: 25 },
  actionBtn: { backgroundColor: '#F6C200', paddingHorizontal: 50, paddingVertical: 14, borderRadius: 30 },
  actionText: { fontWeight: '900', color: '#3A1D00', fontSize: 18 }
});