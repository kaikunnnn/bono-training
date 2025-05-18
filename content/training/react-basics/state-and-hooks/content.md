
---
title: "StateとHooksの使い方"
order_index: 2
is_premium: true
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

## 複数のState変数

一つのコンポーネントで複数のState変数を使用できます。

```jsx
function UserForm() {
  const [name, setName] = useState('');
  const [age, setAge] = useState(0);
  const [email, setEmail] = useState('');

  // ...
}
```

## useEffect Hook

`useEffect`を使うと、コンポーネントのレンダリング後に副作用を実行できます。

```jsx
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // componentDidMount, componentDidUpdate, componentWillUnmountに相当
  useEffect(() => {
    // ブラウザAPIを使用してドキュメントのタイトルを更新
    document.title = `You clicked ${count} times`;
    
    // クリーンアップ関数（componentWillUnmountに相当）
    return () => {
      document.title = 'React App';
    };
  }, [count]); // countが変更されたときだけ副作用を再実行

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

## カスタムHooks

共通のロジックを抽出して再利用可能なカスタムHooksを作成できます。

```jsx
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    window.addEventListener('resize', handleResize);
    
    // クリーンアップ関数
    return () => window.removeEventListener('resize', handleResize);
  }, []); // 空の配列を渡すと、マウント時とアンマウント時のみ実行

  return windowSize;
}
```

## 高度な課題

以下の要件を満たすTodoアプリを作成してください：

1. タスクの追加、削除、完了/未完了の切り替えができる
2. ローカルストレージを使ってタスクを保存する
3. カスタムHookを作成してタスク管理ロジックをコンポーネントから分離する

この課題を通じて、HooksとStateの高度な使い方、カスタムHooksの作成方法を学びましょう。
