import type { FC } from 'react';
import { mergeProps, useRender } from '@base-ui/react';
import { cn } from '../../utils/functions';

const variants = {
  primary: {
    base: 'bg-accent text-primary border-4 border-border/70 raised',
    hover: 'hover:bg-accent-hover hover:text-primary',
  },
  ghost: {
    base: 'text-text',
    hover: 'hover:text-info',
  },
  outlined: {
    base: 'border-4 border-border/45 bg-panel text-text',
    hover: 'hover:bg-hover hover:text-text-hover',
  },
  danger: {
    base: 'bg-danger-soft text-danger border-4 border-danger/60',
    hover: 'hover:bg-danger hover:text-primary',
  },
};

const sizes = {
  sm: 'h-8 min-w-8 gap-1.5 px-3 text-sm has-[>svg:only-child]:w-8 has-[>svg:only-child]:px-0 [&_svg]:size-6',
  md: 'h-10 min-w-10 gap-2 px-4 text-md has-[>svg:only-child]:w-10 has-[>svg:only-child]:px-0 [&_svg]:size-8',
  lg: 'h-12 min-w-12 gap-2.5 px-5 text-xl has-[>svg:only-child]:w-12 has-[>svg:only-child]:px-0 [&_svg]:size-10',
  xl: 'h-14 min-w-14 gap-3 px-6 text-2xl has-[>svg:only-child]:w-14 has-[>svg:only-child]:px-0 [&_svg]:size-14',
};

interface Props extends useRender.ComponentProps<'button'> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  nativeButton?: boolean;
  disableHover?: boolean;
}

export const Button: FC<Props> = ({
  variant = 'primary',
  size = 'md',
  nativeButton = true,
  disableHover = false,
  render,
  className,
  ...props
}) => {
  const defaultProps: useRender.ElementProps<'button'> = {
    className: cn(
      variants[variant].base,
      !disableHover && variants[variant].hover,
      sizes[size],
      'app-button',
      className,
    ),
    ...(nativeButton ? { type: 'button' } : {}),
  };

  return useRender({
    defaultTagName: 'button',
    render,
    props: mergeProps<'button'>(defaultProps, props),
  });
};
