# 技術スタック定義（FastAPI）

> このファイルを更新することで、環境構築スキル全体の技術選定を変更できる。
> 各ツールの `command` がセットアップ時に実行されるコマンド。

## パッケージマネージャー

- **name**: uv
- **check**: `uv --version`
- **init_command**: `uv init --name <project-name> .`
- **note**: グローバルにインストール済みであることを前提とする。未インストールの場合はユーザーに案内する

## フレームワーク

- **name**: FastAPI
- **command**: `uv add fastapi[standard]`
- **note**: `fastapi[standard]` は uvicorn・pydantic-settings 等の主要パッケージを含む
- **structure**:
  ```
  app/
  ├── __init__.py
  ├── main.py          # FastAPI アプリケーションのエントリーポイント
  ├── api/
  │   ├── __init__.py
  │   └── routes/
  │       └── __init__.py
  ├── core/
  │   ├── __init__.py
  │   └── config.py    # 環境変数・設定管理
  ├── db/
  │   ├── __init__.py
  │   └── session.py   # データベースセッション管理
  └── models/
      └── __init__.py
  ```
- **entrypoint**: `app/main.py` に FastAPI アプリケーションインスタンスを作成する

## 言語

- **name**: Python
- **note**: `uv init` で `pyproject.toml` が生成される。`requires-python` でバージョンを指定する

## リンター・フォーマッター

- **name**: Ruff
- **command**: `uv add --dev ruff`
- **config**: `pyproject.toml` の `[tool.ruff]` セクションに設定を追加
- **config_content**:
  ```toml
  [tool.ruff]
  target-version = "py312"
  line-length = 88

  [tool.ruff.lint]
  select = ["E", "W", "F", "I", "B", "UP"]

  [tool.ruff.format]
  quote-style = "double"
  ```
- **scripts**: `"lint": "uv run ruff check .", "format": "uv run ruff format ."`

## データベース

- **name**: PostgreSQL
- **command**: `uv add sqlalchemy[asyncio] asyncpg alembic`
- **config**: `app/db/session.py` にデータベース接続設定を作成する
- **migration**:
  - `uv run alembic init alembic` で Alembic を初期化する
  - `alembic/env.py` を非同期対応に設定する
  - `alembic.ini` の `sqlalchemy.url` を環境変数から読み込むように変更する
- **note**: 接続文字列は環境変数 `DATABASE_URL` から取得する。形式: `postgresql+asyncpg://user:password@host:port/dbname`

## テスト

- **name**: pytest
- **command**: `uv add --dev pytest pytest-asyncio httpx`
- **config**: `pyproject.toml` の `[tool.pytest.ini_options]` セクションに設定を追加
- **config_content**:
  ```toml
  [tool.pytest.ini_options]
  asyncio_mode = "auto"
  testpaths = ["tests"]
  ```
- **structure**:
  ```
  tests/
  ├── __init__.py
  └── test_health.py   # ヘルスチェックエンドポイントのテスト
  ```
- **scripts**: `"test": "uv run pytest", "test:ci": "uv run pytest -v"`

## Docker

- **dockerfile**:
  ```dockerfile
  FROM python:3.12-slim

  WORKDIR /app

  COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

  COPY pyproject.toml uv.lock ./
  RUN uv sync --frozen --no-dev

  COPY . .

  EXPOSE 8000

  CMD ["uv", "run", "fastapi", "run", "app/main.py", "--host", "0.0.0.0", "--port", "8000"]
  ```
- **compose**:
  ```yaml
  services:
    app:
      build: .
      ports:
        - "8000:8000"
      environment:
        - DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/app
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
  __pycache__
  *.pyc
  .venv
  .git
  .ruff_cache
  .pytest_cache
  ```
