# JS Analyzer Backend Architecture

The backend is a Caido plugin layer that provides JavaScript and static file analysis. It follows a layered architecture: API handlers validate input and delegate to services; services orchestrate business logic and call repositories/stores; analyzers are pure functions that produce matches from content.

## Layer Diagram

```mermaid
flowchart TB
    subgraph API [API Layer]
        scan[api/scan.ts]
        config[api/config.ts]
        staticAssets[api/staticAssets.ts]
    end

    subgraph Services [Services Layer]
        scanService[scanService.ts]
        autoScan[autoScanService.ts]
        beautify[beautifyService.ts]
        offsetMapper[offsetMapper.ts]
        npmVerifier[npmVerifier.ts]
    end

    subgraph Data [Data Layer]
        staticAssetsRepo[repositories/staticAssets.ts]
        configStore[stores/configStore.ts]
        scanResultsStore[stores/scanResultsStore.ts]
    end

    subgraph Analyzers [Analysis Layer]
        runPassiveScan[runPassiveScan.ts]
        runAnalyzers[runAnalyzers]
        analyzerMap[ANALYZER_MAP - 12 analyzers]
    end

    subgraph Events [Events]
        eventBus[eventBus - internal]
        sdkApi[sdk.api.send - Caido]
    end

    scan --> scanService
    config --> configStore
    staticAssets --> staticAssetsRepo
    scanService --> runPassiveScan
    scanService --> configStore
    scanService --> scanResultsStore
    scanService --> eventBus
    scanService --> sdkApi
    runPassiveScan --> runAnalyzers
    runAnalyzers --> analyzerMap
    scanService --> beautify
    scanService --> offsetMapper
    scanService --> npmVerifier
    staticAssetsRepo --> sdk[Caido SDK]
```

## Scan Request Flow

```mermaid
sequenceDiagram
    participant Frontend
    participant API as api/scan.ts
    participant ScanService as scanService.ts
    participant SDK as Caido SDK
    participant RunPassiveScan as runPassiveScan.ts
    participant RunAnalyzers as runAnalyzers
    participant Store as scanResultsStore

    Frontend->>API: runPassiveScan(requestIds, analyzers)
    API->>API: scanRequestSchema.safeParse()
    API->>ScanService: startPassiveScan()

    ScanService->>ScanService: generateScanId, abortSignal
    loop For each requestId
        ScanService->>SDK: sdk.requests.get(requestId)
        SDK-->>ScanService: request, response
        ScanService->>ScanService: Filter .js/.json, dedupe by URL
        ScanService->>ScanService: Build ScanFileInput[]
    end

    ScanService->>ScanService: emit("scan-started")
    ScanService->>RunPassiveScan: runPassiveScanOnFiles(files, options)

    loop For each file
        RunPassiveScan->>RunPassiveScan: beautifyJs if minified
        RunPassiveScan->>RunAnalyzers: runAnalyzers(content, kinds, url)
        RunAnalyzers->>RunAnalyzers: ANALYZER_MAP[kind](content, url)
        RunAnalyzers-->>RunPassiveScan: AnalyzerMatch[]
        RunPassiveScan->>ScanService: onProgress callback
        ScanService->>SDK: sdk.api.send("scan-progress")
    end

    RunPassiveScan-->>ScanService: ScanResultEntry[]
    ScanService->>ScanService: mapBeautifiedOffsetsToRaw()
    ScanService->>ScanService: enrichDependencyConfusion (optional)
    ScanService->>Store: persistScanResult()
    ScanService->>SDK: sdk.api.send("scan-complete")
    ScanService-->>API: ScanResult
    API-->>Frontend: Result Ok ScanResult
```

## Event Flow

```mermaid
flowchart LR
    subgraph Internal [Internal eventBus]
        scanStarted[scan-started]
        scanFileComplete[scan-file-complete]
        scanFinished[scan-finished]
        scanError[scan-error]
        assetDetected[asset-detected]
    end

    subgraph Caido [sdk.api.send to Frontend]
        scanProgress[scan-progress]
        scanComplete[scan-complete]
        assetDetectedSend[asset-detected]
    end

    scanService[scanService.ts] --> scanStarted
    scanService --> scanFileComplete
    scanService --> scanProgress
    scanService --> scanComplete
    autoScanService[autoScanService.ts] --> assetDetected
    autoScanService --> assetDetectedSend
```

Internal events (`scan-started`, `scan-file-complete`, etc.) are used for backend coordination. Caido events (`scan-progress`, `scan-complete`, `asset-detected`) are sent to the frontend via `sdk.api.send()` for UI updates.

## Directory Structure

```
packages/backend/src/
├── index.ts              # Plugin entry, API registration, init
├── sdk.ts                # SDK singleton (getSDK, setSDK)
├── constants.ts          # Static asset detection, query page size
│
├── api/                  # API layer - Caido handlers
│   ├── scan.ts           # runPassiveScan, runPassiveScanOnContent, getScanResults, cancelScan
│   ├── config.ts         # getConfig, updateConfig
│   └── staticAssets.ts   # getStaticAssets
│
├── services/             # Business logic
│   ├── scanService.ts    # startPassiveScan, cancelScan, enrichDependencyConfusion
│   ├── autoScanService.ts # Intercept response handler, asset-detected events
│   ├── beautifyService.ts # JS beautification for minified content
│   ├── offsetMapper.ts   # Map beautified offsets back to raw content
│   └── npmVerifier.ts    # NPM package verification (dependencyConfusion)
│
├── repositories/         # Data access
│   └── staticAssets.ts   # getStaticAssetsFromHistory (Caido request history)
│
├── stores/               # State persistence (JSON on disk)
│   ├── index.ts
│   ├── projectStore.ts   # GlobalStore, ProjectScopedStore base
│   ├── configStore.ts   # User config (config.json, global)
│   └── scanResultsStore.ts # Scan results (scan-results.json, project-scoped)
│
├── events/               # Internal event bus
│   ├── index.ts
│   ├── eventBus.ts       # on, off, emit, reset
│   └── types.ts          # InternalEventMap
│
├── validation/           # Input validation
│   └── schemas.ts        # Zod schemas (scanRequest, scanContent, config, filter)
│
├── analyzers/            # Analysis modules
│   ├── index.ts          # runAnalyzers, ANALYZER_MAP
│   ├── types.ts          # AnalyzerFn, AnalyzerRegistry
│   ├── runPassiveScan.ts # scanSingleFile, runPassiveScanOnFiles
│   ├── apiEndpoints.ts
│   ├── callPatterns.ts
│   ├── chunkDiscovery.ts
│   ├── cloudUrls.ts
│   ├── dependencyConfusion.ts
│   ├── frameworkPatterns.ts
│   ├── inlineSourceMap.ts
│   ├── secrets.ts
│   ├── securitySinks.ts
│   ├── sensitiveData.ts
│   ├── stringExpressions.ts
│   ├── subdomains.ts
│   └── patterns/
│       ├── cloudPatterns.ts
│       ├── chunkPatterns.ts
│       ├── frameworkPatterns.ts
│       ├── secretPatterns.ts
│       ├── securitySinkPatterns.ts
│       └── sensitiveDataPatterns.ts
│
└── errors/               # Custom error types
    └── index.ts          # StoreError, ScanError
```

## Key Components

| Layer | Purpose |
|-------|---------|
| **api/** | Caido API handlers. Validate input with Zod, call services, return `Result<T>`. No business logic. |
| **services/** | Orchestration. `scanService` drives the scan lifecycle: fetch requests, build files, run analyzers, map offsets, persist. `autoScanService` reacts to intercepted responses. |
| **repositories/** | Access Caido request history via `sdk.requests.query()`. `getStaticAssetsFromHistory` filters by scope/HTTPQL and content type. |
| **stores/** | Persist config and scan results to JSON files. Config is global; scan results are project-scoped. |
| **analyzers/** | Pure functions `(content, url?) => AnalyzerMatch[]`. 12 analyzers registered in `ANALYZER_MAP`. Pattern-based; no side effects. |
| **events/** | Internal pub/sub for backend coordination. Caido events sent via `sdk.api.send()` to frontend. |
| **validation/** | Zod schemas for API inputs. Single source of truth for request shapes. |
| **errors/** | Custom error classes for store failures, scan failures, filter/asset errors. |

## Persistence

| Store | Type | File | Scope |
|-------|------|------|-------|
| Config | GlobalStore | `config.json` | Plugin-wide |
| Scan results | ProjectScopedStore | `projects/{projectId}/scan-results.json` | Per project |

## Dependencies

- **Caido**: `caido:plugin`, `caido:utils` (Request, Response, Cursor)
- **Shared**: `shared` (AnalyzerKind, ScanResult, UserConfig, etc.)
- **Validation**: `zod`
