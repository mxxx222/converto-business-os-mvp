import * as pulumi from "@pulumi/pulumi";
import * as upstash from "@pulumi/upstash";

// Basic Pulumi stack config for environments; extend with cloud resources as needed.
const config = new pulumi.Config();
const environment = config.get("environment") || "dev";
const renderService = config.get("renderService") || "api-gateway";

export const stack = pulumi.getStack();
export const env = environment;
export const targetService = renderService;

// Placeholder outputs; in production, add providers (AWS/GCP/Azure) and
// model Render infra with custom providers or REST calls from CI.
export const outputs = {
  environment,
  renderService,
};

// Upstash Redis (serverless)
const useUpstash = new pulumi.Config().getBoolean("useUpstash") ?? true;
let redisRestUrl = pulumi.output("");
let redisRestToken = pulumi.output("");
let redisEndpoint = pulumi.output("");
if (useUpstash) {
  const db = new upstash.RedisDatabase("app-redis", {
    databaseName: `converto-${environment}-redis`,
    region: "eu-central-1",
    multizone: true,
    eviction: "volatile_lru",
  });
  redisRestUrl = db.restUrl;
  redisRestToken = db.restToken;
  redisEndpoint = db.endpoint;
}

export const redis = {
  restUrl: redisRestUrl,
  restToken: redisRestToken,
  endpoint: redisEndpoint,
};

// Render Postgres read-replica URL can be injected via Pulumi config
const pgReplicaUrl = config.get("render:postgresReplicaUrl") || "";
export const postgresReplica = {
  url: pgReplicaUrl,
};


