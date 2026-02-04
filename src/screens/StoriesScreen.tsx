import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Pressable,
  FlatList,
  useWindowDimensions,
  ScrollView,
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Stories'>;

const BG = require('../assets/background.png');
const IC_BACK = require('../assets/ic_back.png');
const HERO = require('../assets/onboard2.png');
const IC_SHARE = require('../assets/ic_share.png');

type Story = {
  id: string;
  title: string;
  body: string;
};

type Mode = 'list' | 'detail';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function StoriesScreen({ navigation }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isSmallH = height < 740;
  const isTinyH = height < 680;
  const isNarrow = width < 360;

  const topPad = Math.max(10, insets.top + 8);
  const bottomPad = Math.max(12, insets.bottom + 10);

  const [mode, setMode] = useState<Mode>('list');
  const [selected, setSelected] = useState<Story | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const stories = useMemo<Story[]>(
    () => [
      {
        id: '1',
        title: 'The Place Where Nothing Happens',
        body:
          `There is a place underground where nothing ever seems to happen. No special stones, no rich coal, no obvious reward. I return to that place often. At first, it feels like a mistake. You stand there, staring at the same pile of stone, waiting for a sign that never comes. Your hands grow restless. Your mind starts offering excuses to move on. That is usually when people leave.\n\n` +
          `I stay.\n\n` +
          `Staying teaches you how quickly the mind tries to escape boredom. It invents urgency where none exists. It whispers that attention should always be rewarded. But underground, attention is its own reward. After enough time, something changes. The stone does not move, but you do. Your breathing slows. Your eyes stop searching and start noticing. Small shifts become visible. A shadow where there was none. A sound you missed before.\n\n` +
          `When the moment finally arrives, it feels obvious, almost gentle. Not dramatic. Not loud. Just correct. People think reaction is about speed, but it begins with patience. If you cannot stay where nothing happens, you will never be ready when something finally does.`,
      },
      {
        id: '2',
        title: 'Why I Appear So Briefly',
        body:
          `People often complain that I disappear too fast. They want more time. More warning. More comfort. I understand the feeling, but I do not agree with it. I appear briefly because moments do the same. They never announce themselves properly. They never wait until you feel prepared. They arrive while you are distracted, tired, or overconfident.\n\n` +
          `I learned this lesson long before I started hiding behind stones. In mining, hesitation costs more than effort. If you think too long, the opportunity hardens, collapses, or vanishes entirely. Quick appearance forces honesty. It shows you exactly where your attention is at that instant, not where you wish it was.\n\n` +
          `When you tap in time, it is not luck. It is alignment. Your eyes were present. Your hands were ready. Your mind was quiet enough not to interfere. When you miss, it is not punishment. It is information. It tells you that, for a brief moment, you were somewhere else.\n\n` +
          `I leave quickly because staying would soften that truth. Sharp moments teach faster than gentle ones ever could.`,
      },
      {
        id: '3',
        title: 'The Day My Hands Moved First',
        body:
          `There was a day when my hands moved before I realized what was happening. No thought, no preparation, no internal command. Just movement. The pickaxe landed perfectly, and only afterward did my mind catch up. That moment stayed with me longer than any success I could count.\n\n` +
          `I tried to recreate it many times and failed every time I tried. The harder I chased it, the further it moved away. Eventually, I understood why. That moment did not belong to effort. It belonged to readiness. I was rested. Focused. Empty of expectation. I was not waiting for anything special to happen.\n\n` +
          `Since then, I stopped trying to be fast. I started trying to be present. Fast reactions began to appear on their own. Quietly. Unexpectedly. Like a miner popping out from behind stone.\n\n` +
          `People think mastery feels powerful. It does not. It feels light. Almost accidental. As if you simply allowed the right thing to happen at the right time. Those are the moments I dig for. Everything else is just practice.`,
      },
      {
        id: '7',
        title: 'The Moment I Stopped Looking Ahead',
        body:
          `For a long time, I was always slightly ahead of myself. While my hands were here, my thoughts were already somewhere else, preparing for what might come next. It felt responsible, even smart. Anticipation looked like focus. But over time I noticed something uncomfortable: the more I lived in the next moment, the more often I missed the current one.\n\n` +
          `One day, I decided to stop expecting anything. I didn’t prepare for my appearance. I didn’t imagine the next move. I simply watched. At first, the stillness felt wrong. The mind dislikes empty space and tries to fill it with plans. But if you stay long enough, the silence becomes useful.\n\n` +
          `When the moment arrived, there was no rush. No internal signal. My hands reacted as if they had been waiting without effort. That was when I understood that the future quietly steals attention from the present. And reaction only exists here.`,
      },
      {
        id: '8',
        title: 'The Comfort of Repetition',
        body:
          `Many people fear repetition. They see it as stagnation. I found the opposite. Repetition removes unnecessary questions. The same movements, the same stones, the familiar rhythm — all of it clears the noise.\n\n` +
          `Repetition is honest. It exposes small inaccuracies that randomness hides. If your timing is off, repetition will show it again and again. If your focus is steady, it will support you without praise.\n\n` +
          `I stopped chasing novelty in every action. Instead, I listened to how my body responded to what it already knew. That is where my cleanest moments appeared. Not loud. Not impressive. Just precise.`,
      },
      {
        id: '9',
        title: 'When Silence Answers',
        body:
          `Silence is not the absence of an answer. Sometimes it is the answer itself. Underground, I often ask questions without forming them into words. Am I ready? Am I present? Am I really here?\n\n` +
          `The response never comes verbally. It arrives through movement. Through the weight of the tool. Through whether the hand tightens or stays relaxed at the last second.\n\n` +
          `Once I accepted silence as a conversation, things became simpler. I stopped looking for confirmation. If my focus was real, the moment opened. If it wasn’t, it passed by. Without judgment. Without explanation.\n\n` +
          `Silence never lies. It only reflects what you bring into it.`,
      },
      {
        id: '10',
        title: 'The Weight I Didn’t Notice',
        body:
          `For years, I carried tension without realizing it. It settled quietly in my shoulders, my grip, the way I leaned forward just a little too much. I thought it was effort. I thought it meant I cared. Underground taught me otherwise.\n\n` +
          `One day, after a long session, I noticed how heavy my hands felt even before I lifted the pickaxe. Not tired — guarded. As if I expected resistance before it appeared. That expectation added weight to everything. I loosened my grip slightly, not enough to lose control, just enough to stop preparing for a fight that hadn’t started.\n\n` +
          `The difference was immediate. Movements became cleaner. Timing felt less forced. I realized then that attention does not require tension. In fact, tension often hides in the name of focus. True readiness is light. It allows you to respond instead of react. Since that day, I check my weight before I check my aim.`,
      },
      {
        id: '11',
        title: 'The False Comfort of Control',
        body:
          `Control feels safe. It convinces you that nothing unexpected will happen. I chased that feeling for a long time, trying to predict every appearance, every rhythm shift, every pause. It worked until it didn’t.\n\n` +
          `The more control I tried to keep, the less flexible my reactions became. When something arrived slightly off-pattern, I hesitated. Not because I was slow, but because I was attached to how things were supposed to be.\n\n` +
          `Letting go of control did not mean becoming careless. It meant allowing uncertainty back into the space. The moment I stopped insisting on precision, precision returned on its own. Not rigid. Responsive.\n\n` +
          `Mining does not reward dominance. It rewards cooperation with the moment as it is, not as you planned it to be.`,
      },
      {
        id: '12',
        title: 'The Quiet Confidence',
        body:
          `There is a kind of confidence that makes noise. It announces itself. It demands proof. I used to trust that kind. Underground, it failed me repeatedly.\n\n` +
          `The confidence that lasts is almost invisible. It does not rush. It does not celebrate early. It simply stays available. When a moment appears, this confidence does not get excited. It responds.\n\n` +
          `I recognized it the first time I missed without frustration. No self-criticism. No tightening of the chest. Just information, received calmly. That calm stayed with me longer than any streak.\n\n` +
          `Now, when my hands move correctly, I barely notice. And when they don’t, I learn just as much. Quiet confidence does not need confirmation. It only needs presence.`,
      },
      {
        id: '13',
        title: 'The Moment After Success',
        body:
          `Success has a strange echo. It arrives cleanly, then lingers longer than it should. I learned to be careful with that echo. After a perfect hit, after a clean reaction, there is a temptation to hold onto the feeling, to repeat it exactly. That is when trouble begins.\n\n` +
          `I once tried to replay a successful moment in my head while continuing to dig. My hands followed, but my attention stayed behind, admiring what had already happened. The next appearance came and went untouched. That miss taught me something important: success belongs to the past the moment it happens.\n\n` +
          `Now, when I succeed, I let it end immediately. No celebration. No attachment. Just a quiet acknowledgment and a return to watching. The next moment does not care what you did before. It only responds to where you are now.`,
      },
      {
        id: '14',
        title: 'Learning to End a Session',
        body:
          `Stopping is a skill most people never practice. They wait until exhaustion forces them to stop, until mistakes pile up loudly enough to demand it. I used to do the same. Underground taught me a gentler way.\n\n` +
          `There is a moment when focus begins to thin, not break. Reactions still work, but effort increases. That moment is easy to ignore and expensive to miss. I learned to recognize it and leave while everything still feels intact.\n\n` +
          `Ending a session early is not failure. It is preservation. It keeps attention fresh and respect for the rhythm alive. When I return later, my hands remember the quiet instead of the struggle. That memory matters more than any extra points I could have chased.`,
      },
      {
        id: '15',
        title: 'Still Digging',
        body:
          `People often ask how long I plan to keep digging. I never have a good answer. Not because I don’t know, but because the question misses the point. I do not dig to reach an end. I dig to stay awake.\n\n` +
          `As long as I am paying attention, the work feels meaningful. As long as my hands respond without hesitation, I know I am present. The stones change. The rhythm shifts. I appear and disappear. But the practice remains the same.\n\n` +
          `I am still here, watching the place where nothing seems to happen, ready for the moment that will arrive without warning. That readiness is enough. Everything else is just surface.`,
      },
    ],
    []
  );

  const sidePad = isNarrow ? 14 : 18;

  const itemH = isTinyH ? 74 : isSmallH ? 80 : 86;
  const heroH = clamp(Math.round(height * (isTinyH ? 0.26 : isSmallH ? 0.28 : 0.3)), 170, 260);
  const heroW = clamp(Math.round(width * 0.78), 250, 340);
  const reservedBottom = heroH - 8 + 8;
  const detailCardPaddingBottom = reservedBottom;

  const openDetail = (story: Story) => {
    setSelectedId(story.id);
    setSelected(story);
    setMode('detail');
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: 0, animated: false }));
  };

  const closeDetail = () => {
    setMode('list');
    setSelected(null);
  };

  const onBack = () => {
    if (mode === 'detail') {
      closeDetail();
      return;
    }
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.replace('Home');
  };

  const onShare = async () => {
    if (!selected) return;
    try {
      await Share.share({ message: `${selected.title}\n\n${selected.body}` });
    } catch {}
  };

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={[styles.header, { paddingTop: topPad, paddingHorizontal: sidePad }]}>
          <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
            <Image source={IC_BACK} style={styles.backIcon} resizeMode="contain" />
          </Pressable>

          <Text style={[styles.headerTitle, { fontSize: isTinyH ? 24 : 26 }]}>Stories</Text>

          {mode === 'detail' ? (
            <Pressable onPress={onShare} hitSlop={12} style={styles.shareBtn}>
              <Image source={IC_SHARE} style={styles.shareIcon} resizeMode="contain" />
            </Pressable>
          ) : (
            <View style={{ width: 44 }} />
          )}
        </View>
        {mode === 'list' && (
          <View style={[styles.listWrap, { paddingBottom: bottomPad, paddingHorizontal: sidePad }]}>
            <FlatList
              data={stories}
              keyExtractor={(it) => it.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 10, paddingBottom: 24 }}
              renderItem={({ item, index }) => {
                const isFeatured = index === 0;
                const isSelected = item.id === selectedId;
                const isYellow = selectedId ? isSelected : isFeatured;

                const preview = item.body.replace(/\n/g, ' ').slice(0, 70);

                return (
                  <Pressable
                    onPress={() => openDetail(item)}
                    style={[
                      styles.card,
                      { height: itemH },
                      isYellow ? styles.cardFeatured : styles.cardDark,
                    ]}
                  >
                    <Text style={[styles.cardTitle, isYellow ? styles.featuredTitle : styles.darkTitle]}>
                      {item.title}
                    </Text>

                    <Text
                      style={[styles.cardSub, isYellow ? styles.featuredSub : styles.darkSub]}
                      numberOfLines={1}
                    >
                      {preview}…
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>
        )}
        {mode === 'detail' && selected && (
          <View style={[styles.detailWrap, { paddingBottom: bottomPad, paddingHorizontal: sidePad }]}>
            <View style={[styles.detailCard, { paddingBottom: detailCardPaddingBottom }]}>
              <ScrollView
                ref={scrollRef} 
                showsVerticalScrollIndicator={true}
                scrollIndicatorInsets={{ right: 1 }}
                contentContainerStyle={{
                  paddingTop: isTinyH ? 10 : 12,
                  paddingHorizontal: isNarrow ? 12 : 14,
                  paddingBottom: isTinyH ? 20 : 40, 
                }}
              >
                <Text style={[styles.detailTitle, { fontSize: isTinyH ? 15 : 16 }]}>{selected.title}</Text>
                <Text
                  style={[
                    styles.detailBody,
                    { fontSize: isTinyH ? 12.5 : 13.2, lineHeight: isTinyH ? 19 : 20 },
                  ]}
                >
                  {selected.body}
                </Text>
              </ScrollView>
            </View>
            <View style={[styles.heroWrap, { height: heroH }]} pointerEvents="none">
              <Image source={HERO} style={{ width: heroW, height: heroH }} resizeMode="contain" />
            </View>
            <Pressable style={[styles.fabShare, { right: sidePad, bottom: 18 }]} onPress={onShare} hitSlop={10}>
              <Image source={IC_SHARE} style={styles.fabShareIcon} resizeMode="contain" />
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

  shareBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  shareIcon: { width: 24, height: 24 },

  listWrap: { flex: 1 },

  card: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    justifyContent: 'center',
  },

  cardFeatured: {
    backgroundColor: '#F6C200',
    borderWidth: 2,
    borderColor: '#3A1D00',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },

  cardDark: {
    backgroundColor: 'rgba(35, 46, 120, 0.55)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.92)',
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 6,
  },

  featuredTitle: { color: '#2A1400' },
  darkTitle: { color: '#fff' },

  cardSub: {
    fontSize: 12,
    fontWeight: '700',
  },

  featuredSub: { color: 'rgba(42,20,0,0.75)' },
  darkSub: { color: 'rgba(255,255,255,0.78)' },
  detailWrap: {
    flex: 1,
    paddingTop: 12,
  },

  detailCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: '#F6C200',
    borderWidth: 2,
    borderColor: '#3A1D00',
    overflow: 'hidden',
  },

  detailTitle: {
    color: '#2A1400',
    fontWeight: '900',
    marginBottom: 8,
  },

  detailBody: {
    color: 'rgba(42,20,0,0.92)',
    fontWeight: '700',
  },

  heroWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },

  fabShare: {
    position: 'absolute',
    width: 92,
    height: 56,
    borderRadius: 999,
    backgroundColor: '#F6C200',
    borderWidth: 2,
    borderColor: '#3A1D00',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  fabShareIcon: {
    width: 22,
    height: 22,
  },
});
