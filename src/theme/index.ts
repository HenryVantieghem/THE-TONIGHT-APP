/**
 * Scena - Theme Export
 * Liquid Glass Design System
 */

export { colors, gradients } from './colors';
export { typography, textStyles } from './typography';
export { spacing, borderRadius, shadows, hitSlop } from './spacing';
export {
  durations,
  easings,
  springConfigs,
  animationPresets,
  haptics
} from './animations';

// Consolidated theme object
import { colors, gradients } from './colors';
import { typography, textStyles } from './typography';
import { spacing, borderRadius, shadows, hitSlop } from './spacing';
import { durations, easings, springConfigs, animationPresets, haptics } from './animations';

const theme = {
  colors,
  gradients,
  typography,
  textStyles,
  spacing,
  borderRadius,
  shadows,
  hitSlop,
  durations,
  easings,
  springConfigs,
  animationPresets,
  haptics,
};

export type Theme = typeof theme;

export default theme;
