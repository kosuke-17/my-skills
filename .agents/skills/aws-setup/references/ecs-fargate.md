# ECS/Fargateモジュール定義

このファイルを更新することで、ECS/Fargate構成のTerraformリソース定義を変更できる。Phase 4 の実装はこのファイルの定義に従うこと。

## モジュール概要

- **モジュールパス**: `modules/ecs/`
- **責務**: ECSクラスター、タスク定義、ECSサービス、ALB、IAMロール、CloudWatch Logsの作成
- **依存モジュール**: `modules/network/`（vpc_id, subnet_ids, security_group_ids が必要）

## ディレクトリ構造

```
modules/ecs/
├── main.tf
├── variables.tf
└── outputs.tf
```

## `variables.tf` 定義

| 変数名 | type | description |
|--------|------|-------------|
| `project_name` | `string` | プロジェクト名 |
| `environment` | `string` | 環境名 |
| `vpc_id` | `string` | networkモジュールから受け取るVPC ID |
| `public_subnet_ids` | `list(string)` | ALB配置用パブリックサブネットIDリスト |
| `private_subnet_ids` | `list(string)` | ECSタスク配置用プライベートサブネットIDリスト |
| `alb_security_group_id` | `string` | ALB用セキュリティグループID |
| `ecs_security_group_id` | `string` | ECSタスク用セキュリティグループID |
| `container_image` | `string` | コンテナイメージURI（例: 123456789.dkr.ecr.ap-northeast-1.amazonaws.com/app:latest） |
| `container_port` | `number` | コンテナが公開するポート番号 |
| `container_cpu` | `number` | タスクCPUユニット（256/512/1024/2048/4096） |
| `container_memory` | `number` | タスクメモリ（MiB） |
| `service_desired_count` | `number` | ECSサービスの希望タスク数 |
| `container_environment` | `list(object({name=string, value=string}))` | コンテナ環境変数 |
| `container_secrets` | `list(object({name=string, valueFrom=string}))` | Secrets Managerから注入するシークレット |
| `health_check_path` | `string` | ALBヘルスチェックパス |

## `main.tf` リソース定義

### aws_ecs_cluster

Container Insights を有効化すること（`containerInsights` を `enabled` に設定）。

```hcl
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-${var.environment}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-cluster"
    Project     = var.project_name
    Environment = var.environment
  }
}
```

> **注意**: Container Insightsは追加料金が発生する。dev環境では `value = "disabled"` への変更も検討する。

### aws_iam_role (タスク実行ロール)

ECSエージェントがECRからイメージを取得し、CloudWatch Logsに書き込むために必要なロール。

```hcl
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.project_name}-${var.environment}-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}
```

`container_secrets` を使う場合は以下のインラインポリシーも追加すること:

```hcl
resource "aws_iam_role_policy" "ecs_task_execution_secrets" {
  name = "${var.project_name}-${var.environment}-ecs-secrets-policy"
  role = aws_iam_role.ecs_task_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "secretsmanager:GetSecretValue",
        "kms:Decrypt"
      ]
      Resource = ["*"]
    }]
  })
}
```

### aws_iam_role (タスクロール)

アプリコンテナ自身がAWSサービスを呼び出すためのロール。

```hcl
resource "aws_iam_role" "ecs_task_role" {
  name = "${var.project_name}-${var.environment}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}
```

RDSのIAM認証を使う場合はタスクロールに `rds-db:connect` 権限を追加すること。

### aws_cloudwatch_log_group

```hcl
resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.project_name}-${var.environment}"
  retention_in_days = 30

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}
```

### aws_ecs_task_definition

Fargate互換、`network_mode = "awsvpc"` を必ず設定すること。

```hcl
resource "aws_ecs_task_definition" "main" {
  family                   = "${var.project_name}-${var.environment}-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.container_cpu
  memory                   = var.container_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([{
    name      = "${var.project_name}-${var.environment}-app"
    image     = var.container_image
    essential = true

    portMappings = [{
      containerPort = var.container_port
      protocol      = "tcp"
    }]

    environment = var.container_environment
    secrets     = var.container_secrets

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
        "awslogs-region"        = data.aws_region.current.name
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

data "aws_region" "current" {}
```

### aws_lb (ALB)

```hcl
resource "aws_lb" "main" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = var.public_subnet_ids

  tags = {
    Name        = "${var.project_name}-${var.environment}-alb"
    Project     = var.project_name
    Environment = var.environment
  }
}
```

### aws_lb_target_group

```hcl
resource "aws_lb_target_group" "main" {
  name        = "${var.project_name}-${var.environment}-tg"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = var.health_check_path
    matcher             = "200-299"
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}
```

### aws_lb_listener

```hcl
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }
}
```

### aws_ecs_service

`assign_public_ip = false` の場合はNAT Gatewayが必要（Phase 3の `enable_nat_gateway` 参照）。

```hcl
resource "aws_ecs_service" "main" {
  name            = "${var.project_name}-${var.environment}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.main.arn
  desired_count   = var.service_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.main.arn
    container_name   = "${var.project_name}-${var.environment}-app"
    container_port   = var.container_port
  }

  depends_on = [aws_lb_listener.http]

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}
```

## コンテナ定義JSONの構造

`container_definitions` の `jsonencode()` ブロックで含めるべきフィールド:

| フィールド | 説明 |
|-----------|------|
| `name` | コンテナ名 |
| `image` | `var.container_image` から設定 |
| `portMappings` | `containerPort`, `protocol: tcp` |
| `environment` | `var.container_environment` から設定 |
| `secrets` | `var.container_secrets` から設定（Secrets Manager ARNを参照） |
| `logConfiguration` | `awslogs` ドライバー, `awslogs-group`, `awslogs-region`, `awslogs-stream-prefix` を設定 |
| `essential` | `true` |

## `outputs.tf` 定義

| output名 | 値 | 説明 |
|---------|---|------|
| `cluster_id` | `aws_ecs_cluster.main.id` | ECSクラスターID |
| `cluster_name` | `aws_ecs_cluster.main.name` | ECSクラスター名 |
| `service_name` | `aws_ecs_service.main.name` | ECSサービス名 |
| `alb_dns_name` | `aws_lb.main.dns_name` | ALBのDNS名 |
| `alb_zone_id` | `aws_lb.main.zone_id` | ALBのホストゾーンID（Route53用） |
| `task_execution_role_arn` | `aws_iam_role.ecs_task_execution_role.arn` | タスク実行ロールARN |
| `task_role_arn` | `aws_iam_role.ecs_task_role.arn` | タスクロールARN |
| `log_group_name` | `aws_cloudwatch_log_group.ecs.name` | CloudWatch Logsグループ名 |
