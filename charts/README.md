# Hologram Server Helm Chart

This chart deploys the Hologram Server (NestJS) as a Deployment with a Service, optional ingress, configurable environment variables, and Firebase configuration support.

## Features

- Deploys the server with configurable image repo/tag and replica count.
- Exposes the app via ClusterIP service; optional ingress with TLS via cert-manager.
- Mounts Firebase configuration as a file from an external Kubernetes Secret.
- Captures all required env vars with override support.
- Allows resource request/limit overrides.

## Kubernetes Resources

- **Service** (ClusterIP by default)
- **Deployment**
- **Ingress** (optional, enabled by default)

## Prerequisites

Before deploying, create the Kubernetes Secret containing the Firebase config in the target namespace:

```bash
kubectl create secret generic <secretName> \
  --namespace <namespace> \
  --from-literal=<secretKey>="$(cat firebase-config.json)" \
  --dry-run=client -o yaml | kubectl apply -f -
```

The `secretName` and `secretKey` must match the values set in `firebaseConfig`.

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
| `extraEnv` | Additional env entries (`[{name, value}]`, supports tpl) | see below |
| `firebaseConfig.secretName` | Name of the external Secret | `hologram-server-secrets` |
| `firebaseConfig.secretKey` | Key inside the Secret (also used as filename and `FIREBASE_CFG_FILE` path) | `firebase-config.json` |
| `resources` | Pod resources | see `values.yaml` |
| `ingress.enabled` | Enable ingress | `true` |

> **Note:** The image tag defaults to `Chart.Version` to ensure deployment consistency. It can be overridden for debugging purposes if needed.

### Required environment variables

Defined under `env` with reference values; override per environment:

- `APP_PORT` — Port the application listens on
- `BUCKET_SERVER` — S3-compatible bucket server URL (e.g. MinIO)
- `BUCKET_REGION` — Bucket region
- `MAX_VALIDITY_SECONDS` — Maximum validity for authentication tokens

`FIREBASE_CFG_FILE` is set automatically from `firebaseConfig.secretKey` when `firebaseConfig.enabled: true`.

### Firebase Configuration

The chart expects an external Secret to exist before deploying. The JSON file is mounted into the container and its path is automatically set in `FIREBASE_CFG_FILE`.

```yaml
firebaseConfig:
  secretName: "hologram-server-secrets"  # must exist in the cluster
  secretKey: "firebase-config.json"      # key inside the secret
```

### Extra Environment Variables

Add additional environment variables with `extraEnv`. Values support `tpl`, so you can reference other chart values:

```yaml
extraEnv:
  - name: CUSTOM_ENV_VAR
    value: custom-value
  - name: DERIVED_VAR
    value: "{{ .Values.name }}-suffix"
```

### Resources

| Parameter | Description | Default |
| --- | --- | --- |
| `resources.requests.cpu` | Minimum reserved CPU | `100m` |
| `resources.requests.memory` | Minimum reserved memory | `256Mi` |
| `resources.limits.cpu` | Maximum allowed CPU | `500m` |
| `resources.limits.memory` | Maximum allowed memory | `512Mi` |

## Usage

1. Create the Firebase Secret in the target namespace (see [Prerequisites](#prerequisites)).

2. Update values in your `values.yaml` as needed.

3. Render templates locally:

```bash
helm template ./charts
```

4. Install or upgrade the chart:

```bash
helm upgrade --install hologram-server ./charts \
  -n your-namespace \
  --set env.BUCKET_SERVER=https://minio.example.com
```

5. To uninstall:

```bash
helm uninstall hologram-server -n your-namespace
```
