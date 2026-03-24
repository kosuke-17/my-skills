# VPC・ネットワークモジュール定義

このファイルを更新することで、ネットワーク構成のTerraformリソース定義を変更できる。Phase 3 の実装はこのファイルの定義に従うこと。

## モジュール概要

- **モジュールパス**: `modules/network/`
- **責務**: VPC、サブネット（パブリック/プライベート）、IGW、NAT Gateway、ルートテーブル、セキュリティグループの作成
- **他モジュールへの依存**: なし（ネットワーク層は最初に構築する）

## ディレクトリ構造

```
modules/network/
├── main.tf        # リソース定義
├── variables.tf   # 入力変数
└── outputs.tf     # 出力値
```

## `variables.tf` 定義

| 変数名 | type | description | default |
|--------|------|-------------|---------|
| `project_name` | `string` | プロジェクト名（リソース命名に使用） | — |
| `environment` | `string` | 環境名（dev/staging/production） | — |
| `vpc_cidr` | `string` | VPC の CIDR ブロック | `"10.0.0.0/16"` |
| `availability_zones` | `list(string)` | 使用するAZのリスト | — |
| `public_subnet_cidrs` | `list(string)` | パブリックサブネットのCIDRリスト | — |
| `private_subnet_cidrs` | `list(string)` | プライベートサブネットのCIDRリスト | — |
| `enable_nat_gateway` | `bool` | NAT Gatewayを有効にするか | `true` |
| `single_nat_gateway` | `bool` | NAT GatewayをAZ共有にするか（コスト削減） | `false` |

## `main.tf` リソース定義

全リソースの命名規則: `"${var.project_name}-${var.environment}-<リソース種別>"`
全リソースに `Name` タグ、`Project`、`Environment` の共通タグを付与すること。

### aws_vpc

```hcl
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-vpc"
    Project     = var.project_name
    Environment = var.environment
  }
}
```

### aws_subnet (パブリック)

```hcl
resource "aws_subnet" "public" {
  count                   = length(var.public_subnet_cidrs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-public-subnet-${count.index + 1}"
    Project     = var.project_name
    Environment = var.environment
  }
}
```

### aws_subnet (プライベート)

```hcl
resource "aws_subnet" "private" {
  count             = length(var.private_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name        = "${var.project_name}-${var.environment}-private-subnet-${count.index + 1}"
    Project     = var.project_name
    Environment = var.environment
  }
}
```

### aws_internet_gateway

```hcl
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "${var.project_name}-${var.environment}-igw"
    Project     = var.project_name
    Environment = var.environment
  }
}
```

### aws_eip (NAT Gateway用)

```hcl
resource "aws_eip" "nat" {
  count  = var.single_nat_gateway ? 1 : length(var.public_subnet_cidrs)
  domain = "vpc"

  tags = {
    Name        = "${var.project_name}-${var.environment}-nat-eip-${count.index + 1}"
    Project     = var.project_name
    Environment = var.environment
  }
}
```

### aws_nat_gateway

```hcl
resource "aws_nat_gateway" "main" {
  count         = var.enable_nat_gateway ? (var.single_nat_gateway ? 1 : length(var.public_subnet_cidrs)) : 0
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  depends_on = [aws_internet_gateway.main]

  tags = {
    Name        = "${var.project_name}-${var.environment}-nat-gw-${count.index + 1}"
    Project     = var.project_name
    Environment = var.environment
  }
}
```

### aws_route_table (パブリック)

```hcl
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-public-rt"
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}
```

### aws_route_table (プライベート)

```hcl
resource "aws_route_table" "private" {
  count  = var.enable_nat_gateway ? (var.single_nat_gateway ? 1 : length(var.private_subnet_cidrs)) : 0
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = var.single_nat_gateway ? aws_nat_gateway.main[0].id : aws_nat_gateway.main[count.index].id
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-private-rt-${count.index + 1}"
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_route_table_association" "private" {
  count          = length(aws_subnet.private)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = var.single_nat_gateway ? aws_route_table.private[0].id : aws_route_table.private[count.index].id
}
```

### aws_security_group (ALB用)

```hcl
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-${var.environment}-alb-sg"
  description = "Security group for ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-alb-sg"
    Project     = var.project_name
    Environment = var.environment
  }
}
```

### aws_security_group (ECS用)

```hcl
resource "aws_security_group" "ecs" {
  name        = "${var.project_name}-${var.environment}-ecs-sg"
  description = "Security group for ECS tasks"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port                = 0
    to_port                  = 65535
    protocol                 = "tcp"
    source_security_group_id = aws_security_group.alb.id
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-ecs-sg"
    Project     = var.project_name
    Environment = var.environment
  }
}
```

### aws_security_group (RDS用)

```hcl
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-${var.environment}-rds-sg"
  description = "Security group for RDS Aurora"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port                = 5432
    to_port                  = 5432
    protocol                 = "tcp"
    source_security_group_id = aws_security_group.ecs.id
    description              = "Allow PostgreSQL from ECS tasks"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-rds-sg"
    Project     = var.project_name
    Environment = var.environment
  }
}
```

> **注意**: Aurora MySQL の場合はポートを `3306` に変更すること。

## `outputs.tf` 定義

| output名 | 値 | 説明 |
|---------|---|------|
| `vpc_id` | `aws_vpc.main.id` | VPC ID |
| `public_subnet_ids` | `aws_subnet.public[*].id` | パブリックサブネットIDリスト |
| `private_subnet_ids` | `aws_subnet.private[*].id` | プライベートサブネットIDリスト |
| `alb_security_group_id` | `aws_security_group.alb.id` | ALB用SG ID |
| `ecs_security_group_id` | `aws_security_group.ecs.id` | ECS用SG ID |
| `rds_security_group_id` | `aws_security_group.rds.id` | RDS用SG ID |
