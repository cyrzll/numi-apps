import React from 'react';

export type CardColor = 'white' | 'green' | 'yellow' | 'pink' | 'blue' | 'cream';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: CardColor;
  children: React.ReactNode;
  shadowHover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  color = 'white',
  children,
  shadowHover = true,
  className = '',
  ...props
}) => {
  const getColorClass = () => {
    switch (color) {
      case 'green': return 'bg-brand-green';
      case 'yellow': return 'bg-brand-yellow';
      case 'pink': return 'bg-brand-pink';
      case 'blue': return 'bg-brand-blue';
      case 'cream': return 'bg-brand-cream';
      case 'white':
      default:
        return 'bg-white';
    }
  };

  const hoverClass = shadowHover 
    ? 'card-neobrutalism' 
    : 'border-4 border-brand-dark rounded-3xl shadow-[6px_6px_0px_0px_#1E293B]';

  return (
    <div
      className={`${hoverClass} ${getColorClass()} p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
export default Card;
