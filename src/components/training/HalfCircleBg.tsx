interface HalfCircleBgProps {
  className?: string;
}

export const HalfCircleBg = ({ className = "" }: HalfCircleBgProps) => {
  return (
    <svg
      width="1440"
      height="4"
      viewBox="0 0 1440 4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`block w-full h-full object-cover ${className}`}
      style={{
        filter: 'drop-shadow(0 -2px 4px rgba(0, 0, 0, 0.04))'
      }}
    >
      <path
        d="M0 0.884C0 0.884 305.601 -2.14854e-10 735.5 -3.116C1165.4 2.14854e-10 1440 0.884 1440 0.884V4H0V0.884Z"
        fill="#F7F7F7"
      />
    </svg>
  );
};