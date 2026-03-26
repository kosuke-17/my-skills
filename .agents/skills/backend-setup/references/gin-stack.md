# 技術スタック定義（Gin）

> このファイルを更新することで、環境構築スキル全体の技術選定を変更できる。
> 各ツールの `command` がセットアップ時に実行されるコマンド。

## パッケージマネージャー

- **name**: Go Modules（Go 標準ビルトイン）
- **check**: `go version`
- **init_command**: `go mod init <project-name>`
- **note**: グローバルに Go がインストール済みであることを前提とする（Go 1.21+）。未インストールの場合はユーザーに案内する

## フレームワーク

- **name**: Gin
- **command**: `go get github.com/gin-gonic/gin`
- **note**: Gin は高パフォーマンスな HTTP ルーターを提供する。`go get` で `go.mod` に依存関係が追加される
- **structure**:
  ```
  cmd/
  └── server/
      └── main.go          # エントリーポイント
  internal/
  ├── handler/             # HTTP ハンドラー
  │   └── health.go
  ├── router/              # ルーティング定義
  │   └── router.go
  ├── config/              # 環境変数・設定管理
  │   └── config.go
  └── db/                  # データベース接続管理
      └── db.go
  migrate/                 # SQL マイグレーションファイル
  ```
- **entrypoint**: `cmd/server/main.go` に Gin エンジンを初期化してサーバーを起動する

## 言語

- **name**: Go
- **note**: `go mod init` で `go.mod` が生成される。Go 1.21+ 推奨。`go mod tidy` で依存関係を整理する

## リンター・フォーマッター

- **name**: golangci-lint（+ 組み込み `gofmt` / `go vet`）
- **command**: `go install github.com/golangci-lint/golangci-lint/cmd/golangci-lint@latest`
- **config**: `.golangci.yml`
- **config_content**:
  ```yaml
  linters:
    enable:
      - gofmt
      - govet
      - errcheck
      - staticcheck
      - unused
      - gosimple

  linters-settings:
    gofmt:
      simplify: true
  ```
- **scripts**: `"lint": "golangci-lint run ./...", "fmt": "gofmt -w ."`

## データベース

- **name**: PostgreSQL
- **orm**: GORM + golang-migrate

### ORM設定

- **command**: `go get gorm.io/gorm gorm.io/driver/postgres github.com/golang-migrate/migrate/v4`
- **init**: `migrate/` ディレクトリを作成する
- **verify**: `go.mod` に `gorm.io/gorm`, `gorm.io/driver/postgres`, `github.com/golang-migrate/migrate/v4` が追加されたことを確認する

### DB設定

- **env**: 環境変数 `DATABASE_URL` に接続文字列を設定する。形式: `postgres://user:password@host:port/dbname?sslmode=disable`
- **datasource**: `internal/config/config.go` で `DATABASE_URL` を読み込む設定を確認する
- **migration**:
  - `migrate/` ディレクトリに `000001_init.up.sql` / `000001_init.down.sql` を管理する
  - `golang-migrate` CLI でマイグレーション実行: `migrate -path migrate -database "$DATABASE_URL" up`

### アプリケーション設定

- **service**: `internal/db/db.go` にデータベース接続設定（GORM）を作成する
- **integration**: `cmd/server/main.go` で DB 接続を初期化し、ハンドラーに注入する
- **verify**: `go build ./...` でビルドエラーがないことを確認する

## テスト

- **name**: Go 標準 `testing` + testify
- **command**: `go get github.com/stretchr/testify`
- **config**: なし（Go 標準の `*_test.go` ファイル規約に従う）
- **structure**:
  ```
  internal/
  └── handler/
      └── health_test.go   # ヘルスチェックハンドラーのユニットテスト
  ```
- **scripts**: `"test": "go test ./...", "test:v": "go test -v ./..."`

## Docker

- **dockerfile**:
  ```dockerfile
  # Build stage
  FROM golang:1.23-alpine AS builder

  WORKDIR /app

  COPY go.mod go.sum ./
  RUN go mod download

  COPY . .
  RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server

  # Run stage
  FROM alpine:3.21

  WORKDIR /app

  COPY --from=builder /app/server .

  EXPOSE 8080

  CMD ["./server"]
  ```
- **compose**:
  ```yaml
  services:
    app:
      build: .
      ports:
        - "8080:8080"
      environment:
        - DATABASE_URL=postgres://postgres:postgres@db:5432/app?sslmode=disable
      depends_on:
        db:
          condition: service_healthy

    db:
      image: postgres:17
      ports:
        - "5432:5432"
      environment:
        POSTGRES_USER: postgres
        POSTGRES_PASSWORD: postgres
        POSTGRES_DB: app
      volumes:
        - postgres_data:/var/lib/postgresql/data
      healthcheck:
        test: ["CMD-SHELL", "pg_isready -U postgres"]
        interval: 5s
        timeout: 5s
        retries: 5

  volumes:
    postgres_data:
  ```
- **dockerignore**:
  ```
  .git
  *.md
  *_test.go
  .golangci.yml
  ```
