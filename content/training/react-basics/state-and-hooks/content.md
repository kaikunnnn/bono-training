
---
title: "StateとHooksの使い方"
slug: "state-and-hooks"
order_index: 2
is_premium: true
preview_sec: 30
video_full: "845235300"
video_preview: "845235301"
---

# StateとHooksの使い方

Reactアプリケーションで動的なUIを作成するには、「State（状態）」の管理が不可欠です。
React Hooksを使うと、関数コンポーネントでもStateや他のReact機能を使用できます。

## useState Hookの基本

`useState`は、関数コンポーネントでStateを使うための最も基本的なHookです。

```jsx
import React, { useState } from 'react';

function Counter() {
  // [現在の状態, 状態を更新する関数] = useState(初期値);
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

## 複数のstate変数の使用

複数のstate変数を使用することで、異なる種類の値を管理できます。

```jsx
function UserForm() {
  const [name, setName] = useState('');
  const [age, setAge] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // ...
}
```

## useEffect Hookの基本

`useEffect`は、関数コンポーネントで副作用を実行するためのHookです。

```jsx
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    // Update the document title using the browser API
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

## 依存配列

`useEffect`の第二引数に依存配列を渡すことで、特定の値が変更されたときだけ副作用を実行できます。

```jsx
useEffect(() => {
  document.title = `You clicked ${count} times`;
}, [count]); // countが変更されたときだけ実行

// 空の依存配列を渡すと、初回レンダリング時のみ実行
useEffect(() => {
  console.log('Component mounted');
}, []);
```

## カスタムフック

カスタムフックを作成することで、コンポーネント間でロジックを再利用できます。

```jsx
function useFormInput(initialValue) {
  const [value, setValue] = useState(initialValue);
  
  function handleChange(e) {
    setValue(e.target.value);
  }
  
  return {
    value,
    onChange: handleChange
  };
}

function ProfileForm() {
  const name = useFormInput('');
  const email = useFormInput('');
  
  return (
    <form>
      <input value={name.value} onChange={name.onChange} />
      <input value={email.value} onChange={email.onChange} />
    </form>
  );
}
```

## その他の主要なHooks

- `useContext`: コンテキストからの値を取得
- `useReducer`: 複雑な状態管理
- `useCallback`: コールバック関数のメモ化
- `useMemo`: 計算結果のメモ化
- `useRef`: DOMノードや値の参照を保持

## 演習課題

1. `useState`を使ってフォームの状態を管理するコンポーネントを作成する
2. `useEffect`を使って、コンポーネントのマウント/アンマウント時に処理を実行する
3. カスタムフックを作成して、複数のコンポーネントで共有する

Hooksを活用することで、関数コンポーネントでも複雑なロジックを実装できます。
プレミアムコンテンツでは、より高度なHooksの使い方と状態管理のベストプラクティスについて解説します。
