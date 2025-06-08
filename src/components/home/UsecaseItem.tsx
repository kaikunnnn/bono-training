import React from 'react';
import { Link } from 'react-router-dom';

interface UsecaseItemProps {
  href: string;
  imageSrc: string;
  title: string;
  features: string[];
  cta: string;
}

const UsecaseItem: React.FC<UsecaseItemProps> = ({ href, imageSrc, title, features, cta }) => {
  return (
    <Link
      to={href}
      className="useca-item flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-transform hover:scale-105"
    >
      <img src={imageSrc} alt="" className="h-56 w-full object-cover" />
      <div className="flex flex-1 flex-col justify-between gap-4 p-4">
        <div className="space-y-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <ul className="space-y-2 text-sm">
            {features.map((text, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 flex-none rounded-full bg-primary" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <div className="button-style-3 inline-flex rounded-md bg-muted px-3 py-1 text-sm font-semibold">
            {cta}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default UsecaseItem;
