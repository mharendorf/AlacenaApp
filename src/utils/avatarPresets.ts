import { AvatarPreset } from '../features/household/types';
import { colors } from '../theme/tokens';

export const AVATAR_PRESETS: { key: AvatarPreset; bg: string; fg: string; letter: string }[] = [
  { key: 'a', bg: colors.accentRamp[200], fg: colors.accentRamp[700], letter: 'C' },
  { key: 'b', bg: colors.accent2Ramp[200], fg: colors.accent2Ramp[700], letter: 'H' },
  { key: 'c', bg: '#d1edfb', fg: '#004964', letter: 'M' },
  { key: 'd', bg: '#f3e1f7', fg: '#55335d', letter: 'F' },
  { key: 'e', bg: colors.neutral[200], fg: colors.neutral[700], letter: 'L' },
];

export function getAvatarPreset(key: AvatarPreset | null) {
  return AVATAR_PRESETS.find((p) => p.key === key) ?? null;
}
