#!/bin/sh
set -e

# Substitute environment variables in assets/env.js using assets/env.template.js
ENV_TEMPLATE="/usr/share/nginx/html/assets/env.template.js"
ENV_OUTPUT="/usr/share/nginx/html/assets/env.js"

if [ -f "$ENV_TEMPLATE" ]; then
  echo "Injecting container environment variables into assets/env.js..."
  envsubst '${GROQ_API_KEY} ${GROQ_MODEL} ${GROQ_BASE_URL} ${GROQ_TEMPERATURE}' < "$ENV_TEMPLATE" > "$ENV_OUTPUT"
fi

exec "$@"
