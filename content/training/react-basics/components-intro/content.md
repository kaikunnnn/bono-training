
---
title: "Reactコンポーネント入門"
slug: "components-intro"
order_index: 1
is_premium: false
preview_sec: 30
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

## 関数コンポーネントの例

```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
```

## クラスコンポーネントの例

```jsx
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

## コンポーネントの使い方

コンポーネントを作成したら、他のコンポーネント内で使用できます。

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

## コンポーネントの分割

大きなコンポーネントを小さなコンポーネントに分割することで、再利用性が高まり、コードの管理が容易になります。

```jsx
function Comment(props) {
  return (
    <div className="Comment">
      <UserInfo user={props.author} />
      <div className="Comment-text">
        {props.text}
      </div>
      <div className="Comment-date">
        {formatDate(props.date)}
      </div>
    </div>
  );
}
```

## 演習課題

1. シンプルな挨拶コンポーネントを作成してみましょう
2. 複数のコンポーネントを組み合わせたアプリケーションを作成してみましょう
3. propsを使って異なるデータでコンポーネントをレンダリングしてみましょう

以上がReactコンポーネントの基本となります。次のレッスンでは、Stateとライフサイクルについて学びます。
