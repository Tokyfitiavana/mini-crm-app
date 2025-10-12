import React from 'react';

// Définition des propriétés pour le bouton
interface CallToActionBtnProps {
  label: string;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string; // pour ajouter des classes supplémentaires si nécessaire
}

const CallToActionBtn: React.FC<CallToActionBtnProps> = ({
  label,
  variant = 'primary',
  icon,
  onClick,
  href,
  className = '',
}) => {
  // Styles de base communs
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition duration-300 px-6 py-3 shadow-md';

  // Styles spécifiques au variant
  const variantClasses = {
    primary: 'bg-[#A78BFA] text-white hover:bg-[#8F6FEF] focus:outline-none focus:ring-2 focus:ring-[#A78BFA] focus:ring-offset-2',
    secondary: 'bg-white text-[#A78BFA] border border-[#A78BFA] hover:bg-[#EDE5FF] focus:outline-none focus:ring-2 focus:ring-[#A78BFA]',
  };

  const Component = href ? 'a' : 'button';

  return (
    <Component
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      href={href}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </Component>
  );
};

export default CallToActionBtn;
