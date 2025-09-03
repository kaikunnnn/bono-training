interface HalfCircleBgProps {
  className?: string;
}

export const HalfCircleBg = ({ className = "" }: HalfCircleBgProps) => {
  return (
    <svg
      width="2000"
      height="160"
      viewBox="0 0 2000 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`block w-full ${className}`}
      style={{
        filter: 'drop-shadow(0 -2px 4px rgba(0, 0, 0, 0.04))',
        height: '160px',
        aspectRatio: '2000/160',
        objectFit: 'cover'
      }}
      preserveAspectRatio="xMidYMid slice"
    >
      <path
        d="M0 156.884C0 156.884 425 0 1000 0C1575 0 2000 156.884 2000 156.884V160H0V156.884Z"
        fill="#F7F7F7"
      />
    </svg>
  );
};