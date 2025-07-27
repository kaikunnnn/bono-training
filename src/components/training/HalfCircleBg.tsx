interface HalfCircleBgProps {
  className?: string;
}

export const HalfCircleBg = ({ className = "" }: HalfCircleBgProps) => {
  return (
    <svg
      width="1440"
      height="80"
      viewBox="0 0 1440 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`block w-full h-full object-cover ${className}`}
      style={{
        filter: 'drop-shadow(0 -2px 4px rgba(0, 0, 0, 0.04))'
      }}
    >
      <path
        d="M0 76.884C0 76.884 305.601 0 735.5 0C1165.4 0 1440 76.884 1440 76.884V80H0V76.884Z"
        fill="#F7F7F7"
      />
    </svg>
  );
};