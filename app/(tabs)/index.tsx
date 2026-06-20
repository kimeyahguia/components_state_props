import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Animated, Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const INITIAL_COUNT = 100;
// Punchy, candy-bright cartoon palette
const RAINBOW = ['#7c3aed', '#22c55e', '#fb923c', '#f43f5e', '#3b82f6', '#facc15', '#fb7185'];

function CounterDisplay({
  count, onAdd, onMinus, onReset,
}: {
  count: number;
  onAdd: () => void;
  onMinus: () => void;
  onReset: () => void;
}) 
{
  const accentColor = RAINBOW[Math.abs(count) % RAINBOW.length];
  const diff = count - INITIAL_COUNT;
  const diffText = diff === 0 ? 'back to start! 🎯' : (diff > 0 ? `+${diff} from start 🚀` : `${diff} from start 📉`);
  const pct = Math.min(Math.max(((count - 50) / 100), 0), 1);

  // Big squashy bounce whenever the count changes — full cartoon
  // "boing" instead of a subtle pop.
  const pop = useRef(new Animated.Value(1)).current;
  const wiggle = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    pop.setValue(0.7);
    wiggle.setValue(0);
    Animated.parallel([
      Animated.spring(pop, {
        toValue: 1,
        speed: 14,
        bounciness: 18,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(wiggle, { toValue: 1, duration: 80, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(wiggle, { toValue: -1, duration: 80, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(wiggle, { toValue: 0, duration: 80, easing: Easing.linear, useNativeDriver: true }),
      ]),
    ]).start();
  }, [count]);

  const rotate = wiggle.interpolate({ inputRange: [-1, 1], outputRange: ['-6deg', '6deg'] });

  return (
    <View style={[styles.card, { borderColor: accentColor }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.tagPill, { backgroundColor: accentColor }]}>
          <Text style={styles.tagPillText}>🧩 CHILD · CounterDisplay</Text>
        </View>
        <Text style={styles.propsLine}>count · onAdd · onMinus · onReset</Text>
      </View>

      <View style={styles.countArea}>
        <Text style={styles.metaText}>↓ props.count</Text>

        <View style={styles.countBubbleWrap}>
          <View style={[styles.countBubbleShadow, { backgroundColor: accentColor }]} />
          <Animated.View
            style={[
              styles.countBubble,
              { borderColor: accentColor, transform: [{ scale: pop }, { rotate }] },
            ]}
          >
            <Text style={[styles.countNum, { color: accentColor }]}>{count}</Text>
          </Animated.View>
        </View>

        <View style={[styles.barTrack, { borderColor: accentColor }]}>
          <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: accentColor }]} />
        </View>

        <View style={[styles.hintBubble, { backgroundColor: accentColor }]}>
          <Text style={styles.stepHint}>{diffText}</Text>
        </View>
        <Text style={styles.metaText}>↑ props.onAdd · onMinus · onReset</Text>
      </View>

      <View style={styles.btnRow}>
        <HoldButton
          label="ADD"
          icon="add-circle"
          onPress={onAdd}
          style={styles.btnAdd}
          textStyle={styles.btnAddText}
          iconColor="#ffffff"
        />
        <HoldButton
          label="SUB"
          icon="remove-circle"
          onPress={onMinus}
          style={styles.btnMinus}
          textStyle={styles.btnMinusText}
          iconColor="#ffffff"
        />
      </View>

      <TouchableOpacity style={styles.btnReset} onPress={onReset} activeOpacity={0.7}>
        <Ionicons name="refresh-circle" size={22} color="#7c3aed" />
        <Text style={styles.btnResetText}>Reset</Text>
      </TouchableOpacity>
    </View>
  );
}

function HoldButton({ label, icon, onPress, style, textStyle, iconColor }: {
  label: string; icon: string; onPress: () => void;
  style: object; textStyle: object; iconColor: string;
}) {
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const clearTimers = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
    if (interval.current) {
      clearInterval(interval.current);
      interval.current = null;
    }
  };

  // Prevents a stray interval from surviving past unmount and
  // freezing the app with runaway setState calls.
  useEffect(() => clearTimers, []);

  const press = (to: number, rot: number) => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: to,
        speed: 24,
        bounciness: 14,
        useNativeDriver: true,
      }),
      Animated.spring(rotate, {
        toValue: rot,
        speed: 24,
        bounciness: 14,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const start = () => {
    clearTimers();
    press(0.88, -1);
    onPress();
    timeout.current = setTimeout(() => {
      interval.current = setInterval(onPress, 75);
    }, 340);
  };

  const stop = () => {
    press(1, 0);
    clearTimers();
  };

  const rot = rotate.interpolate({ inputRange: [-1, 1], outputRange: ['-4deg', '4deg'] });

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale }, { rotate: rot }] }}>
      <TouchableOpacity style={style} onPressIn={start} onPressOut={stop} activeOpacity={0.9}>
        <Ionicons name={icon as any} size={26} color={iconColor} />
        <Text style={textStyle}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const [count, setCount] = useState(INITIAL_COUNT);

  return (
    <View style={styles.shell}>
      <View style={styles.topRow}>
        <View style={styles.tagPillGhost}>
          <Text style={styles.tagPillGhostText}>🏠 PARENT · index.tsx</Text>
        </View>
      </View>

      <View style={styles.stateCard}>
        <View>
          <Text style={styles.stateLabel}>✨ STATE</Text>
          <Text style={styles.stateKey}>count</Text>
        </View>
        <View style={styles.stateValueBubble}>
          <Text style={styles.stateValue}>{count}</Text>
        </View>
      </View>

      <CounterDisplay
        count={count}
        onAdd={() => setCount(c => c + 1)}
        onMinus={() => setCount(c => c - 1)}
        onReset={() => setCount(INITIAL_COUNT)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#fff7ed',
    padding: 18,
    paddingTop: 60,
    gap: 14,
  },

  topRow: { flexDirection: 'row' },
  tagPillGhost: {
    backgroundColor: '#fde68a',
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 3,
    borderColor: '#18181b',
  },
  tagPillGhostText: { color: '#18181b', fontSize: 12, fontWeight: '800', letterSpacing: 0.4 },

  stateCard: {
    backgroundColor: '#7c3aed',
    borderRadius: 26,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#18181b',
    shadowColor: '#18181b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  stateLabel: { color: '#fde68a', fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  stateKey: { color: '#ffffff', fontSize: 18, fontWeight: '800', marginTop: 2 },
  stateValueBubble: {
    backgroundColor: '#ffffff',
    borderRadius: 100,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#18181b',
  },
  stateValue: { color: '#7c3aed', fontSize: 22, fontWeight: '800' },

  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 20,
    gap: 16,
    borderWidth: 5,
    shadowColor: '#18181b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  cardHeader: { gap: 8 },
  tagPill: {
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignSelf: 'flex-start',
    borderWidth: 3,
    borderColor: '#18181b',
  },
  tagPillText: { color: '#ffffff', fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  propsLine: { color: '#a1a1aa', fontSize: 12, fontWeight: '600' },

  countArea: { alignItems: 'center', gap: 12, paddingVertical: 10 },
  metaText: { color: '#d4d4d8', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700' },

  countBubbleWrap: { width: 200, height: 130, alignItems: 'center', justifyContent: 'center' },
  countBubbleShadow: {
    position: 'absolute',
    width: 190,
    height: 120,
    borderRadius: 100,
    top: 12,
    left: 14,
    opacity: 0.25,
  },
  countBubble: {
    width: 190,
    height: 120,
    borderRadius: 100,
    backgroundColor: '#ffffff',
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countNum: { fontSize: 56, fontWeight: '800', letterSpacing: -1 },

  barTrack: {
    width: '85%', height: 16,
    backgroundColor: '#f4f4f5',
    borderRadius: 100, overflow: 'hidden',
    borderWidth: 3,
  },
  barFill: { height: '100%', borderRadius: 100 },

  hintBubble: {
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 3,
    borderColor: '#18181b',
  },
  stepHint: { fontSize: 14, fontWeight: '800', color: '#ffffff' },

  btnRow: { flexDirection: 'row', gap: 12 },
  btnAdd: {
    backgroundColor: '#22c55e',
    borderRadius: 22,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 4,
    borderColor: '#18181b',
    shadowColor: '#18181b',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  btnAddText: { color: '#ffffff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  btnMinus: {
    backgroundColor: '#f43f5e',
    borderRadius: 22,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 4,
    borderColor: '#18181b',
    shadowColor: '#18181b',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  btnMinusText: { color: '#ffffff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },

  btnReset: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  btnResetText: { color: '#7c3aed', fontSize: 14, fontWeight: '800' },
});