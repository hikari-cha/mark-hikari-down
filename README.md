# MarkHikariDown

Tauri + React + TypeScript で構築した、Markdown の単純な編集に特化したデスクトップアプリです。

## 主な機能
- Markdown テキストの編集
- プレビュー表示（ `Ctrl + E` で編集⇔プレビュー切り替え）
- `.md` ファイルの読み書き（ `Ctrl + S` で保存）

## 技術スタック

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)
![Tauri](https://img.shields.io/badge/Tauri-2.x-24C8DB?logo=tauri&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-latest-6E9F18?logo=vitest&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-latest-2EAD33?logo=playwright&logoColor=white)


## セットアップ
### 前提
- Node.js（LTS 推奨）
- Rust（stable）
- Tauri 2 の開発要件

### インストール
```bash
npm install
```

## 開発
### Web 開発サーバー
```bash
npm run dev
```

### Tauri アプリとして起動
```bash
npm run tauri dev
```

## ビルド
```bash
npm run build
npm run tauri build
```

## テスト
```bash
npm test
npx playwright test   
```
