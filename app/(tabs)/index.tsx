import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const INITIAL_COUNT = 100;
const RAINBOW = ['#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#eab308', '#ef4444'];

function CounterDisplay({
  count, onAdd, onMinus, onReset,
}: {
  count: number;
  onAdd: () => void;
  onMinus: () => void;
  onReset: () => void;
}) {
  const accentColor = RAINBOW[Math.abs(count) % RAINBOW.length];
  const diff = count - INITIAL_COUNT;
  const diffText = diff === 0 ? 'back to start' : (diff > 0 ? `+${diff} from start` : `${diff} from start`);
  const pct = Math.min(Math.max(((count - 50) / 100), 0), 1);

  // Subtle pop whenever the count changes — keeps it feeling alive
  // without being cartoonish.
  const pop = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    pop.setValue(0.94);
    Animated.spring(pop, {
      toValue: 1,
      speed: 22,
      bounciness: 8,
      useNativeDriver: true,
    }).start();
  }, [count]);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.tagPill}>
          <Text style={styles.tagPillText}>CHILD · CounterDisplay</Text>
        </View>
        <Text style={styles.propsLine}>count · onAdd · onMinus · onReset</Text>
      </View>

      <View style={styles.countArea}>
        <Text style={styles.metaText}>↓ props.count</Text>

        <Animated.Text
          style={[
            styles.countNum,
            { color: accentColor, transform: [{ scale: pop }] },
          ]}
        >
          {count}
        </Animated.Text>

        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: accentColor }]} />
        </View>

        <Text style={[styles.stepHint, { color: accentColor }]}>{diffText}</Text>
        <Text style={styles.metaText}>↑ props.onAdd · onMinus · onReset</Text>
      </View>

      <View style={styles.btnRow}>
        <HoldButton
          label="Add"
          icon="add"
          onPress={onAdd}
          style={styles.btnAdd}
          textStyle={styles.btnAddText}
          iconColor="#ffffff"
        />
        <HoldButton
          label="Subtract"
          icon="remove"
          onPress={onMinus}
          style={styles.btnMinus}
          textStyle={styles.btnMinusText}
          iconColor="#ffffff"
        />
      </View>

      <TouchableOpacity style={styles.btnReset} onPress={onReset} activeOpacity={0.7}>
        <Ionicons name="refresh" size={15} color="#71717a" />
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

  const press = (to: number) => {
    Animated.spring(scale, {
      toValue: to,
      speed: 28,
      bounciness: 6,
      useNativeDriver: true,
    }).start();
  };

  const start = () => {
    clearTimers();
    press(0.95);
    onPress();
    timeout.current = setTimeout(() => {
      interval.current = setInterval(onPress, 75);
    }, 340);
  };

  const stop = () => {
    press(1);
    clearTimers();
  };

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
      <TouchableOpacity style={style} onPressIn={start} onPressOut={stop} activeOpacity={0.9}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
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
          <Text style={styles.tagPillGhostText}>PARENT · index.tsx</Text>
        </View>
      </View>

      <View style={styles.stateCard}>
        <View>
          <Text style={styles.stateLabel}>STATE</Text>
          <Text style={styles.stateKey}>count</Text>
        </View>
        <Text style={styles.stateValue}>{count}</Text>
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
    backgroundColor: '#fafafa',
    padding: 20,
    paddingTop: 64,
    gap: 16,
  },

  topRow: { flexDirection: 'row' },
  tagPillGhost: {
    backgroundColor: '#f4f4f5',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagPillGhostText: { color: '#a1a1aa', fontSize: 11, fontWeight: '600', letterSpacing: 0.6 },

  stateCard: {
    backgroundColor: '#18181b',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stateLabel: { color: '#71717a', fontSize: 11, fontWeight: '700', letterSpacing: 1.4 },
  stateKey: { color: '#fafafa', fontSize: 16, fontWeight: '600', marginTop: 2 },
  stateValue: { color: '#fafafa', fontSize: 30, fontWeight: '700' },

  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 22,
    gap: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  cardHeader: { gap: 6 },
  tagPill: {
    backgroundColor: '#f4f4f5',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  tagPillText: { color: '#52525b', fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  propsLine: { color: '#a1a1aa', fontSize: 12, fontWeight: '500' },

  countArea: { alignItems: 'center', gap: 10, paddingVertical: 14 },
  metaText: { color: '#d4d4d8', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600' },
  countNum: { fontSize: 76, fontWeight: '700', lineHeight: 84, letterSpacing: -1 },

  barTrack: {
    width: '85%', height: 8,
    backgroundColor: '#f4f4f5',
    borderRadius: 100, overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 100 },
  stepHint: { fontSize: 13, fontWeight: '600' },

  btnRow: { flexDirection: 'row', gap: 10 },
  btnAdd: {
    backgroundColor: '#10b981',
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  btnAddText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  btnMinus: {
    backgroundColor: '#18181b',
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  btnMinusText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },

  btnReset: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  btnResetText: { color: '#71717a', fontSize: 13, fontWeight: '600' },
});