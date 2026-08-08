import { MotiView } from 'moti';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, radii, type } from '../theme';

export interface GooeyInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
}

export function GooeyInput({ label, error, onFocus, onBlur, ...props }: GooeyInputProps) {
  const [focused, setFocused] = useState(false);
  const ring = error ? colors.error : focused ? colors.primary : colors.lineStrong;

  return (
    <View style={{ alignSelf: 'stretch' }}>
      <Text style={styles.label}>{label}</Text>
      <MotiView
        animate={{ borderColor: ring, borderWidth: focused || !!error ? 2 : 1.5 }}
        style={styles.field}
      >
        <TextInput
          {...props}
          style={styles.input}
          placeholderTextColor={colors.textTertiary}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        />
      </MotiView>
      {error ? <Text style={styles.err}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { ...type.caption, color: colors.textSecondary, marginBottom: 6, marginLeft: 4 },
  field: {
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  input: {
    ...type.body,
    color: colors.text,
    paddingVertical: 0,
  },
  err: { ...type.caption, color: colors.error, marginLeft: 6, marginTop: 6 },
});
