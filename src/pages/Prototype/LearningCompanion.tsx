import React, { useState } from 'react';
import { CheckCircle2, MessageCircle, Sparkles, ChevronRight, ThumbsUp, ArrowUp, RotateCcw, Users, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// プロトタイプ: 学習コンパニオン機能
// URL: /prototype/learning-companion
// ============================================

type Screen = 'overview' | 'checkpoint' | 'checkpoint-question' | 'checkpoint-result' | 'threads' | 'thread-detail';

const MOCK_AI_FEEDBACK = `その理解で合っています！

補足すると、タイポグラフィの「対比」は読みやすさだけでなく**情報の優先度**を視覚的に伝えるためのツールです。

たとえば：
- 見出し（大・太）→ 本文（小・細）の対比 → どこから読むべきかが伝わる
- 同じ大きさ・太さが続く → 全部が同じ重要度に見えて読み疲れる

次のQuest「レイアウト」でも同じ「対比の原則」が登場するので、このまま進んでみてください。`;

const MOCK_QUESTIONS = [
  { id: 1, text: '配色の比率って絶対60:30:10？', agrees: 17, hasAI: true, preview: '絶対ではありません。60:30:10はあくまで目安で...' },
  { id: 2, text: '彩度を下げすぎると逆に見づらくなりますが、基準はありますか？', agrees: 8, hasAI: true, preview: 'おっしゃる通りで、彩度0（グレー）に近づきすぎると...' },
  { id: 3, text: '補色は実案件で使いにくい気がするのですが、どう使いますか？', agrees: 3, hasAI: false, preview: '' },
];

export default function LearningCompanionPrototype() {
  const [screen, setScreen] = useState<Screen>('overview');
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [agreed, setAgreed] = useState<number[]>([]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="font-bold text-gray-900">BONO</span>
          <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">プロトタイプ</span>
        </div>
        {screen !== 'overview' && (
          <button onClick={() => { setScreen('overview'); setAnswer(''); setSubmitted(false); }} className="text-sm text-gray-500 hover:text-gray-900">
            ← 一覧に戻る
          </button>
        )}
      </div>

      {/* ===== 概要画面 ===== */}
      {screen === 'overview' && (
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="mb-8">
            <p className="text-xs font-medium text-violet-600 mb-2 uppercase tracking-wide">Product Proposal</p>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">学習コンパニオン機能</h1>
            <p className="text-gray-600 leading-relaxed">
              「このやり方で合っているのか」という自己学習中の不安を解消し、<br />
              BONOの継続率を向上させる2つの機能のプロトタイプです。
            </p>
          </div>

          {/* 課題 */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
            <p className="text-sm font-semibold text-amber-800 mb-3">📌 解決する課題</p>
            <div className="space-y-2">
              {[
                '学習中「この理解で合っているか」を確認する手段がない',
                '同じ疑問を持つ仲間がいるか分からず孤独感を感じる',
                '1人運営では全ユーザーにフィードバックを返せない',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-amber-900">
                  <span className="mt-0.5 text-amber-500">✗</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* 2つの機能 */}
          <div className="space-y-4 mb-8">
            <button
              onClick={() => setScreen('checkpoint')}
              className="w-full text-left bg-white rounded-2xl border border-gray-200 p-5 hover:border-violet-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">Phase 1: AIチェックポイント</p>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">優先度 高</span>
                    </div>
                    <p className="text-sm text-gray-600">Quest完了後にAIが理解を確認。「合ってる」という確信を与える。</p>
                    <p className="text-xs text-gray-400 mt-1">実装: 2〜3日 / 追加コスト: なし</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-violet-500 transition-colors flex-shrink-0 mt-1" />
              </div>
            </button>

            <button
              onClick={() => setScreen('threads')}
              className="w-full text-left bg-white rounded-2xl border border-gray-200 p-5 hover:border-violet-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">Phase 2: 質問スレッド</p>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">優先度 中</span>
                    </div>
                    <p className="text-sm text-gray-600">Quest単位の質問掲示板。AIが即時回答、同じ疑問に共感できる。</p>
                    <p className="text-xs text-gray-400 mt-1">実装: 5〜7日 / 追加コスト: ほぼなし</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-violet-500 transition-colors flex-shrink-0 mt-1" />
              </div>
            </button>
          </div>

          {/* KPI */}
          <div className="bg-gray-900 rounded-2xl p-5 text-white">
            <p className="text-sm font-semibold text-gray-400 mb-4">期待効果</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: '30日継続率', value: '+15〜20%', sub: 'Phase 1実装後' },
                { label: '学習中の不安', value: '↓ 大幅減', sub: '確認手段ができる' },
                { label: '追加コスト', value: '¥0', sub: 'Groq無料枠内' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <p className="text-xl font-bold text-white">{item.value}</p>
                  <p className="text-xs text-gray-300 mt-1">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== AIチェックポイント: Quest完了画面 ===== */}
      {screen === 'checkpoint' && (
        <div className="max-w-lg mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Quest完了ヘッダー */}
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-6 text-white text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-white/90" />
              <h2 className="text-lg font-bold">Quest 2 完了！</h2>
              <p className="text-sm text-white/80 mt-1">「タイポグラフィ基礎」</p>
            </div>

            {/* チェックポイント提案 */}
            <div className="p-6">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                  AI
                </div>
                <div className="bg-gray-50 rounded-2xl rounded-tl-sm p-4 flex-1">
                  <p className="text-sm text-gray-800 leading-relaxed">
                    おつかれさまでした！<br />
                    AIに理解を確認してもらいませんか？自分の言葉で説明することで、理解が定着します。
                  </p>
                  <div className="mt-3 space-y-1.5">
                    {['回答はあなただけが見えます', '2〜3分で完了', 'いつでもスキップできます'].map((t, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="text-green-500">✓</span> {t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setScreen('checkpoint-question')}
                className="w-full bg-gray-900 text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-800 transition-colors mb-3"
              >
                <Sparkles className="w-4 h-4 inline mr-2" />
                AIチェックを受ける
              </button>
              <button
                onClick={() => setScreen('overview')}
                className="w-full text-gray-400 text-sm py-2 hover:text-gray-600 transition-colors"
              >
                スキップして次へ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== AIチェックポイント: 質問画面 ===== */}
      {screen === 'checkpoint-question' && (
        <div className="max-w-lg mx-auto px-4 py-10 flex flex-col" style={{ minHeight: 'calc(100vh - 57px)' }}>
          <div className="flex-1 space-y-4">
            {/* Quest情報 */}
            <div className="text-center mb-4">
              <p className="text-xs text-gray-400">Quest 2 「タイポグラフィ基礎」の理解確認</p>
            </div>

            {/* AI質問 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                AI
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm border border-gray-200 p-4 flex-1">
                <p className="text-sm text-gray-800 leading-relaxed">
                  「フォントの対比」について、あなたが理解したことを自分の言葉で説明してみてください。
                  <br /><br />
                  <span className="text-gray-400 text-xs">正解・不正解はありません。気づいたことをそのまま書いてみてください。</span>
                </p>
              </div>
            </div>

            {/* ユーザー回答欄 */}
            {!submitted ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="例）大きいフォントと小さいフォントを組み合わせることで、どこが重要かが伝わりやすくなる…"
                  rows={4}
                  className="w-full text-sm text-gray-800 placeholder:text-gray-400 resize-none outline-none leading-relaxed"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => setSubmitted(true)}
                    disabled={!answer.trim()}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                      answer.trim() ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    )}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                    送信
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* ユーザーの回答 */}
                <div className="flex justify-end">
                  <div className="bg-gray-900 text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-xs text-sm">
                    {answer}
                  </div>
                </div>

                {/* AIフィードバック */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                    AI
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm border border-gray-200 p-4 flex-1">
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{MOCK_AI_FEEDBACK}</p>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setScreen('overview')}
                        className="w-full bg-gray-900 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
                      >
                        次のQuestへ進む →
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===== 質問スレッド: 一覧 ===== */}
      {screen === 'threads' && (
        <div className="max-w-lg mx-auto px-4 py-6">
          {/* Quest情報 */}
          <div className="mb-5">
            <p className="text-xs text-gray-400 mb-1">UIデザイン見た目のきほん</p>
            <h2 className="text-lg font-bold text-gray-900">Quest 1「色のきほん」の質問</h2>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Users className="w-3.5 h-3.5" />
                <span>35人が学習中</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>12件の質問</span>
              </div>
            </div>
          </div>

          {/* 質問リスト */}
          <div className="space-y-3 mb-6">
            {MOCK_QUESTIONS.map((q) => (
              <button
                key={q.id}
                onClick={() => setScreen('thread-detail')}
                className="w-full text-left bg-white rounded-2xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-2">{q.text}</p>
                    {q.hasAI && (
                      <p className="text-xs text-gray-500 line-clamp-1">{q.preview}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setAgreed(prev => prev.includes(q.id) ? prev.filter(id => id !== q.id) : [...prev, q.id]); }}
                        className={cn(
                          'flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors',
                          agreed.includes(q.id) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                        )}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        同じ疑問 {q.agrees + (agreed.includes(q.id) ? 1 : 0)}人
                      </button>
                      {q.hasAI && (
                        <span className="flex items-center gap-1 text-xs text-violet-600">
                          <Sparkles className="w-3 h-3" />
                          AI回答あり
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </div>

          {/* 質問投稿ボタン */}
          <button className="w-full border-2 border-dashed border-gray-300 rounded-2xl py-4 text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors">
            + 質問を投稿する（匿名OK）
          </button>
        </div>
      )}

      {/* ===== 質問スレッド: 詳細 ===== */}
      {screen === 'thread-detail' && (
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <ThumbsUp className="w-3 h-3" />
                同じ疑問 17人
              </span>
            </div>
            <h2 className="text-base font-bold text-gray-900">
              配色の比率って絶対60:30:10？
            </h2>
          </div>

          <div className="space-y-4">
            {/* AI回答 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                AI
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm border border-gray-200 p-4 flex-1">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                  <span className="text-xs font-medium text-violet-600">AI回答</span>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">
                  絶対ではありません。60:30:10はあくまで「迷ったときの目安」です。<br /><br />
                  重要なのは<strong>「支配色・補助色・アクセント色の役割を意識すること」</strong>であって、比率の数字に縛られる必要はありません。<br /><br />
                  実案件では「このデザインが伝えたい世界観」に合わせて柔軟に調整します。BONOの<strong>「配色パターンの作り方」</strong>の記事で実例を確認してみてください。
                </p>
              </div>
            </div>

            {/* ユーザーコメント */}
            <div className="flex items-start gap-3 pl-11">
              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-500">
                K
              </div>
              <div className="bg-gray-50 rounded-2xl rounded-tl-sm p-3 flex-1">
                <p className="text-xs text-gray-500 mb-1">先輩ユーザー · 3日前</p>
                <p className="text-sm text-gray-700">
                  私も最初ここで迷いました。実際に作品を作りながら「なんか窮屈だな」と感じたら比率を変えていくといいと思います。
                </p>
              </div>
            </div>

            {/* 返信入力 */}
            <div className="flex items-end gap-2 pl-4 mt-4">
              <div className="flex-1 bg-white border border-gray-200 rounded-2xl px-4 py-2.5">
                <input
                  type="text"
                  placeholder="返信を書く..."
                  className="w-full text-sm text-gray-800 placeholder:text-gray-400 outline-none bg-transparent"
                />
              </div>
              <button className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                <ArrowUp className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
