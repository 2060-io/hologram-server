# Hologram Server

Mobile app authentication service providing temporary MinIO STS credentials through Firebase App Check validation.

## Overview

Hologram Server authenticates legitimate mobile applications via Firebase and delivers temporary credentials to interact with MinIO. This eliminates the need for an additional App Check service and maintains control over file uploads through time-bound credentials.

## Features

- Firebase App Check validation for mobile app authentication
- Temporary STS credentials generation with controlled validity period
- Fine-grained access control per session
- Direct upload capability to MinIO without backend mediation

## Installation

### Requirements

- Node.js 18+
- pnpm 9+

### Setup

```bash
git clone git@github.com:2060-io/hologram-server.git
cd hologram-server
pnpm install
cp .env.example .env
pnpm start:dev
```

## Environment Variables
| Variable             | Default Value                      | Description                                                                                                  |
| -------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `appPort`            | `3000`                             | Port where the application runs. It reads from `APP_PORT`; if not set, it defaults to `3000`.              |
| `bucketServer`       | `https://p2800.ovpndev.mobiera.io` | Storage server (MinIO / bucket) URL where STS credentials are requested.                                     |
| `bucketRegion`       | `us-east-1`                        | Bucket region used when generating STS credentials.                                                          |
| `firebaseCfgFile`    | `./tests/test-firebase-cfg.json`   | Path to the Firebase configuration/service account file used by the backend to validate the App Check token. |
| `firebaseProjectId`  | _(unset)_                          | Google Cloud project id read from `FIREBASE_PROJECT_ID`. Used when the file in `firebaseCfgFile` does not exist. App Check token verification needs no service account. |
| `appCheckVerify`     | `true`                             | Enables App Check token verification. It reads from `APP_CHECK_VERIFY`; set it to `false` to accept every non-empty token. |
| `maxValiditySeconds` | `900`                              | Maximum validity time (in seconds) for the generated STS credentials.                                        |

> **Warning:** `APP_CHECK_VERIFY=false` is for tests only. The server then accepts every non-empty token and logs a warning at startup and for each request. Never use it in production.

The server reads the Firebase configuration in this order:

1. The file in `firebaseCfgFile` exists: it initializes Firebase with that service account.
2. `FIREBASE_PROJECT_ID` is set: it initializes Firebase with the project id only.
3. `APP_CHECK_VERIFY=false`: it does not initialize Firebase.
4. None of the above: the server fails to start.


## Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    participant Mobile as Hologram App
    participant Firebase as Firebase App Check
    participant Minio as MinIO STS Service
    participant Backend as Backend (Hologram Server)

    Mobile->>Firebase: Request App Check token
    Firebase-->>Mobile: Return App Check token

    Mobile->>Minio: Request STS credentials<br/>with App Check token

    Minio->>Backend: Validate App Check token

    Backend->>Backend: Validate token using<br/>Firebase config file
    Backend-->>Minio: Token valid (OK to issue STS)

    Minio->>Minio: Generate time-bound STS credentials
    Minio-->>Mobile: Return STS credentials

    Mobile->>Minio: Upload file using STS credentials
    Minio-->>Mobile: Upload successful
```

### Benefits

- Integrated authentication without additional services
- Short-lived credentials enhance security
- Backend doesn't mediate file transfers
- Granular control per upload session
