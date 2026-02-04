import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Pressable,
  Switch,
  Share,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const BG = require('../assets/background.png');
const IC_BACK = require('../assets/ic_back.png');
const HERO = require('../assets/onboard3.png'); 
const IC_SHARE = require('../assets/ic_share.png'); 

const K_VIBRATION = 'settings_vibration_enabled';
const K_NOTIFICATIONS = 'settings_notifications_enabled';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function SettingsScreen({ navigation }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isSmallH = height < 740;
  const isTinyH = height < 680;
  const isNarrow = width < 360;

  const sidePad = isNarrow ? 14 : 18;

  const topPad = Math.max(10, insets.top + (isTinyH ? 6 : 8));
  const bottomSafe = Math.max(insets.bottom, 0);
  const shareBottom = 40 + bottomSafe;
  const titleSize = isTinyH ? 26 : isSmallH ? 28 : 30;
  const rowTextSize = isTinyH ? 22 : 24;
  const rowPadV = isTinyH ? 14 : 18;
  const rowPadH = isNarrow ? 16 : 18;
  const rowRadius = isTinyH ? 22 : 26;

  const spaceAfterHeader = isTinyH ? 10 : 14;
  const heroW = clamp(Math.round(width * 0.72), 230, 330);
  const heroH = clamp(Math.round(height * (isTinyH ? 0.22 : 0.25)), 150, 250);
  const heroBottomPad = clamp(shareBottom + (isTinyH ? 66 : 76), 120, 180);

  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [v, n] = await Promise.all([
          AsyncStorage.getItem(K_VIBRATION),
          AsyncStorage.getItem(K_NOTIFICATIONS),
        ]);
        if (v !== null) setVibrationEnabled(v === '1');
        if (n !== null) setNotificationsEnabled(n === '1');
      } catch {}
    })();
  }, []);

  const onToggleVibration = async (val: boolean) => {
    setVibrationEnabled(val);
    try {
      await AsyncStorage.setItem(K_VIBRATION, val ? '1' : '0');
    } catch {}
  };

  const onToggleNotifications = async (val: boolean) => {
    setNotificationsEnabled(val);
    try {
      await AsyncStorage.setItem(K_NOTIFICATIONS, val ? '1' : '0');
    } catch {}
  };

  const onBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.replace('Home');
  };

  const onShare = async () => {
    try {
      await Share.share({
        message: `Where is Hidden Miner\n\nA calm, story-driven mini experience with short sessions and gentle progress.`,
      });
    } catch {}
  };

  const SwitchThumb = Platform.OS === 'android' ? '#FFFFFF' : undefined;

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={[styles.header, { paddingTop: topPad, paddingHorizontal: sidePad }]}>
          <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
            <Image source={IC_BACK} style={styles.backIcon} resizeMode="contain" />
          </Pressable>

          <Text style={[styles.headerTitle, { fontSize: titleSize }]}>Settings</Text>

          <View style={{ width: 44 }} />
        </View>

        <View style={{ height: spaceAfterHeader }} />
        <View style={[styles.content, { paddingHorizontal: sidePad }]}>
          <View
            style={[
              styles.rowCard,
              {
                borderRadius: rowRadius,
                paddingVertical: rowPadV,
                paddingHorizontal: rowPadH,
              },
            ]}
          >
            <Text style={[styles.rowLabel, { fontSize: rowTextSize }]}>Vibration</Text>
            <Switch
              value={vibrationEnabled}
              onValueChange={onToggleVibration}
              trackColor={{ false: '#CFCFCF', true: '#2ECC71' }}
              thumbColor={SwitchThumb}
              ios_backgroundColor="#CFCFCF"
            />
          </View>

          <View style={{ height: isTinyH ? 12 : 14 }} />

          <View
            style={[
              styles.rowCard,
              {
                borderRadius: rowRadius,
                paddingVertical: rowPadV,
                paddingHorizontal: rowPadH,
              },
            ]}
          >
            <Text style={[styles.rowLabel, { fontSize: rowTextSize }]}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={onToggleNotifications}
              trackColor={{ false: '#CFCFCF', true: '#2ECC71' }}
              thumbColor={SwitchThumb}
              ios_backgroundColor="#CFCFCF"
            />
          </View>
          <View style={[styles.heroWrap, { paddingBottom: heroBottomPad }]}>
            <Image source={HERO} style={{ width: heroW, height: heroH }} resizeMode="contain" />
          </View>
        </View>
        <Pressable
          onPress={onShare}
          style={[
            styles.shareBtn,
            {
              left: sidePad,
              right: sidePad,
              bottom: shareBottom,
              height: isTinyH ? 64 : 70,
            },
          ]}
        >
          <Text style={[styles.shareText, { fontSize: isTinyH ? 20 : 22 }]}>Share the app</Text>
          <Image source={IC_SHARE} style={styles.shareIcon} resizeMode="contain" />
        </Pressable>
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
  backIcon: { width: 30, height: 30, tintColor: '#fff' },

  headerTitle: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },

  content: { flex: 1 },

  rowCard: {
    backgroundColor: 'rgba(45, 53, 120, 0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  rowLabel: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  heroWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 14,
  },

  shareBtn: {
    position: 'absolute',
    backgroundColor: '#F6C200',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#3A1D00',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  shareText: {
    color: '#2A1400',
    fontWeight: '900',
  },

  shareIcon: {
    width: 22,
    height: 22,
    tintColor: '#2A1400',
  },
});
