# Web Chat con Audio — Instrucciones de Setup

## Objetivo
Crear un endpoint `/chat` en API Gateway que la página web pueda usar para:
1. Enviar texto (del recruiter) → obtener respuesta de Bedrock
2. Obtener audio de la respuesta via Amazon Polly (voz Aria Neural en-NZ)

## Arquitectura

```
Browser (chat.html)
    │
    ├─ Input: Web Speech API (gratis, browser nativo)
    │         Recruiter habla → se convierte a texto en el browser
    │
    ├─ Request: POST https://{API_GATEWAY_URL}/chat
    │           Body: { "text": "Tell me about Roberto" }
    │
    └─ Response: {
           "text": "Roberto is a senior cloud engineer...",
           "audio": "base64-encoded-mp3"
       }
       → Texto se muestra en el chat
       → Audio se reproduce automáticamente
```

## Lo que necesitas crear en AWS

### 1. Lambda: `web-chat-adapter`

Ubicación sugerida en repo: `src/lambda/web-chat-adapter/handler.py`

```python
"""
Lambda: web-chat-adapter
Web Chat → Bedrock fulfillment + Polly TTS → JSON response
"""
import json
import os
import base64
import boto3
from aws_lambda_powertools import Logger

logger = Logger(service="web-chat-adapter")

lambda_client = boto3.client("lambda")
polly_client = boto3.client("polly")

FULFILLMENT_FUNCTION = os.environ.get("FULFILLMENT_FUNCTION_NAME", "dev-fulfillment")
POLLY_VOICE = os.environ.get("POLLY_VOICE", "Aria")
POLLY_ENGINE = os.environ.get("POLLY_ENGINE", "neural")
POLLY_LANGUAGE = os.environ.get("POLLY_LANGUAGE", "en-NZ")


def handler(event, context):
    """Handle web chat request."""
    # CORS preflight
    if event.get("httpMethod") == "OPTIONS":
        return _cors_response(200, "")

    # Parse body
    try:
        body = json.loads(event.get("body", "{}"))
        user_text = body.get("text", "").strip()
    except (json.JSONDecodeError, AttributeError):
        return _cors_response(400, json.dumps({"error": "Invalid JSON body"}))

    if not user_text:
        return _cors_response(400, json.dumps({"error": "Missing 'text' field"}))

    # 1. Call fulfillment Lambda (same as Twilio adapter)
    lex_event = {
        "sessionId": f"web-chat-{context.aws_request_id}",
        "inputTranscript": user_text,
        "currentIntent": {
            "name": "FallbackIntent",
            "nluConfidence": {"score": 0.85},
        },
        "sessionState": {
            "sessionAttributes": {
                "channel": "web-chat",
            }
        },
    }

    try:
        response = lambda_client.invoke(
            FunctionName=FULFILLMENT_FUNCTION,
            InvocationType="RequestResponse",
            Payload=json.dumps(lex_event).encode("utf-8"),
        )
        payload = json.loads(response["Payload"].read())
        messages = payload.get("messages", [])
        response_text = messages[0]["content"] if messages else "Sorry, I couldn't process that."
    except Exception as e:
        logger.error(f"Fulfillment error: {e}")
        response_text = "Sorry, something went wrong."

    # 2. Generate audio with Polly
    audio_base64 = ""
    try:
        polly_response = polly_client.synthesize_speech(
            Text=response_text,
            OutputFormat="mp3",
            VoiceId=POLLY_VOICE,
            Engine=POLLY_ENGINE,
            LanguageCode=POLLY_LANGUAGE,
        )
        audio_stream = polly_response["AudioStream"].read()
        audio_base64 = base64.b64encode(audio_stream).decode("utf-8")
    except Exception as e:
        logger.warning(f"Polly error (fallback to text-only): {e}")

    # 3. Return JSON response
    result = {
        "text": response_text,
        "audio": audio_base64,  # base64 MP3, empty string if Polly failed
    }

    return _cors_response(200, json.dumps(result))


def _cors_response(status_code: int, body: str) -> dict:
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, X-Api-Key",
        },
        "body": body,
    }
```

### 2. API Gateway — Agregar endpoint

En tu API Gateway existente (el que ya tiene `/voice/*`), agregar:

```
POST /chat  → Lambda web-chat-adapter
OPTIONS /chat → Mock integration (CORS preflight)
```

**Configuración recomendada:**
- Throttle: 10 requests/second (evitar abuso)
- API Key: opcional (si quieres control, agrégala como header `X-Api-Key`)
- CORS: habilitado para `*` (o tu dominio CloudFront específico)

### 3. IAM — Permisos del Lambda

El Lambda `web-chat-adapter` necesita:
```json
{
  "Effect": "Allow",
  "Action": [
    "lambda:InvokeFunction",
    "polly:SynthesizeSpeech"
  ],
  "Resource": [
    "arn:aws:lambda:{region}:{account}:function:dev-fulfillment",
    "*"
  ]
}
```

### 4. Variables de entorno del Lambda

| Variable | Valor |
|----------|-------|
| `FULFILLMENT_FUNCTION_NAME` | `dev-fulfillment` (o el nombre que tenga tu Lambda fulfillment) |
| `POLLY_VOICE` | `Aria` |
| `POLLY_ENGINE` | `neural` |
| `POLLY_LANGUAGE` | `en-NZ` |

---

## Página Web (chat.html)

Una vez que el endpoint esté funcionando, actualizar la variable en `chat.html`:

```javascript
const ARIA_API_URL = "https://{tu-api-gateway-id}.execute-api.{region}.amazonaws.com/{stage}/chat";
```

---

## Testing Manual

```bash
curl -X POST https://{API_GATEWAY_URL}/chat \
  -H "Content-Type: application/json" \
  -d '{"text": "Tell me about Roberto"}' \
  | jq '.text'
```

---

## Costo estimado

| Componente | Costo por request |
|-----------|-------------------|
| API Gateway | $0.0000035 |
| Lambda (256MB, ~3s) | $0.0000125 |
| Bedrock Claude Haiku | ~$0.001 |
| Polly Neural | ~$0.004 por 100 chars |
| **Total por pregunta** | **~$0.006 - $0.01** |

Con 100 preguntas/día = ~$1/día máximo.

---

## Autor
Roberto Moreno Araneda — roberto.moreno.a@gmail.com
