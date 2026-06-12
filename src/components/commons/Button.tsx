import type { FC } from 'react';
import { cn } from '../../utils/functions';
import { mergeProps, useRender } from '@base-ui/react';

const variants = {
  primary: 'bg-secondary text-text hover:bg-hover hover:text-text-hover',
  ghost: 'hover:bg-hover text-text hover:text-text-hover',
  outlined:
    'border border-text/30 text-text hover:bg-hover hover:text-text-hover',
  danger: 'bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-900',
};

const sizes = {
  sm: 'h-8 min-w-8 gap-1.5 px-3 text-sm has-[>svg:only-child]:w-8 has-[>svg:only-child]:px-0 [&_svg]:size-4',
  md: 'h-10 min-w-10 gap-2 px-4 text-md has-[>svg:only-child]:w-10 has-[>svg:only-child]:px-0 [&_svg]:size-8',
  lg: 'h-12 min-w-12 gap-2.5 px-5 text-xl has-[>svg:only-child]:w-12 has-[>svg:only-child]:px-0 [&_svg]:size-10',
};

interface Props extends useRender.ComponentProps<'button'> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  nativeButton?: boolean;
}

export const Button: FC<Props> = ({
  variant = 'primary',
  size = 'md',
  nativeButton = true,
  render,
  className,
  ...props
}) => {
  const defaultProps: useRender.ElementProps<'button'> = {
    className: cn(
      variants[variant],
      sizes[size],
      'inline-flex cursor-pointer items-center justify-center rounded font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
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
