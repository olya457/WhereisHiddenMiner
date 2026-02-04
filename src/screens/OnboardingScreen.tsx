import React, { useMemo, useRef, useState, useEffect } from 'react';
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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const BG = require('../assets/background.png');
const LOGO2 = require('../assets/logo2.png');

const ONB1 = require('../assets/onboard1.png');
const ONB2 = require('../assets/onboard2.png');
const ONB3 = require('../assets/onboard3.png');
const ONB4 = require('../assets/onboard4.png');

type Page = {
  key: string;
  image: any;
  button: string;
  text: string;
};

export default function OnboardingScreen({ navigation }: Props) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isSmallH = height < 740;
  const isTinyH = height < 680;
  const isNarrow = width < 360;

  const pages: Page[] = useMemo(
    () => [
      {
        key: '1',
        image: ONB1,
        button: "Let’s Dig",
        text:
          "Hey there. I’m the Hidden Miner.\nI appear quietly, just for a moment,\nbetween coal and stone.\nStay present and you’ll notice me.\nLose focus, and I’ll slip away.",
      },
      {
        key: '2',
        image: ONB2,
        button: 'Show Me How',
        text:
          "When I show up, tap without delay.\nEach clean tap moves you forward.\nWaiting too long means the moment is gone.\nDon’t rush — just be ready\nfor the next appearance.",
      },
      {
        key: '3',
        image: ONB3,
        button: "I’m Ready",
        text:
          "Time is always moving here.\nEvery hesitation costs a little of it.\nKeep your eyes steady, your reactions light,\nand follow the rhythm\nwhile the clock keeps running.",
      },
      {
        key: '4',
        image: ONB4,
        button: 'Start Game',
        text:
          "Between runs, I leave short stories\nfrom the mine. Save the ones you like\nor share them along the way.\nProgress unlocks visual rewards —\nearned through attention, not chance.",
      },
    ],
    []
  );

  const [index, setIndex] = useState(0);

  const a = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(10)).current;

  const playIn = () => {
    a.stopAnimation();
    y.stopAnimation();
    a.setValue(0);
    y.setValue(12);

    Animated.parallel([
      Animated.timing(a, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    playIn();
  }, [index]);

  const goNext = () => {
    if (index >= pages.length - 1) {
      navigation.replace('Home');
      return;
    }
    setIndex((v) => v + 1);
  };

  const logoW = isNarrow ? 190 : 210;
  const logoH = isTinyH ? 58 : 70;

  const textSize = isTinyH ? 12.5 : isSmallH ? 13.5 : 14;
  const textLH = isTinyH ? 16 : 18;

  const characterW = Math.min(width * 0.94, isTinyH ? 330 : 360);
  const characterH = isTinyH ? 360 : isSmallH ? 390 : 420;

  const btnW = isNarrow ? 190 : 210;
  const btnH = isTinyH ? 48 : 54;

  const bottomPad = Math.max(14, insets.bottom + (isTinyH ? 4 : 6));
  const logoTop = Math.max(8, insets.top + (isTinyH ? 4 : 6) + 20);

  const contentTopGap = isTinyH ? 92 : isSmallH ? 90 : 120;

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={[styles.logoWrap, { top: logoTop }]}>
          <Image source={LOGO2} style={{ width: logoW, height: logoH }} resizeMode="contain" />
        </View>

        <View
          style={[
            styles.bottomArea,
            {
              paddingBottom: bottomPad,
              paddingHorizontal: isNarrow ? 14 : 16,
              paddingTop: contentTopGap,
            },
          ]}
        >
          <Animated.View style={{ opacity: a, transform: [{ translateY: y }], width: '100%', alignItems: 'center' }}>
            <Text style={[styles.copy, { fontSize: textSize, lineHeight: textLH, marginBottom: isTinyH ? 8 : 12 }]}>
              {pages[index].text}
            </Text>

            <Image source={pages[index].image} style={{ width: characterW, height: characterH }} resizeMode="contain" />

            <Pressable
              style={[
                styles.btn,
                {
                  width: btnW,
                  height: btnH,
                  marginTop: isTinyH ? 8 : 12,
                  borderRadius: isTinyH ? 14 : 16,
                },
              ]}
              onPress={goNext}
            >
              <Text style={[styles.btnText, { fontSize: isTinyH ? 15 : 16 }]}>{pages[index].button}</Text>
            </Pressable>

            <View style={[styles.dots, { marginTop: isTinyH ? 10 : 12, marginBottom: isTinyH ? 4 : 6 }]}>
              {pages.map((p, i) => (
                <View
                  key={p.key}
                  style={[
                    styles.dot,
                    i === index ? styles.dotActive : null,
                    { width: Math.max(10, Math.round(width * 0.03)) },
                  ]}
                />
              ))}
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },

  logoWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },

  bottomArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  copy: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  btn: {
    backgroundColor: '#F6C200',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#5A2C00',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  btnText: {
    color: '#3A1D00',
    fontWeight: '900',
  },

  dots: {
    flexDirection: 'row',
    gap: 8,
  },

  dot: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },

  dotActive: {
    backgroundColor: '#FFFFFF',
  },
});
