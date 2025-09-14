import React from 'react';
import ListStance from './listStance';
import TitleStance from './titleStance';

function CardStance(props) {
  // listItems propsを使用して、ListStanceコンポーネントを動的に生成
  const { listItems = [] } = props; // listItemsにデフォルト値を設定

  return (
    <div className='Card border w-full mx-auto md:m-auto lg:max-w-[560px]  border-solid border-gray-900 bg-white'>
        <TitleStance
            stanceNumber={props.stanceNumber}
            stanceTitle={props.stanceTitle}
            mainTitle={props.mainTitle}
            chapterDescription={props.chapterDescription}
        />
        <div className='px-8 pt-8 lg:px-16 pb-12 w-full flex-col justify-center items-start inline-flex'>
        {listItems.map((item, index) => (
        <ListStance 
          key={index}
          emoji={item.emoji}
          title={item.title} 
          description={item.description}
          url={item.url}
          isLast={index === listItems.length - 1} // 最後のアイテムの場合に true を設定
        />
      ))}
        </div>
      
    </div>
  );
}

export default CardStance;