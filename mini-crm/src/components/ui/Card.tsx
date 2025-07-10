import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string; // Permet d'ajouter des classes Tailwind supplémentaires
}

const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`bg-dark-card rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;