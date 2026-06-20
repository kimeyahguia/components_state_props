import { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/* ─────────────────────────────────────────────────────────
   HoldButton
   Generic press-and-hold wrapper used by AddButton & MinusButton.
   Tap once → fires immediately. Hold → keeps firing every 75ms
   after a 340ms delay. Adds a cartoony "squash" animation on press.
   ───────────────────────────────────────────────────────── */
export function HoldButton({
  label, icon, onPress, style, textStyle, iconColor,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  style: object;
  textStyle: object;
  iconColor: string;
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

  // Safety net: if the component unmounts mid-hold (e.g. navigating
  // away), kill any running interval so it can't keep firing setState
  // into a dead tree — that's what was freezing the app.
  useEffect(() => clearTimers, []);

  const squash = (to: number) => {
    Animated.spring(scale, {
      toValue: to,
      speed: 30,
      bounciness: 14,
      useNativeDriver: true,
    }).start();
  };

  const start = () => {
    clearTimers(); // guard against overlapping presses stacking intervals
    squash(0.92);
    onPress();
    timeout.current = setTimeout(() => {
      interval.current = setInterval(onPress, 75);
    }, 340);
  };

  const stop = () => {
    squash(1);
    clearTimers();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={style}
        onPressIn={start}
        onPressOut={stop}
        activeOpacity={0.85}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
        <Text style={textStyle}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

/* ─────────────────────────────────────────────────────────
   AddButton
   Holdable "+1" button with a bouncy, candy-green cartoon style.
   ───────────────────────────────────────────────────────── */
export function AddButton({ onPress }: { onPress: () => void }) {
  return (
    <HoldButton
      label="Add Count"
      icon="add-circle"
      onPress={onPress}
      style={btnStyles.btnAdd}
      textStyle={btnStyles.btnAddText}
      iconColor="#065f46"
    />
  );
}

/* ─────────────────────────────────────────────────────────
   MinusButton
   Holdable "-1" button with a punchy, candy-red cartoon style.
   ───────────────────────────────────────────────────────── */
export function MinusButton({ onPress }: { onPress: () => void }) {
  return (
    <HoldButton
      label="Minus Count"
      icon="remove-circle"
      onPress={onPress}
      style={btnStyles.btnMinus}
      textStyle={btnStyles.btnMinusText}
      iconColor="#991b1b"
    />
  );
}

/* ─────────────────────────────────────────────────────────
   ResetButton
   Single-tap reset. Spins the refresh icon on press for a
   playful "rewind" feel, no hold-repeat needed.
   ───────────────────────────────────────────────────────── */
export function ResetButton({ onPress }: { onPress: () => void }) {
  const spin = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    spin.setValue(0);
    Animated.parallel([
      Animated.timing(spin, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.spring(scale, { toValue: 0.9, speed: 40, bounciness: 10, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, speed: 20, bounciness: 14, useNativeDriver: true }),
      ]),
    ]).start();
    onPress();
  };

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity style={btnStyles.btnReset} onPress={handlePress} activeOpacity={0.8}>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons name="refresh" size={16} color="#7c5e10" />
        </Animated.View>
        <Text style={btnStyles.btnResetText}>Reset Count</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

/* ─────────────────────────────────────────────────────────
   ButtonRow
   Convenience grouping of Add / Minus / Reset, mirroring the
   original `btnRow` layout so HomeScreen can stay tiny.
   ───────────────────────────────────────────────────────── */
export function ButtonRow({
  onAdd, onMinus, onReset,
}: {
  onAdd: () => void;
  onMinus: () => void;
  onReset: () => void;
}) {
  return (
    <View style={btnStyles.btnRow}>
      <AddButton onPress={onAdd} />
      <MinusButton onPress={onMinus} />
      <ResetButton onPress={onReset} />
    </View>
  );
}

const btnStyles = StyleSheet.create({
  btnRow: { gap: 12 },

  btnAdd: {
    backgroundColor: '#6ee7b7',
    borderWidth: 3,
    borderColor: '#047857',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  btnAddText: { color: '#065f46', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },

  btnMinus: {
    backgroundColor: '#fca5a5',
    borderWidth: 3,
    borderColor: '#b91c1c',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#b91c1c',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  btnMinusText: { color: '#7f1d1d', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },

  btnReset: {
    backgroundColor: '#fde68a',
    borderWidth: 3,
    borderColor: '#b45309',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#b45309',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  btnResetText: { color: '#7c5e10', fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
});