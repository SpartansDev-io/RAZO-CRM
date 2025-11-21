#!/bin/bash

echo "🚀 Iniciando configuración de Husky + Pre-commit y Pre-push Hooks..."

# Inicializa husky y prepara carpetas necesarias
#npx husky-init && rm -f .husky/pre-commit

# Crea el pre-commit hook
echo '#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged' > .husky/pre-commit

chmod +x .husky/pre-commit

# Crea el pre-push hook
echo '#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Ejecutando lint..."
npm run lint

echo "🔧 Ejecutando build..."
npm run build

echo "🧪 Ejecutando test..."
npm test' > .husky/pre-push

chmod +x .husky/pre-push

# Agrega lint-staged si no está
if ! grep -q "lint-staged" package.json; then
  npx npm-add-script -k lint-staged -v '{
    "**/*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }'
fi

# Agrega script prepare si no está
if ! grep -q '"prepare":' package.json; then
  npx npm-add-script -k prepare -v "husky install"
fi

echo "✅ Husky configurado con éxito 🎉"
