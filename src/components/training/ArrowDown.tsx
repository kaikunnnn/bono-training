import React from 'react';

interface ArrowDownProps {
  className?: string;
}

const ArrowDown: React.FC<ArrowDownProps> = ({ className = '' }) => {
  return (
    <div className={`w-5 h-5 flex items-center justify-center ${className}`}>
      <svg
        width="15"
        height="16"
        viewBox="0 0 15 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.36397 0.999939V13.4406L12.3633 8.44127L13.4561 9.53404L7.36397 15.6262L1.27182 9.53404L2.36459 8.44127L7.36397 13.4406V0.999939H7.36397Z"
          fill="#000000"
        />
      </svg>
    </div>
  );
};

export default ArrowDown;