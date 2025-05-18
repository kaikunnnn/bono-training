
---
title: "Reactコンポーネント入門"
order_index: 1
is_premium: false
video_full: "845235294"
video_preview: "845235294"
---

# Reactコンポーネント入門

Reactの最も重要な概念の一つが「コンポーネント」です。コンポーネントを使うことで、UIを独立した再利用可能なパーツに分割できます。

## コンポーネントとは何か？

コンポーネントは、アプリケーションのUIの一部を表すJavaScriptの関数やクラスです。コンポーネントは入力としてプロパティ（props）を受け取り、画面に表示されるReact要素を返します。

```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
```

## コンポーネントの種類

Reactには主に2種類のコンポーネントがあります：

1. **関数コンポーネント**: JavaScriptの関数として定義されたコンポーネント
2. **クラスコンポーネント**: ES6のクラスとして定義されたコンポーネント

### 関数コンポーネント

```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
```

### クラスコンポーネント

```jsx
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

## コンポーネントの呼び出し

コンポーネントは他のコンポーネント内で呼び出すことができます。

```jsx
function App() {
  return (
    <div>
      <Welcome name="Alice" />
      <Welcome name="Bob" />
      <Welcome name="Charlie" />
    </div>
  );
}
```

## 課題

以下の要件を満たす`Profile`コンポーネントを作成してください：

1. `name`、`age`、`occupation`のプロパティを受け取る
2. これらのプロパティを使用して、ユーザープロフィールを表示する
3. `occupation`が指定されていない場合は、「職業不明」と表示する

この課題を通じて、コンポーネントの作成と使用、props、条件付きレンダリングの基本を学びましょう。
