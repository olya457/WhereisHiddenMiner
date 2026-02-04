import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ImageBackground,
  Image,
  Text,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const BG = require('../assets/background.png');
const LOGO2 = require('../assets/logo2.png');
const HERO = require('../assets/onboard2.png');
const IC_STORIES = require('../assets/ic_stories.png');
const IC_WALLPAPER = require('../assets/ic_wallpaper.png');
const IC_SETTINGS = require('../assets/ic_settings.png');
const IC_QUIZ = require('../assets/ic_quiz.png');

export default function HomeScreen({ navigation }: Props) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isSmallH = height < 740;
  const isTinyH = height < 680;
  const isNarrow = width < 360;

  const logoW = isNarrow ? 200 : 230;
  const logoH = isTinyH ? 56 : isSmallH ? 62 : 70;

  const startW = Math.min(width * 0.78, 320);
  const startH = isTinyH ? 54 : 62;

  const iconSize = isTinyH ? 58 : 62;
  const iconRadius = iconSize / 2;

  const heroW = Math.min(width * 0.92, 420);
  const heroH = isTinyH ? 360 : isSmallH ? 410 : 470;

  const topPad = Math.max(10, insets.top + 8);
  const bottomPad = Math.max(14, insets.bottom + (isTinyH ? 10 : 14));

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={[styles.logoWrap, { paddingTop: topPad }]}>
          <Image source={LOGO2} style={{ width: logoW, height: logoH }} resizeMode="contain" />
        </View>

        <View style={[styles.center, { paddingBottom: bottomPad }]}>
          <Pressable
            style={[styles.startBtn, { width: startW, height: startH }]}
            onPress={() => navigation.navigate('Gameplay')}
          >
            <Text style={styles.startText}>Start</Text>
          </Pressable>
          <View style={styles.iconRow}>
            <Pressable
              style={[styles.iconBtn, { width: iconSize, height: iconSize, borderRadius: iconRadius }]}
              onPress={() => navigation.navigate('Stories')}
            >
              <Image source={IC_STORIES} style={styles.iconImg} resizeMode="contain" />
            </Pressable>

            <Pressable
              style={[styles.iconBtn, { width: iconSize, height: iconSize, borderRadius: iconRadius }]}
              onPress={() => navigation.navigate('Wallpaper')}
            >
              <Image source={IC_WALLPAPER} style={styles.iconImg} resizeMode="contain" />
            </Pressable>
            <Pressable
              style={[styles.iconBtn, { width: iconSize, height: iconSize, borderRadius: iconRadius }]}
              onPress={() => navigation.navigate('Quiz')}
            >
              <Image source={IC_QUIZ} style={styles.iconImg} resizeMode="contain" />
            </Pressable>
            <Pressable
              style={[styles.iconBtn, { width: iconSize, height: iconSize, borderRadius: iconRadius }]}
              onPress={() => navigation.navigate('Settings')}
            >
              <Image source={IC_SETTINGS} style={styles.iconImg} resizeMode="contain" />
            </Pressable>
          </View>

          <View style={styles.heroWrap} pointerEvents="none">
            <Image
              source={HERO}
              style={{ width: heroW, height: heroH, marginTop: 20 }}
              resizeMode="contain"
            />
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },

  logoWrap: {
    alignItems: 'center',
  },

  center: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 18,
  },

  startBtn: {
    backgroundColor: '#F6C200',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3A1D00',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  startText: {
    color: '#3A1D00',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(255,255,255,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  iconRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconBtn: {
    backgroundColor: '#F6C200',
    borderWidth: 2,
    borderColor: '#3A1D00',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  iconImg: {
    width: 26,
    height: 26,
  },

  heroWrap: {
    marginTop: 10,
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
