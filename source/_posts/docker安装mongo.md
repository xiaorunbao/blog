---
title: docker安装mongo
---

## docker 拉取镜像和容器启动

### 获取 mongo 镜像

```bash
docker pull mongo
```

### 创建 volume 映射

```bash
docker volume create mongodb
docker volume create mongodb_config

docker network create mongodb
```

### 创建 network 映射

```bash
docker network create mongodb
```

### 启动容器

```bash
docker run -it -d -v mongodb:/data/db \
 -v mongodb_config:/data/configdb -p 27017:27017 \
 --network mongodb \
 --name mongodb \
 mongo
```

## 设置 mongo 登录用户密码

### 进入容器

```bash
docker exec -it mongodb bash
```

### 使用 admin 库（database）

```bash
use admin
```

### 创建用户

> user: 用户名
>
> pwd: 密码
>
> role 角色配置，此处直接使用 admin 管理员权限

```bash
db.createUser({user: "admin",pwd: "123456",roles: [ { role: "userAdminAnyDatabase", db: "admin"}]})
```

## 远程连接和端口配置

### 配置端口映射（暴露端口号）

> NOTE: 虚拟机没有防火墙安全策略配置的，默认开放全部端口。如 果有防火墙配置，此处不映射端口，不能远程连接。

1. 查看防火墙状态

```bash
   sudo firewall-cmd --state
```

![显示状态](20210323091547.png)

2. 查看指定端口是否开发

```bash
sudo firewall-cmd --query-port=8080/tcp
```

> 端口改为想要的端口

![显示状态](20210323091932.png)

3. 开发 mongo 默认端口

```bash
 sudo  firewall-cmd --zone=public --add-port=27017/tcp --permanent
```

> permanent: 永久有效

4. 查询端口状态

```bash
sudo firewall-cmd --query-port=27017/tcp
```

![显示状态](20210323092306.png)
