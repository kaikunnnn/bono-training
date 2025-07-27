interface HalfCircleBgProps {
  className?: string;
}

export const HalfCircleBg = ({ className = "" }: HalfCircleBgProps) => {
  return (
    <svg
      width="1440"
      height="160"
      viewBox="0 0 1440 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`block w-full h-full object-cover ${className}`}
      style={{
        filter: 'drop-shadow(0 -2px 4px rgba(0, 0, 0, 0.04))'
      }}
    >
      <path
        d="M0 156.884C0 156.884 305.601 -2.14854e-10 735.5 0C1165.4 2.14854e-10 1440 156.884 1440 156.884V160H0V156.884Z"
        fill="#F7F7F7"
      />
    </svg>
  );
};