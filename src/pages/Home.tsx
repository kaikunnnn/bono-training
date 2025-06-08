import React from 'react';
import Layout from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UsecaseItem from '@/components/home/UsecaseItem';

const Home: React.FC = () => {
  return (
    <Layout>
      <section className="relative overflow-hidden py-12">
        <div className="container flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-2">
            <img
              src="https://cdn.prod.website-files.com/601a66c348d38c1c180fd166/682edac34c70571c302f6bf6_image-64.png"
              alt=""
              className="h-6 w-auto"
            />
            <span className="text-sm font-semibold">デザインに取り組んでます👌</span>
          </div>
          <h1 className="text-3xl font-bold sm:text-5xl">
            すべての人に創造性の夜明けを。
          </h1>
          <p className="max-w-xl text-base text-muted-foreground">
            ボノは転職実績のある実践的なコースカリキュラムを提供するデザインでより良い社会を実現したい人のための学習サービスです
          </p>
          <Button asChild size="lg">
            <Link to="/plan" className="inline-flex items-center gap-2">
              BONOをはじめる
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="container mt-12 grid gap-6 md:grid-cols-3">
          <UsecaseItem
            href="/rdm/roadmap-uiuxdesigner"
            imageSrc="https://cdn.prod.website-files.com/601a66c348d38c1c180fd166/6840f6996f059801149f6c6e_roadmap-thumbnail.webp"
            title="UI/UXデザイナーになるロードマップ"
            features={[
              '転職実績のある学習ロードマップ!',
              'UI/UXの3つの基礎を身につけます',
              'ポートフォリオ作成がゴールです',
            ]}
            cta="転職ロードマップへ"
          />
          <UsecaseItem
            href="/rdm/ux-beginner"
            imageSrc="https://cdn.prod.website-files.com/601a66c348d38c1c180fd166/66d11ddba9bf28d776f304e0_Course%20LP%20Eyecatch%20(1).jpg"
            title="UXデザイン基礎コース"
            features={[
              '顧客理解から課題解決の基礎を身につけます',
              'プロダクトデザインに必須な価値デザインを習得',
            ]}
            cta="コースを見る"
          />
          <UsecaseItem
            href="/usecase/webdesigner-to-uiuxdesigner"
            imageSrc="https://cdn.prod.website-files.com/601a66c348d38c1c180fd166/680b419dd56e984175711449_usecase-thumbnail-webdesigner.jpg"
            title="WebデザイナーからUI/UXへ転職"
            features={[
              'WebとUIUXは何が違うのか？',
              '身につけるべきスキルべきスキル',
              'スキル習得ロードマップ',
            ]}
            cta="転職ロードマップへ"
          />
        </div>

        <img
          src="https://cdn.prod.website-files.com/601a66c348d38c1c180fd166/674a69105402e778288429aa_Ellipse%201.svg"
          alt=""
          className="pointer-events-none absolute top-0 right-0 w-40 opacity-50 md:w-64"
        />
      </section>
    </Layout>
  );
};

export default Home;
