import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    let baseStyles = 'inline-flex items-center justify-center rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none cursor-pointer';
    
    let variantStyles = 'bg-jan-coral hover:bg-red-500 text-white shadow-md shadow-jan-coral/20';
    if (variant === 'outline') {
      variantStyles = 'border border-zinc-200 bg-white hover:bg-zinc-50 text-slate-700';
    } else if (variant === 'ghost') {
      variantStyles = 'hover:bg-zinc-100 text-slate-700';
    } else if (variant === 'link') {
      variantStyles = 'text-blue-600 underline-offset-4 hover:underline bg-transparent shadow-none';
    }

    let sizeStyles = 'px-6 py-3 text-sm';
    if (size === 'sm') {
      sizeStyles = 'px-3 py-1.5 text-xs';
    } else if (size === 'lg') {
      sizeStyles = 'px-8 py-4 text-base';
    } else if (size === 'icon') {
      sizeStyles = 'h-10 w-10 p-2';
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
