---
name: aws-setup
description: ECS/FargateとRDS/AuroraをTerraformでセットアップするスキル。「AWSの環境を構築して」「ECSのインフラをTerraformで作って」「FargateとRDSを立ち上げたい」「AWSのセットアップをして」「TerraformでECSを構築したい」などのリクエスト時に使用する。モジュール分割されたTerraform構成を生成し、ネットワーク・コンテナ・データベース層を順に構築する。
---

# AWS インフラ構築スキル（ECS/Fargate + RDS/Aurora）

Terraform モジュール構成で ECS/Fargate と RDS/Aurora を含む AWS インフラを段階的に構築する。

## 技術スタック

| 項目 | 詳細 |
|------|------|
| IaC | Terraform 1.5.0+ |
| コンテナ | Amazon ECS (Fargate) |
| DB | Amazon Aurora (PostgreSQL / MySQL) |
| プロバイダー | hashicorp/aws ~5.x, hashicorp/random |

## ワークフロー概要

```
Phase 0: 要件確認
Phase 1: 事前確認
Phase 2: プロジェクト構造作成
Phase 3: ネットワークモジュール
Phase 4: ECS/Fargateモジュール
Phase 5: RDS/Auroraモジュール
Phase 6: ルートモジュール統合
Phase 7: 最終検証
```

---

### Phase 0: 要件確認

**目的**: インフラ構成の前提となるパラメータを全て確定する。コードは一行も書かない。

- 0-1. デプロイ環境の確認（dev / staging / production）
- 0-2. AWSリージョンの確認（例: ap-northeast-1）
- 0-3. プロジェクト名の確認（リソース命名プレフィックスに使用）
- 0-4. アプリコンテナ設定の確認（イメージURL、CPU/メモリ、ポート番号、必要な環境変数）
- 0-5. DBの設定確認（エンジンバージョン、インスタンスクラス、DB名、マスターユーザー名）
- 0-6. ネットワーク設定の確認（VPC CIDR、パブリック/プライベートサブネット数、AZ数）
- 0-7. Terraformバックエンドの確認（S3バケット名・DynamoDBテーブル名、またはローカルバックエンド）
- 0-8. 要件サマリーの作成とユーザー確認

**ゲート条件**:
- [ ] プロジェクト名・リージョン・環境名が確定している
- [ ] コンテナ設定（CPU, メモリ, ポート）が確定している
- [ ] DB設定（エンジン, インスタンスクラス, DB名）が確定している
- [ ] ネットワーク設計（CIDR, AZ数, サブネット数）が確定している
- [ ] Terraformバックエンド方式が確定している
- [ ] ユーザーが要件サマリーを承認した

---

### Phase 1: 事前確認

**目的**: ツールチェーンが揃っていることを確認する。

- 1-1. Terraformのバージョン確認（`terraform version`）— 1.5.0以上であること
- 1-2. AWS CLIのバージョン確認（`aws --version`）
- 1-3. AWS認証情報の確認（`aws sts get-caller-identity`）— 正しいアカウント・ロールであること
- 1-4. 対象ディレクトリの確認（空または新規作成先であること）

**ゲート条件**:
- [ ] terraform version が 1.5.0 以上
- [ ] AWS CLI が応答する
- [ ] `aws sts get-caller-identity` が正しいアカウントIDを返す
- [ ] 作業ディレクトリが確定している

---

### Phase 2: プロジェクト構造作成

**目的**: モジュール分割されたディレクトリ構造と基盤設定ファイルを作成する。

- 2-1. ディレクトリ構造の作成（`modules/network/`, `modules/ecs/`, `modules/rds/` + ルート）
- 2-2. `backend.tf` の作成（Phase 0で確定したバックエンド設定）
- 2-3. `providers.tf` の作成（AWS provider + Random provider の両方を設定する、required_version制約）
- 2-4. 各モジュールの `main.tf`, `variables.tf`, `outputs.tf` の空ファイル作成

作成するディレクトリ・ファイル構造:

```
<project-root>/
├── backend.tf
├── providers.tf
├── main.tf
├── variables.tf
├── outputs.tf
├── terraform.tfvars.example
└── modules/
    ├── network/
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    ├── ecs/
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    └── rds/
        ├── main.tf
        ├── variables.tf
        └── outputs.tf
```

**ゲート条件**:
- [ ] ディレクトリ構造が作成されている
- [ ] `backend.tf` と `providers.tf` が存在する
- [ ] 各モジュールディレクトリに3ファイルが存在する

---

### Phase 3: ネットワークモジュール

**目的**: VPC・サブネット・セキュリティグループ・IGW/NAT Gatewayを構築するモジュールを実装する。

詳細手順 → `references/vpc-network.md` を読むこと

- 3-1. VPCリソースの実装（`modules/network/main.tf`）
- 3-2. パブリック・プライベートサブネットの実装
- 3-3. Internet Gateway と Route Tableの実装
- 3-4. NAT Gatewayの実装（プライベートサブネット用）
- 3-5. セキュリティグループの実装（ALB用, ECS用, RDS用）
- 3-6. `modules/network/variables.tf` の実装
- 3-7. `modules/network/outputs.tf` の実装

**ゲート条件**:
- [ ] `modules/network/` 配下の3ファイルが実装されている
- [ ] VPC, サブネット, SG, IGW, NAT GW がリソース定義されている
- [ ] 必要なoutputが全て定義されている（vpc_id, subnet_ids, sg_ids）

---

### Phase 4: ECS/Fargateモジュール

**目的**: ECSクラスター・タスク定義・サービス・ALBを構築するモジュールを実装する。

詳細手順 → `references/ecs-fargate.md` を読むこと

- 4-1. ECSクラスターの実装
- 4-2. IAMロールの実装（タスク実行ロール, タスクロール）
- 4-3. CloudWatch Logs ロググループの実装
- 4-4. ECSタスク定義の実装（Fargate互換）
- 4-5. ALB・ターゲットグループ・リスナーの実装
- 4-6. ECSサービスの実装（ALBとの紐付け）
- 4-7. `modules/ecs/variables.tf` の実装
- 4-8. `modules/ecs/outputs.tf` の実装

**ゲート条件**:
- [ ] `modules/ecs/` 配下の3ファイルが実装されている
- [ ] ECSクラスター, タスク定義, サービス, ALBが定義されている
- [ ] IAMロールとポリシーが定義されている
- [ ] ALBのDNS名がoutputされている

---

### Phase 5: RDS/Auroraモジュール

**目的**: Aurora DBクラスター・インスタンス・パラメータグループ・サブネットグループを構築するモジュールを実装する。

詳細手順 → `references/rds-aurora.md` を読むこと

- 5-1. DBサブネットグループの実装
- 5-2. DBパラメータグループの実装
- 5-3. Auroraクラスターパラメータグループの実装
- 5-4. Aurora DBクラスターの実装
- 5-5. Aurora DBインスタンスの実装
- 5-6. Secrets Manager シークレットの実装（DBパスワード管理）
- 5-7. `modules/rds/variables.tf` の実装
- 5-8. `modules/rds/outputs.tf` の実装

**ゲート条件**:
- [ ] `modules/rds/` 配下の3ファイルが実装されている
- [ ] Auroraクラスター, インスタンス, サブネットグループ, パラメータグループが定義されている
- [ ] DB接続情報（endpoint, port）がoutputされている

---

### Phase 6: ルートモジュール統合

**目的**: ルートモジュールで全モジュールを呼び出し、変数定義と出力を統合する。

モジュール間の依存関係:

```
modules/network (依存なし)
  → outputs: vpc_id, subnet_ids, security_group_ids
      → modules/rds (networkのoutputを受け取る)
      → modules/ecs (networkのoutputを受け取る)

modules/rds
  → outputs: secret_arn
      → modules/ecs: container_secrets経由でDB接続情報を注入
```

- 6-1. `main.tf`（ルート）の実装 — network → rds → ecs の順でモジュールを呼び出す
- 6-2. モジュール間の依存関係を出力参照で接続（network outputs → ecs/rds inputs）
- 6-3. `variables.tf`（ルート）の実装 — Phase 0で確定した全パラメータを変数化
- 6-4. `outputs.tf`（ルート）の実装 — ALB DNS名、DB endpoint等を出力
- 6-5. `terraform.tfvars.example` のサンプル作成（実際の `.tfvars` は `.gitignore` に追加する）

**ゲート条件**:
- [ ] ルート `main.tf` が3モジュールを全て呼び出している
- [ ] モジュール間の出力参照が正しく接続されている
- [ ] `variables.tf` に全必要変数が定義されている
- [ ] `terraform.tfvars.example` が作成されている
- [ ] `.gitignore` に `terraform.tfvars` が含まれている

---

### Phase 7: 最終検証

**目的**: Terraformコマンドで構成の正確性を確認する。

- 7-1. `terraform init` を実行してプロバイダーとモジュールを初期化する
- 7-2. `terraform validate` を実行して構文・参照エラーがないことを確認する
- 7-3. `terraform plan` を実行してリソース作成計画を確認する
- 7-4. planの結果をユーザーに提示してレビューする
- 7-5. セットアップ結果のサマリーをユーザーに提示する（作成予定リソース一覧）

**ゲート条件**:
- [ ] `terraform init` が成功する
- [ ] `terraform validate` がエラー0で通過する
- [ ] `terraform plan` が実行できる（認証エラー以外）
- [ ] ユーザーに最終サマリーが提示されている

---

## フロー制御ルール

1. 必ず Phase 0 から順に実行する。フェーズをスキップしない。
2. 各コマンドの実行結果を確認してから次へ進む。エラーが出た場合はその場で対処する。
3. 部分実行にも対応する。ユーザーが「ネットワークモジュールだけ作って」と言った場合は、該当フェーズのみ実行する。ただし、先行フェーズの成果物（ディレクトリ構造等）が存在するか先に確認する。
4. リソース定義は `references/` のモジュールファイルの定義に従う。ファイルに書かれていないリソースを勝手に追加しない。

## 部分実行モード

| 要求 | 開始フェーズ | 前提確認事項 |
|------|------------|------------|
| 「ネットワークだけ作って」 | Phase 3 | ディレクトリ構造・プロジェクト名・CIDRを確認 |
| 「ECSモジュールだけ作って」 | Phase 4 | networkモジュールのoutputが存在するか確認 |
| 「RDSモジュールだけ作って」 | Phase 5 | networkモジュールのoutputが存在するか確認 |
| 「ルートモジュールをまとめて」 | Phase 6 | 全3モジュールが実装済みか確認 |
| 「terraform planだけ実行して」 | Phase 7 | terraform initが完了しているか確認 |

## 参照ファイル一覧

| フェーズ | 参照ファイル |
|--------|-----------|
| Phase 3 | `references/vpc-network.md` |
| Phase 4 | `references/ecs-fargate.md` |
| Phase 5 | `references/rds-aurora.md` |
