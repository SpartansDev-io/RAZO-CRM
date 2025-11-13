#!/bin/bash

echo "🚀 Iniciando configuración de Husky + Pre-commit y Pre-push Hooks..."

# Inicializa husky y prepara carpetas necesarias
# npx husky-init && rm -f .husky/pre-commit

# ====== PRE-COMMIT ======
cat > .husky/pre-commit << 'EOF'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# --- Entorno seguro para evitar errores de registro o locale ---
export NPM_CONFIG_REGISTRY=https://registry.npmjs.org/
export LC_ALL=C
export PATH=$PATH:/usr/local/bin

# --- Ejecutar lint-staged ---
npx --yes lint-staged
EOF

chmod +x .husky/pre-commit

# ====== PRE-PUSH ======
cat > .husky/pre-push << 'EOF'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# --- Entorno seguro para evitar errores ---
export NPM_CONFIG_REGISTRY=https://registry.npmjs.org/
export LC_ALL=C
export PATH=$PATH:/usr/local/bin

echo "🔍 Ejecutando lint..."
npm run lint || exit 1

echo "🔧 Ejecutando build..."
npm run build || exit 1

echo "🧪 Ejecutando test..."
npm test || exit 1
EOF

chmod +x .husky/pre-push

# ====== LINT-STAGED CONFIG ======
if ! grep -q "lint-staged" package.json; then
  npx npm-add-script -k lint-staged -v '{
    "**/*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }'
fi

# ====== PREPARE SCRIPT ======
if ! grep -q '"prepare":' package.json; then
  npx npm-add-script -k prepare -v "husky install"
fi

echo "✅ Husky configurado con entorno seguro y hooks listos 🎉"
