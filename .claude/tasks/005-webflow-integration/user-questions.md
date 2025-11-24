# Webflow CMS統合 - ユーザーへの質問

## 質問の目的

Webflow CMSとSanity CMSの統合を実装するために、以下の情報が必要です。
これらの情報を元に、最適な実装方法を決定し、POC（概念実証）を作成します。

---

## 📋 必須情報

### 1. Webflowプロジェクト情報

#### Q1-1: WebflowサイトのURL
現在使用しているWebflowサイトのURLを教えてください。

**例**: `https://your-site.webflow.io`
→ https://bonoo.webflow.io/

#### Q1-2: Webflow API アクセストークン
Webflow CMS APIにアクセスするためのトークンが必要です。
→YES俺は持っているしチャットにシークレットで貼ったよ

**質問**: APIトークンをお持ちですか？
- [✅️] はい、持っています → トークンを安全に共有してください（Supabase Secretsに保存します）
- [ ] いいえ、これから取得します → 取得方法をサポートします
- [ ] わかりません → 一緒に確認しましょう

#### Q1-3: Webflow コレクション情報
Webflowで管理しているコンテンツのコレクション名を教えてください。

**質問**: 
- Lesson相当のコレクション名: Series
- Quest相当のコレクション名: なし → videosのisthisasectiontitle?がONのものがクエストのタイトルで、番号で並べて表示を変えている
- Article相当のコレクション名: Videos


---

### 2. コンテンツ構造

#### Q2-1: Webflowのフィールド構造
各コレクションにどのようなフィールドがありますか？

**Article コレクションの例**:
下のスクリーンショットに貼りました。使わないものも含まれています。２つに画像は別れています。

<img width="1044" height="541" alt="image" src="https://github.com/user-attachments/assets/b149ced4-8929-4868-b37d-b9100400bb3b" />
<img width="1045" height="824" alt="image" src="https://github.com/user-attachments/assets/072d140a-05aa-4059-8f06-eed9c1c3fff4" />


#### Q2-2: リッチテキストの形式
Webflowの本文コンテンツはどのような形式ですか？

**質問**:
- [✅️] リッチテキスト（HTML形式）
- [ ] プレーンテキスト
- [ ] その他: _______________

**重要**: WebflowのリッチテキストはHTML形式です。これをそのまま表示してよいか、それともSanityのPortableText形式に変換する必要があるか教えてください。
→Sanityで管理するならPortableText形式に変換したいですが、MVPとして表示ができるならそのまま使えるなら使ってもOKです。

---

### 3. 選択メカニズム（重要）

#### Q3-1: どのコンテンツを表示したいか
「指定したコンテンツのみ」を表示したいとのことですが、どのように選択したいですか？
→CMSの読み込みが可能なら、指定したシリーズのみ（titleやslugの指定）最初はとりこみたいです。
→ただWebflowからのデータ読み込みと、既存のCMSとの仕組みの連携でのレッスン〜記事表示が簡単ならすべてのシリーズを対応できたらめっちゃいいです！最高です。

**オプションA: Webflow側でフラグ管理**
- Webflowに「アプリに公開」のようなチェックボックスを追加
- チェックされたものだけを取得
→これでもいいです。


**質問**: どの方法が良いですか？
- [ ] その他: 追記した内容を下に精査して教えて。

**推奨理由（オプションB）**: 
- 既存のSanity構造を維持できる
- 細かい制御が可能
- Webflow側の変更が不要

---

### 4. 統合方法

#### Q4-1: 既存のLesson/Questとの関係
WebflowのコンテンツをどのようにSanityと組み合わせたいですか？

**パターンA: 既存のLesson/Questに追加**
```
Sanity Lesson "UIデザイン基礎"
  ├── Sanity Quest 1
  │   ├── Sanity Article 1
  │   └── Sanity Article 2
  └── Sanity Quest 2
      ├── Webflow Article 1  ← 追加
      └── Webflow Article 2  ← 追加
```

**パターンB: 新しいLesson/Questを作成**
```
Webflow Lesson "新しいレッスン"
  └── Webflow Quest 1
      ├── Webflow Article 1
      └── Webflow Article 2
```

**パターンC: 完全に混在**
```
Hybrid Lesson
  └── Hybrid Quest
      ├── Sanity Article 1
      ├── Webflow Article 1
      └── Sanity Article 2
```

**質問**: どのパターンが理想ですか？

- [ ] まだ決めていない → POCを見てから決めたい
→追記：理想は今のCMS（Sanity）の仕組みに統合していくのが理想です。ただMVPの内容があればそちらでも良いかもしれません。整理して提案してください
---

### 5. 表示要件

#### Q5-1: コンテンツの表示形式
WebflowのHTML形式のコンテンツをどのように表示したいですか？

**質問**:
- [ ] HTMLをそのまま表示（簡単、早い）
- [ ] SanityのPortableText形式に変換（統一感あり、複雑）
- [ ] わからない → 両方試してから決めたい

**推奨**: まずはHTMLをそのまま表示し、後で必要に応じて変換を検討 →これで行きましょう！

#### Q5-2: 動画の扱い
Webflowの動画URLはどのような形式ですか？

**質問**:
- [✅️] Vimeo URL
- [△] YouTube URL → たまにYouTubeのものもあります。
- [ ] 直接の動画ファイルURL
- [ ] その他: _______________

---

## 📝 任意情報（あれば助かる）

### 6. 追加情報

#### Q6-1: サンプルコンテンツ
POCで使用できるWebflowのサンプル記事はありますか？

**質問**: 
- コレクションID: 6029d027f6cb8852cbce8c75
- アイテムID または スラッグ: slug-three-structures-11 / itemid 684f8307d2a12ade32efe83c

#### Q6-2: 更新頻度
Webflowのコンテンツはどのくらいの頻度で更新されますか？

**質問**:
- [ ] 毎日
- [✅️] 週に数回
- [ ] 月に数回
- [ ] ほとんど更新しない

**理由**: キャッシュ戦略を決定するため

#### Q6-3: パフォーマンス要件
ページの読み込み速度についてどの程度重視しますか？
けっこう重視したいです。

**質問**:
- [ ] 非常に重要（1秒以内）→ベスト
- [✅️] 重要（2-3秒以内）
- [ ] 許容範囲（5秒以内）
- [ ] 特に気にしない

---

## 🎯 次のステップ

### 情報収集後の流れ

1. **Phase 0完了**: 上記の質問に回答いただく
2. **Phase 1開始**: Edge Function作成
3. **Phase 2完了**: POC実装（1つのWebflow記事を表示）
4. **ユーザー確認**: POCを見て方向性を確認
5. **Phase 3以降**: 本格実装

### 最小限必要な情報（POC作成のため）

POCを作成するために最低限必要な情報:
- ✅ Webflow API トークン
- ✅ Article コレクションID
- ✅ サンプル記事のID または スラッグ

これらがあれば、まず動くものを作って見せることができます。

---

## 💡 技術的な補足

### WebflowとSanityの紐付けについて

**質問**: 「WebflowとSanityのデータを紐付けられるか」

**回答**: ✅ はい、可能です！

**方法**:
1. SanityのArticleドキュメントに `webflowItemId` フィールドを追加
2. 必要な時にWebflow APIでそのIDのコンテンツを取得
3. 既存のSanity記事と同じように表示

**イメージ**:
```typescript
// Sanity Article
{
  _id: "article-123",
  title: "この記事はWebflowから",
  webflowSource: {
    collectionId: "abc123",
    itemId: "xyz789"
  }
}

// 表示時にWebflowから実際のコンテンツを取得
```

### セキュリティについて

- Webflow APIトークンは安全に管理します（Supabase Secrets）
- クライアント側には露出しません
- すべてのWebflow APIコールはサーバー側（Edge Function）で実行

---

## 📞 質問・不明点

上記の質問について不明な点があれば、遠慮なくお聞きください。
一緒に確認しながら進めることができます。

また、「まずは動くものを見たい」という場合は、最小限の情報でPOCを作成し、
それを見ながら詳細を決めることも可能です。
