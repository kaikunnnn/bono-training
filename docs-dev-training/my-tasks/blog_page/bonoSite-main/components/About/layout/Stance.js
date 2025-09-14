import React, { useEffect, useState } from 'react';
import CardStance from '../ui/stance/cardStance';
import TitleSection from '@/components/common/layout/TitleSection';
import StanceSectionTitle from '../ui/stance/TitleSection';


const Stance = ({aboutContents}) => {
  console.log(aboutContents[0].seriesorder);
// aboutContentsをseriesOrderの値でソート
const sortedAboutContents = aboutContents.sort((a, b) => a.seriesorder - b.seriesorder);

  // Titleを定義
  const titles = aboutContents
  .filter(content => content.series?.slug === 'about')
  .map(filteredContent => filteredContent.title);

  // Titleを定義
  const explains = aboutContents
  .filter(content => content.series?.slug === 'about')
  .map(filteredContent => filteredContent.explain);

  // URL(slug)を定義
  const urls = aboutContents
  .filter(content => content.series?.slug === 'about')
  .map(filteredContent => filteredContent.slug);



    return (
      <div className="Stance flex flex-col py-24 pb-80" style={{ backgroundColor: '#F3F2EE' }}>
        <div className='mx-auto flex flex-col gap-12 lg:gap-16'>
          <StanceSectionTitle></StanceSectionTitle>
          <div className='flex w-11/12 md:w-full m-auto flex-col gap-6'>
            <CardStance 
              stanceNumber='スタンス01'
              mainTitle={<><span>あったらいいなを<br></br>つくる人を増やす</span></>}
              chapterDescription="世の中に楽しいアイデアを解き放つスキルを"
              listItems={[
                { emoji:'✌️',title: titles[0] || 'タイトルがないよ', description: explains[0], url: `/about/${urls[0]}` },
                { emoji:'✌️',title: titles[1] || 'タイトルがないよ', description: explains[1], url: `/about/${urls[1]}` },
              ]}
            />
              <CardStance 
              stanceNumber='スタンス02'
              mainTitle={<>デザインではなく<br></br>
              クリエイション</>}
              chapterDescription="デザインは手段、人にポジティブな感情を届よう"
              listItems={[
                { emoji:'✌️',title: titles[2] || 'タイトルがないよ', description: explains[2], url: `/about/${urls[2]}` },
                { emoji:'✌️',title: titles[3] || 'タイトルがないよ', description: explains[3], url: `/about/${urls[3]}` },
                { emoji:'✌️',title: titles[4] || 'タイトルがないよ', description: explains[4], url: `/about/${urls[4]}` },
                { emoji:'✌️',title: titles[5] || 'タイトルがないよ', description: explains[5], url: `/about/${urls[5]}` },
                // 他のリストアイテム...
              ]}
            />
              <CardStance 
              stanceNumber='スタンス03'
              mainTitle={<>好奇心で火を灯す</>}
              chapterDescription="正しいかどうかはどうでも良い。ウェルカム好奇心"
              listItems={[
                { emoji:'✌️',title: titles[6] || 'タイトルがないよ', description: explains[6], url: `/about/${urls[6]}` },
                { emoji:'✌️',title: titles[7] || 'タイトルがないよ', description: explains[7], url: `/about/${urls[7]}` },
                { emoji:'✌️',title: titles[8] || 'タイトルがないよ', description: explains[8], url: `/about/${urls[8]}` },
                { emoji:'✌️',title: titles[9] || 'タイトルがないよ', description: explains[9], url: `/about/${urls[9]}` },
              ]}
            />
          </div>

          
        </div>
    </div>
    );
}

export default Stance;