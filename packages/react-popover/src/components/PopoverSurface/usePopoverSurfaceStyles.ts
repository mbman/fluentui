import { macros, makeStyles, mergeClasses } from '@fluentui/react-make-styles';
import type { PopoverSize } from '../Popover/Popover.types';
import type { PopoverSurfaceState } from './PopoverSurface.types';

export const popoverSurfaceClassName = 'fui-PopoverSurface';

export const arrowHeights: Record<PopoverSize, number> = {
  small: 6,
  medium: 8,
  large: 8,
};

/**
 * Styles for the root slot
 */
const useStyles = makeStyles({
  root: theme => ({
    backgroundColor: theme.colorNeutralBackground1,
    boxShadow: theme.shadow16,
    ...macros.borderRadius('top', '4px'),
    ...macros.borderRadius('left', '4px'),
    ...macros.borderRadius('right', '4px'),
    ...macros.borderRadius('bottom', '4px'),
    ...macros.border('1px', 'solid', theme.colorTransparentStroke),
  }),

  inverted: theme => ({
    // TODO: neutral background inverted missing from superset and theme
    backgroundColor: theme.colorNeutralForeground1,
    color: theme.colorNeutralForegroundInverted,
  }),

  brand: theme => ({
    backgroundColor: theme.colorBrandBackground,
    // TODO: clarify with designers what foreground color should be with brand background,
    color: theme.colorNeutralForegroundInverted,
  }),

  smallPadding: () => ({
    ...macros.padding('12px'),
  }),

  mediumPadding: () => ({
    ...macros.padding('16px'),
  }),

  largePadding: () => ({
    ...macros.padding('20px'),
  }),

  smallArrow: () => ({
    width: `${Math.SQRT2 * arrowHeights.small}px`,
    height: `${Math.SQRT2 * arrowHeights.small}px`,
  }),

  mediumLargeArrow: () => ({
    width: `${Math.SQRT2 * arrowHeights.medium}px`,
    height: `${Math.SQRT2 * arrowHeights.medium}px`,
  }),

  // TODO dedupe these styles with tooltip
  arrow: theme => ({
    position: 'absolute',
    backgroundColor: 'inherit',
    visibility: 'hidden',
    zIndex: -1,

    ':before': {
      content: '""',
      ...macros.borderRadius('top', '4px'),
      ...macros.borderRadius('left', '4px'),
      ...macros.borderRadius('right', '4px'),
      ...macros.borderRadius('bottom', '4px'),
      borderBottomRightRadius: theme.borderRadiusSmall,
      position: 'absolute',
      width: 'inherit',
      height: 'inherit',
      backgroundColor: 'inherit',
      visibility: 'visible',
      transform: 'rotate(var(--angle)) translate(0, 50%) rotate(45deg)',
    },

    // Popper sets data-popper-placement on the root element, which is used to align the arrow
    ':global([data-popper-placement^="top"])': { bottom: 0, '--angle': '0' },
    ':global([data-popper-placement^="right"])': { left: 0, '--angle': '90deg' },
    ':global([data-popper-placement^="bottom"])': { top: 0, '--angle': '180deg' },
    ':global([data-popper-placement^="left"])': { right: 0, '--angle': '270deg' },
  }),
});

/**
 * Apply styling to the PopoverSurface slots based on the state
 */
export const usePopoverSurfaceStyles = (state: PopoverSurfaceState): PopoverSurfaceState => {
  const styles = useStyles();
  state.root.className = mergeClasses(
    popoverSurfaceClassName,
    styles.root,
    state.size === 'small' && styles.smallPadding,
    state.size === 'medium' && styles.mediumPadding,
    state.size === 'large' && styles.largePadding,
    state.appearance === 'inverted' && styles.inverted,
    state.appearance === 'brand' && styles.brand,
    state.root.className,
  );

  state.arrowClassName = mergeClasses(
    styles.arrow,
    state.size === 'small' ? styles.smallArrow : styles.mediumLargeArrow,
  );

  return state;
};
