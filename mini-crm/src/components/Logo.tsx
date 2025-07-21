const ApexLogo = ({ className = "" }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="250"
      height="65"
      viewBox="0 0 200 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10 40 L25 10 L40 40 L32.5 28 L17.5 28 Z" fill="#8B5CF6" />
      <circle cx="25" cy="8" r="4" fill="#F97316" />
      <text
        x="55"
        y="36"
        fontFamily="Poppins, sans-serif"
        fontSize="30"
        fontWeight="600"
        fill="#111827"
        className="dark:fill-white"
      >
        Apex
      </text>
      <text
        x="135"
        y="36"
        fontFamily="Poppins, sans-serif"
        fontSize="30"
        fontWeight="400"
        fill="#6B7280"
        className="dark:fill-gray-400"
      >
        CRM
      </text>
    </svg>
  );
};

export default ApexLogo;
