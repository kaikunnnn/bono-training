# サウンドエフェクト

このディレクトリには、UIアニメーション用のサウンドエフェクトファイルを配置します。

## 必要な音声ファイル

### swoosh.mp3
**用途**: ページ読み込み時のアニメーション効果音（「シュッ」という音）

**推奨仕様**:
- 形式: MP3
- 長さ: 0.3-0.5秒
- ビットレート: 128kbps以下
- チャンネル: モノラル
- ファイルサイズ目安: 5-20KB

**音の特徴**:
- 軽快で短い「シュッ」「スッ」という風切り音
- 高めの周波数（3000-5000Hz）
- アタック早め、ディケイ短め

## 音声ファイルの入手方法

### 方法1: フリー素材サイト
- [Pixabay](https://pixabay.com/sound-effects/) - 商用利用可能
- [Freesound](https://freesound.org/) - CC0ライセンスあり
- [効果音ラボ](https://soundeffect-lab.info/) - 日本語、商用利用可能

検索ワード: "whoosh", "swoosh", "swish", "wind", "slide"

### 方法2: AI生成
- [ElevenLabs Sound Effects](https://elevenlabs.io/sound-effects)
- プロンプト例: "Short swoosh sound effect, 0.5 seconds, high pitch"

### 方法3: 自作
- Audacityなどで白色ノイズにエンベロープを適用
- ハイパスフィルター適用（低音カット）

## 配置後

音声ファイルを配置したら、以下のURLでアクセス可能になります：
```
/sounds/swoosh.mp3
```

## 注意事項

- ブラウザの自動再生ポリシーにより、ユーザーインタラクション前は音が鳴らない場合があります
- 開発プレビューページで動作確認してください: `/dev/sound-effect-preview`
