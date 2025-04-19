# CSViewr

CSVファイルを簡単に表示・編集できるWebアプリケーションです。複数のCSVファイルを結合して表示し、データの比較や編集が可能です。

## 特徴

- 複数のCSVファイルを結合して表示
- カスタマイズ可能な列表示（表示/非表示、幅調整）
- 日本語対応のソート・フィルタリング機能
- モダンなUIデザイン
- レスポンシブ対応

## 仕様

- メインCSVとリンクCSVの2つのファイルを結合して表示
- 指定したキー列（例：ID）でデータを紐付け
- 同じキーを持つレコードの値が異なる場合、カンマ区切りで結合表示
- 列の表示/非表示、幅、ソート、フィルタリングの設定が可能
- 日本語のソートとフィルタリングに対応

## 使い方

1. アプリケーションを起動
2. 「CSVファイルを選択」ボタンをクリックしてメインCSVファイルを選択
3. 「リンクCSVファイルを選択」ボタンをクリックしてリンクCSVファイルを選択
4. キー列を選択して「結合」ボタンをクリック
5. データが表示されたら、列ヘッダーをクリックしてソートやフィルタリングが可能
6. 設定パネルから列の表示/非表示や幅を調整可能

### index.htmlでの設定

アプリケーションの初期設定は`index.html`ファイルで行うことができます：

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CSViewr</title>
    <!-- アプリケーションの設定 -->
    <script>
      window.CSVtoGRID_CONFIG = {
        // デフォルトの列設定
        defaultColumns: [
          { key: 'id', displayName: 'ID', width: '100px', visible: true, sortable: true, filterable: true },
          { key: 'name', displayName: '氏名', width: '200px', visible: true, sortable: true, filterable: true },
          { key: 'position', displayName: '役職', width: '150px', visible: true, sortable: true, filterable: true },
          { key: 'status', displayName: 'ステータス', width: '150px', visible: true, sortable: true, filterable: true }
        ],
        // デフォルトのキー列
        defaultKeyColumn: 'id',
        // テーマ設定
        theme: 'light', // 'light' または 'dark'
        // ページサイズ
        pageSize: 50,
        // その他の設定
        enableExport: true,
        enableImport: true
      };
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

設定可能なオプション：

- `defaultColumns`: デフォルトで表示する列の設定
  - `key`: 列のキー（CSVのヘッダー名と一致させる）
  - `displayName`: 表示名
  - `width`: 列の幅
  - `visible`: 表示/非表示
  - `sortable`: ソート可能かどうか
  - `filterable`: フィルタリング可能かどうか
- `defaultKeyColumn`: デフォルトのキー列
- `theme`: アプリケーションのテーマ
- `pageSize`: 1ページあたりの表示件数
- `enableExport`: エクスポート機能の有効/無効
- `enableImport`: インポート機能の有効/無効

## 使用ライブラリ・ライセンス

- React
- TypeScript
- Tailwind CSS
- Vite
- Vitest
- React Testing Library
- PapaParse (CSVパース処理)

ライセンス: MIT

## CSVファイルの仕様と制限

### 改行を含むデータの取り扱い

- CSVファイル内の改行を含むデータは、必ずダブルクォーテーション（`"`）で囲む必要があります
  ```csv
  id,name,description
  1,"山田
  太郎","複数行の
  説明文"
  ```

- 表示方法
  - 一覧画面: 改行は削除され、1行で表示されます
  - 詳細画面: 改行が適用され、複数行で表示されます

### CSVファイルの要件

- 文字コード: UTF-8
- 区切り文字: カンマ（`,`）
- 改行コード: CR+LF（`\r\n`）またはLF（`\n`）
- 特殊文字を含むセルはダブルクォーテーションで囲む
  - 改行（`\n`, `\r\n`）
  - カンマ（`,`）
  - ダブルクォーテーション（`"`）→ `""`でエスケープ
  - バックスラッシュ（`\`）
  - パーセント記号（`%`）

## 注意事項／既知の制限

- 大規模なCSVファイル（10,000行以上）の処理には時間がかかる場合があります
- ブラウザのメモリ制限により、非常に大きなファイルは処理できない場合があります
- 特殊文字を含むCSVファイルは正しく解析されない場合があります

## ディレクトリ構成

```
CSVtoGRID/
├── public/              # 静的ファイル
├── src/                 # ソースコード
│   ├── components/      # Reactコンポーネント
│   │   ├── __tests__/   # テストファイル
│   ├── utils/           # ユーティリティ関数
│   ├── types/           # 型定義
│   ├── App.tsx          # メインアプリケーション
│   └── main.tsx         # エントリーポイント
├── package.json         # 依存関係
├── tsconfig.json        # TypeScript設定
└── vite.config.ts       # Vite設定
```

## 開発者向け情報

### 開発環境のセットアップ

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/CSVtoGRID.git
cd CSVtoGRID

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# テストの実行
npm test

# ビルド
npm run build
```

### テスト

テストはVitestとReact Testing Libraryを使用しています。コンポーネントのテストは`src/components/__tests__/`ディレクトリにあります。

### コード規約

- TypeScriptの型定義を適切に使用すること
- コンポーネントは関数コンポーネントとReact Hooksを使用すること
- テストは主要な機能をカバーすること
- コメントは日本語で記述すること 