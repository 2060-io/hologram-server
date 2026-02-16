# Hologram Server Helm Chart

This chart deploys the Hologram Server (NestJS) as a Deployment with a Service, optional ingress, configurable environment variables, and Firebase configuration support.

## Features

- Deploys the server with configurable image repo/tag and replica count.
- Exposes the app via ClusterIP service; optional ingress with TLS via cert-manager.
- Mounts Firebase configuration as a file from a ConfigMap.
- Captures all required env vars with override support.
- Allows resource request/limit overrides.

## Kubernetes Resources

- **Service** (ClusterIP by default)
- **Deployment**
- **ConfigMap** (for Firebase configuration)
- **Ingress** (optional, enabled by default)

## Configuration

| Parameter | Description | Default |
| --- | --- | --- |
| `name` | Application name/labels | `hologram-server` |
| `host` | Hostname prefix for ingress | `hologram` |
| `replicas` | Deployment replicas | `1` |
| `image.repository` | Image repository | `io2060/hologram-server` |
| `image.tag` | Image tag | `Chart.Version` |
| `image.pullPolicy` | Image pull policy | `IfNotPresent` |
| `service.type` | Service type | `ClusterIP` |
| `service.port` | Service port | `3000` |
| `service.targetPort` | Container port | `3000` |
| `env` | Required env vars (see below) | defaults |
| `extraEnv` | Additional env entries (`[{name, value}]`) | `[]` |
| `firebaseConfig.enabled` | Mount Firebase config file | `true` |
| `firebaseConfig.content` | Firebase config JSON content | `"{}"` |
| `resources` | Pod resources | see `values.yaml` |
| `ingress.enabled` | Enable ingress | `true` |

> **Note:** The image tag defaults to `Chart.Version` to ensure deployment consistency. It can be overridden for debugging purposes if needed.

### Required environment variables

Defined under `env` with reference values; override per environment:

- `APP_PORT` — Port the application listens on
- `BUCKET_SERVER` — S3-compatible bucket server URL (e.g. MinIO)
- `BUCKET_REGION` — Bucket region
- `FIREBASE_CFG_FILE` — Path to the Firebase configuration file inside the container
- `MAX_VALIDITY_SECONDS` — Maximum validity for authentication tokens

### Firebase Configuration

The chart creates a ConfigMap with the Firebase configuration and mounts it into the container. Provide the JSON content via `firebaseConfig.content`:

```yaml
firebaseConfig:
  enabled: true
  content: |
    {
      "type": "service_account",
      "project_id": "your-project",
      ...
    }
```

### Resources

| Parameter | Description | Default |
| --- | --- | --- |
| `resources.requests.cpu` | Minimum reserved CPU | `100m` |
| `resources.requests.memory` | Minimum reserved memory | `256Mi` |
| `resources.limits.cpu` | Maximum allowed CPU | `500m` |
| `resources.limits.memory` | Maximum allowed memory | `512Mi` |

### Extra Environment Variables

Add additional environment variables with `extraEnv`:

```yaml
extraEnv:
  - name: CUSTOM_ENV_VAR
    value: custom-value
```

## Usage

1. Update values in your `values.yaml` file as needed.

2. Render templates locally:

```bash
helm template ./charts
```

3. Install or upgrade the chart:

```bash
helm upgrade --install hologram-server ./charts \
  -n your-namespace \
  --set env.BUCKET_SERVER=https://minio.example.com \
  --set firebaseConfig.content="$(cat firebase-config.json)"
```

4. To uninstall:

```bash
helm uninstall hologram-server -n your-namespace
```
