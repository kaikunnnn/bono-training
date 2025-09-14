import React from 'react';

function ListStance(props) {
  const { title, description, url, isLast,emoji } = props;

  return (
    <div class="List py-6 lg:py-8 border-b w-full border-neutral-900 border-opacity-10 flex-col justify-start items-start gap-2 inline-flex" style={{ borderBottom: isLast ? 'none' : '1px solid #ddd' }}>
        <div class="text-neutral-900 text-opacity-80 text-xl lg:text-xxl font-bold font-['Hind'] leading-snug">
          {emoji}
          </div>
        <div >
            <a class="self-stretch text-neutral-900 text-xl lg:text-xl font-bold underline leading-relaxed tracking-wide" href={url}>
            {title}
             </a>
        </div>
        <div class="self-stretch text-neutral-900 text-opacity-60 text-sm font-normalleading-snug tracking-wide">{description}</div>
    </div>
  );
}

export default ListStance;