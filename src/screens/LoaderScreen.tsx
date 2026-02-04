import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ImageBackground, Image, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Loader'>;

const BG = require('../assets/background.png'); 
const LOGO = require('../assets/logo.png');

type Phase = 'web' | 'logo';

export default function LoaderScreen({ navigation }: Props) {
  const [phase, setPhase] = useState<Phase>('web');

  const html = useMemo(() => {
    return `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: transparent;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      body {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      @-webkit-keyframes honeycomb {
        0%, 20%, 80%, 100% { opacity: 0; -webkit-transform: scale(0); transform: scale(0); }
        30%, 70% { opacity: 1; -webkit-transform: scale(1); transform: scale(1); }
      }
      @keyframes honeycomb {
        0%, 20%, 80%, 100% { opacity: 0; -webkit-transform: scale(0); transform: scale(0); }
        30%, 70% { opacity: 1; -webkit-transform: scale(1); transform: scale(1); }
      }

      .honeycomb { height: 24px; position: relative; width: 24px; }
      .honeycomb div {
        -webkit-animation: honeycomb 2.1s infinite backwards;
        animation: honeycomb 2.1s infinite backwards;
        background: #f3f3f3;
        height: 12px;
        margin-top: 6px;
        position: absolute;
        width: 24px;
      }
      .honeycomb div:after, .honeycomb div:before {
        content: '';
        border-left: 12px solid transparent;
        border-right: 12px solid transparent;
        position: absolute;
        left: 0; right: 0;
      }
      .honeycomb div:after { top: -6px; border-bottom: 6px solid #f3f3f3; }
      .honeycomb div:before { bottom: -6px; border-top: 6px solid #f3f3f3; }

      .honeycomb div:nth-child(1) { -webkit-animation-delay: 0s;   animation-delay: 0s;   left: -28px; top: 0; }
      .honeycomb div:nth-child(2) { -webkit-animation-delay: 0.1s; animation-delay: 0.1s; left: -14px; top: 22px; }
      .honeycomb div:nth-child(3) { -webkit-animation-delay: 0.2s; animation-delay: 0.2s; left: 14px; top: 22px; }
      .honeycomb div:nth-child(4) { -webkit-animation-delay: 0.3s; animation-delay: 0.3s; left: 28px; top: 0; }
      .honeycomb div:nth-child(5) { -webkit-animation-delay: 0.4s; animation-delay: 0.4s; left: 14px; top: -22px; }
      .honeycomb div:nth-child(6) { -webkit-animation-delay: 0.5s; animation-delay: 0.5s; left: -14px; top: -22px; }
      .honeycomb div:nth-child(7) { -webkit-animation-delay: 0.6s; animation-delay: 0.6s; left: 0; top: 0; }
    </style>
  </head>
  <body>
    <div class="honeycomb" aria-label="Loading">
      <div></div><div></div><div></div><div></div><div></div><div></div><div></div>
    </div>
  </body>
</html>
`;
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('logo'), 3000);
    const t2 = setTimeout(() => navigation.replace('Onboarding'), 6000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [navigation]);

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={styles.center}>
        {phase === 'web' ? (
          <View style={styles.webWrap}>
            <WebView
              originWhitelist={['*']}
              source={{ html }}
              style={styles.web}
              scrollEnabled={false}
              javaScriptEnabled
              domStorageEnabled
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              androidLayerType="hardware"
              containerStyle={styles.webContainer}
              {...(Platform.OS === 'ios'
                ? { opaque: false, backgroundColor: 'transparent' as any }
                : {})}
            />
          </View>
        ) : (
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  webWrap: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webContainer: {
    backgroundColor: 'transparent',
  },

  web: {
    width: 140,
    height: 140,
    backgroundColor: 'transparent',
  },

  logo: {
    width: 220,
    height: 220,
  },
});
