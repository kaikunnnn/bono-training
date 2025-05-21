
# トレーニングコンテンツのサンプルファイル

## React基礎コース - 無料サンプル

```md
---
title: "React入門 - コンポーネントの基礎"
slug: "components-intro"
order_index: 1
is_premium: false
video_full: "845235294"
video_preview: "845235294"
preview_sec: 30
---

# Reactコンポーネントの基礎

Reactの最も重要な概念の一つが「コンポーネント」です。コンポーネントを使うことで、
UIを独立した再利用可能なパーツに分割し、それぞれを切り離して考えることができます。

## コンポーネントとは？

コンポーネントは、Reactアプリケーションの基本的な構成要素です。
技術的には、コンポーネントはJavaScriptの関数またはクラスであり、任意の入力（「props」と呼ばれる）を受け取り、
画面に表示されるReact要素を返します。

```jsx
// 関数コンポーネント
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

// クラスコンポーネント
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

## コンポーネントの使い方

作成したコンポーネントは以下のように使用できます：

```jsx
function App() {
  return (
    <div>
      <Welcome name="Sara" />
      <Welcome name="Cahal" />
      <Welcome name="Edite" />
    </div>
  );
}
```

今後のReactの学習を進める中で、これらの基本的な概念をさらに深めていきましょう！
```

## React基礎コース - 有料サンプル

```md
---
title: "ReactのStateとHook - 状態管理の基礎"
slug: "state-and-hooks"
order_index: 2
is_premium: true
video_full: "845235300"  
video_preview: "845235294"
preview_sec: 30
---

# ReactのStateとHooks

Reactコンポーネントでユーザーインタラクションに応じて画面を更新するには「State（状態）」を活用します。
Reactの関数コンポーネントでは「Hooks」と呼ばれる機能を使用して状態を管理します。

## useState とは？

`useState` はReactの提供する最も基本的なHookで、コンポーネントに状態変数を追加することができます。

```jsx
import React, { useState } from 'react';

function Counter() {
  // カウント値と、それを更新する関数を宣言
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>現在のカウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        カウントアップ
      </button>
    </div>
  );
}
```

<!--PREMIUM-->

## useEffect とは？

`useEffect` はコンポーネントの副作用を処理するためのHookです。データの取得、購読の設定、
およびDOMの手動変更などの処理に適しています。

```jsx
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // componentDidMount、componentDidUpdateと同様
  useEffect(() => {
    // ブラウザのタイトルを更新
    document.title = `${count}回クリックされました`;
  });

  return (
    <div>
      <p>{count}回クリックされました</p>
      <button onClick={() => setCount(count + 1)}>
        クリック
      </button>
    </div>
  );
}
```

## カスタムHookの作成

Hooksを使うと、ロジックを再利用可能な関数として抽出できます。
以下は、フォームの入力値を管理するカスタムHookの例です：

```jsx
function useInput(initialValue) {
  const [value, setValue] = useState(initialValue);
  
  const handleChange = (e) => {
    setValue(e.target.value);
  };
  
  return [value, handleChange];
}

// 使用例
function NameForm() {
  const [name, handleNameChange] = useInput('');
  
  return (
    <input 
      value={name}
      onChange={handleNameChange}
      placeholder="名前を入力"
    />
  );
}
```

このようにHooksを活用することで、クラスコンポーネントよりも簡潔でテストしやすいコードを書けるようになります。
```

## ファイル構造

Supabase Storageでは以下の構造でファイルを保存します：

```
content/react-basics/components-intro/content.md
content/react-basics/state-and-hooks/content.md
```

## アップロード手順

1. Supabaseダッシュボードのストレージセクションにアクセス
2. contentバケットに移動
3. フォルダを作成: `content/react-basics/components-intro/`
4. components-introフォルダ内にcontent.mdファイルをアップロード
5. 同様に、`content/react-basics/state-and-hooks/`フォルダを作成し、もう一つのファイルをアップロード
