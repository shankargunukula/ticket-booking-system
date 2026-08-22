// src/frontend-tracing.ts
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { CompositePropagator, W3CTraceContextPropagator } from '@opentelemetry/core';

// 1. Initialize the Web Tracer Provider and supply the span processor inside the constructor directly 🚀
const provider = new WebTracerProvider({
  resource: resourceFromAttributes({
    'service.name': 'ticket-ui-frontend',
  }),
  // 🚀 FIXED: Modern v2.x syntax injects processors as a constructor option matrix array
  spanProcessors: [
    new SimpleSpanProcessor(
      new OTLPTraceExporter({
        url: 'http://localhost:9411/v1/traces', // Ships telemetry payloads straight to Zipkin
      })
    )
  ]
});

// 2. Register the provider with the Zone context manager & standard W3C header format
provider.register({
  contextManager: new ZoneContextManager(),
  propagator: new CompositePropagator({
    propagators: [new W3CTraceContextPropagator()], // Mandates standard traceparent output
  }),
});

// 3. Automatically catch outgoing Fetch and XHR requests
registerInstrumentations({
  tracerProvider: provider,
  instrumentations: [
    new XMLHttpRequestInstrumentation() as any,
    new FetchInstrumentation({
      // Inject tracing headers ONLY to your API Gateway to prevent CORS blocks on external APIs
      propagateTraceHeaderCorsUrls: [
        /http:\/\/localhost:8080\/.*/, // Matches Gateway entryway format
      ],
    }) as any,
  ],
});

console.log("🌐 [OpenTelemetry] Browser Tracing initialized successfully using v2 Constructor specs!");
