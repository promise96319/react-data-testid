# react-data-testid

## 安装

```bash
pnpm i react-data-testid -g

# OR
pnpm i react-data-testid -D
```

## 使用

### 初始化配置文件

```bash
# 该命令会自动生成 testid 的配置文件
testid init
```

参数说明：

- `src` 表示需要处理的文件路径，格式为 glob 形式。
- `output` 表示生成的测试 id 的保存路径。
- `excludeTags` 表示被排除的标签，不会生成测试 id，默认内置一部分组件库标签。
- `removeExcludeTags` 表示对于被排除的标签，是否将其存在的 data-testid 属性移除，默认为 false。

### 生成 id

```bash
# 该命令会对所有组件都添加上 data-testid。非组件如果标记了 data-testid 属性，也会自动生成测试 id。
qt-tools testid --src="src/**/*.tsx" --output="./.testid.json" --config="./.testidrc"
```

参数说明：（配置文件存在时，可以不用添加参数）

- `--src` 表示需要处理的文件路径，格式为 glob 形式。
- `--output` 表示生成的测试 id 的保存路径。
- `--config` 表示配置文件路径。

以上参数均存在默认值，因此可以直接运行 `qt-tools testid` 即可。
