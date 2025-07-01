// src/components/ui/button.jsx
import React from 'react';

const buttonVariants = {
  default: 'bg-blue-600 text-white hover:bg-blue-700',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
  outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700',
  ghost: 'hover:bg-gray-100',
  link: 'text-blue-600 hover:underline',
};

const buttonSizes = {
  default: 'h-10 py-2 px-4',
  sm: 'h-9 px-3',
  lg: 'h-11 px-8',
};

const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={[
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400',
          'disabled:opacity-50 disabled:pointer-events-none',
          buttonVariants[variant],
          buttonSizes[size],
          className,
        ].join(' ')}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };