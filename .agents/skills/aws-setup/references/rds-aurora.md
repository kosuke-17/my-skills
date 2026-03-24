# RDS/Auroraモジュール定義

このファイルを更新することで、RDS/Aurora構成のTerraformリソース定義を変更できる。Phase 5 の実装はこのファイルの定義に従うこと。

## モジュール概要

- **モジュールパス**: `modules/rds/`
- **責務**: Aurora DBクラスター、DBインスタンス、サブネットグループ、パラメータグループ、Secrets Managerシークレットの作成
- **依存モジュール**: `modules/network/`（private_subnet_ids, rds_security_group_id が必要）

## ディレクトリ構造

```
modules/rds/
├── main.tf
├── variables.tf
└── outputs.tf
```

## エンジン別設定早見表

| エンジン | engine変数値 | engine_version例 | family | ポート |
|---------|------------|-----------------|--------|-------|
| Aurora PostgreSQL | `aurora-postgresql` | `15.4` | `aurora-postgresql15` | 5432 |
| Aurora MySQL | `aurora-mysql` | `8.0.mysql_aurora.3.04.0` | `aurora-mysql8.0` | 3306 |

## `variables.tf` 定義

| 変数名 | type | description | default |
|--------|------|-------------|---------|
| `project_name` | `string` | プロジェクト名 | — |
| `environment` | `string` | 環境名 | — |
| `private_subnet_ids` | `list(string)` | DBサブネットグループに使用するプライベートサブネットIDリスト | — |
| `rds_security_group_id` | `string` | RDS用セキュリティグループID | — |
| `engine` | `string` | DBエンジン（aurora-postgresql / aurora-mysql） | `"aurora-postgresql"` |
| `engine_version` | `string` | エンジンバージョン | `"15.4"` |
| `instance_class` | `string` | DBインスタンスクラス | `"db.r6g.large"` |
| `instance_count` | `number` | DBインスタンス数 | `1` |
| `database_name` | `string` | 作成するDB名 | — |
| `master_username` | `string` | マスターユーザー名 | `"dbadmin"` |
| `backup_retention_period` | `number` | バックアップ保持期間（日） | `7` |
| `preferred_backup_window` | `string` | バックアップウィンドウ | `"03:00-04:00"` |
| `preferred_maintenance_window` | `string` | メンテナンスウィンドウ | `"mon:04:00-mon:05:00"` |
| `deletion_protection` | `bool` | 削除保護 | `true` |
| `skip_final_snapshot` | `bool` | 削除時の最終スナップショットスキップ | `false` |

## `main.tf` リソース定義

### random_password (DBマスターパスワード)

`hashicorp/random` プロバイダーが必要。`providers.tf` に追加されていることを確認すること。

```hcl
resource "random_password" "db_master" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}
```

### aws_secretsmanager_secret

```hcl
resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "${var.project_name}/${var.environment}/db"
  recovery_window_in_days = 7

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}
```

### aws_secretsmanager_secret_version

```hcl
resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = var.master_username
    password = random_password.db_master.result
    host     = aws_rds_cluster.main.endpoint
    port     = aws_rds_cluster.main.port
    dbname   = var.database_name
  })
}
```

### aws_db_subnet_group

```hcl
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name        = "${var.project_name}-${var.environment}-db-subnet-group"
    Project     = var.project_name
    Environment = var.environment
  }
}
```

### aws_rds_cluster_parameter_group

`family` はエンジンバージョンに合わせること（上記の早見表を参照）。

```hcl
resource "aws_rds_cluster_parameter_group" "main" {
  name   = "${var.project_name}-${var.environment}-cluster-pg"
  family = "aurora-postgresql15"

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}
```

### aws_db_parameter_group

```hcl
resource "aws_db_parameter_group" "main" {
  name   = "${var.project_name}-${var.environment}-db-pg"
  family = "aurora-postgresql15"

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}
```

### aws_rds_cluster

```hcl
resource "aws_rds_cluster" "main" {
  cluster_identifier              = "${var.project_name}-${var.environment}-cluster"
  engine                          = var.engine
  engine_version                  = var.engine_version
  database_name                   = var.database_name
  master_username                 = var.master_username
  master_password                 = random_password.db_master.result
  db_subnet_group_name            = aws_db_subnet_group.main.name
  db_cluster_parameter_group_name = aws_rds_cluster_parameter_group.main.name
  vpc_security_group_ids          = [var.rds_security_group_id]

  storage_encrypted                   = true
  iam_database_authentication_enabled = true
  deletion_protection                 = var.deletion_protection
  skip_final_snapshot                 = var.skip_final_snapshot
  final_snapshot_identifier           = var.skip_final_snapshot ? null : "${var.project_name}-${var.environment}-final-snapshot"

  backup_retention_period      = var.backup_retention_period
  preferred_backup_window      = var.preferred_backup_window
  preferred_maintenance_window = var.preferred_maintenance_window

  tags = {
    Name        = "${var.project_name}-${var.environment}-cluster"
    Project     = var.project_name
    Environment = var.environment
  }
}
```

### aws_rds_cluster_instance

```hcl
resource "aws_rds_cluster_instance" "main" {
  count              = var.instance_count
  identifier         = "${var.project_name}-${var.environment}-instance-${count.index + 1}"
  cluster_identifier = aws_rds_cluster.main.id
  engine             = aws_rds_cluster.main.engine
  engine_version     = aws_rds_cluster.main.engine_version
  instance_class     = var.instance_class
  db_parameter_group_name = aws_db_parameter_group.main.name

  publicly_accessible = false

  tags = {
    Name        = "${var.project_name}-${var.environment}-instance-${count.index + 1}"
    Project     = var.project_name
    Environment = var.environment
  }
}
```

## `outputs.tf` 定義

| output名 | 値 | 説明 |
|---------|---|------|
| `cluster_endpoint` | `aws_rds_cluster.main.endpoint` | 書き込みエンドポイント |
| `cluster_reader_endpoint` | `aws_rds_cluster.main.reader_endpoint` | 読み取りエンドポイント |
| `cluster_port` | `aws_rds_cluster.main.port` | ポート番号 |
| `database_name` | `aws_rds_cluster.main.database_name` | DB名 |
| `secret_arn` | `aws_secretsmanager_secret.db_credentials.arn` | シークレットARN（ECSタスク定義に渡すため） |
| `cluster_id` | `aws_rds_cluster.main.id` | クラスターID |

## 注意事項

- `deletion_protection = true` はproductionでは必須。devでは `true` のままにし、`terraform destroy` 前に手動で変更を推奨する
- `skip_final_snapshot = false` をproductionで維持すること。devでは `true` にすると削除が容易になる
- `storage_encrypted = true` は必須（デフォルト有効）
- `iam_database_authentication_enabled = true` を設定した場合、ECSタスクロールに `rds-db:connect` 権限が必要
- Secrets ManagerのシークレットARN（`secret_arn` output）をECSモジュールの `container_secrets` に渡すことでコンテナにDB接続情報を安全に注入できる
- `random_password` を使用するため `providers.tf` に `hashicorp/random` プロバイダーの追加が必要
