// backend/tracing.js
const opentelemetry = require('@opentelemetry/api');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-node');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');

// 1. Initialize and configure the unified OpenTelemetry Node SDK configuration
const sdk = new NodeSDK({
  // Safely compile resource service naming mappings
  resource: resourceFromAttributes({
    'service.name': process.env.APP_ID || 'registration-service',
  }),

  // Attach the automated backend communication hook engines
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation()
  ],

  // Direct telemetry data processing loops out to Zipkin
  spanProcessors: [
    new SimpleSpanProcessor(
      new ZipkinExporter({
        url: process.env.ZIPKIN_ENDPOINT || 'http://ticket-zipkin:9411/api/v2/spans',
      })
    )
  ]
});

// 2. Start the tracking agent engine inside the application lifecycle
try {
  sdk.start();
  console.log("📡 [OpenTelemetry] Tracing agent injected successfully. Exporting to Zipkin.");
} catch (error) {
  console.error("❌ OpenTelemetry failed to initialize cleanly:", error.message);
}

// 3. Handle system shutdown signals to prevent telemetry memory leaks
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated.'))
    .catch((err) => console.log('Error terminating tracing', err))
    .finally(() => process.exit(0));
});
