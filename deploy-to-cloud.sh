#!/usr/bin/env bash
# Despliega el backend de Hive al proyecto Supabase CLOUD.
# Requisitos previos:
#   1) Autenticación:  supabase login    (o export SUPABASE_ACCESS_TOKEN=<PAT>)
#   2) La DB password del proyecto cloud.
#
# Uso:
#   ./deploy-to-cloud.sh '<DB_PASSWORD>'
#
# Todo lo demás (anon/service keys) se obtiene solo vía CLI.
set -euo pipefail

PROJECT_REF="llvkindxhxmdvvjcffll"
PROJECT_URL="https://${PROJECT_REF}.supabase.co"
DB_PASSWORD="${1:-${SUPABASE_DB_PASSWORD:-}}"

ATLETA_EMAIL="atleta@hive.cl";  ATLETA_PASS="Atleta123!"
ADMIN_EMAIL="admin@hive.cl";    ADMIN_PASS="Admin123!"

export PATH="/opt/homebrew/bin:$PATH"
cd "$(dirname "$0")"

if [[ -z "$DB_PASSWORD" ]]; then
  echo "ERROR: falta la DB password. Uso: ./deploy-to-cloud.sh '<DB_PASSWORD>'"; exit 1
fi

echo "==> 0/6  Verificando autenticación..."
supabase projects list >/dev/null 2>&1 || { echo "ERROR: no autenticado. Corre 'supabase login' o exporta SUPABASE_ACCESS_TOKEN."; exit 1; }

echo "==> 1/6  Vinculando proyecto $PROJECT_REF ..."
supabase link --project-ref "$PROJECT_REF" --password "$DB_PASSWORD"

echo "==> 2/6  Aplicando schema (db push) ..."
supabase db push --linked --password "$DB_PASSWORD" --yes

echo "==> 3/6  Desplegando edge function review-verification ..."
supabase functions deploy review-verification --project-ref "$PROJECT_REF" --use-api

echo "==> 4/6  Obteniendo llaves del proyecto ..."
KEYS_JSON="$(supabase projects api-keys --project-ref "$PROJECT_REF" --reveal --output json)"
read -r ANON_KEY SERVICE_KEY < <(node -e '
  let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{
    const a=JSON.parse(d);
    const f=n=>(a.find(k=>k.name===n)||{}).api_key||"";
    process.stdout.write(f("anon")+" "+f("service_role"));
  });' <<<"$KEYS_JSON")
if [[ -z "$ANON_KEY" || -z "$SERVICE_KEY" ]]; then echo "ERROR: no pude leer las llaves."; exit 1; fi
echo "    anon/service obtenidas."

echo "==> 5/6  Creando usuarios (atleta + admin) y aplicando roles ..."
create_user(){ # email pass -> imprime user id
  curl -s -X POST "$PROJECT_URL/auth/v1/admin/users" \
    -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" -H "Content-Type: application/json" \
    -d "{\"email\":\"$1\",\"password\":\"$2\",\"email_confirm\":true}" \
  | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{const j=JSON.parse(d);process.stdout.write(j.id||j.user_id||"")}catch(e){process.stdout.write("")}})'
}
ATLETA_ID="$(create_user "$ATLETA_EMAIL" "$ATLETA_PASS")"
ADMIN_ID="$(create_user "$ADMIN_EMAIL" "$ADMIN_PASS")"
echo "    atleta=$ATLETA_ID  admin=$ADMIN_ID"

# atleta: perfil aprobado -> entra directo al Home
curl -s -o /dev/null -X PATCH "$PROJECT_URL/rest/v1/profiles?id=eq.$ATLETA_ID" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" -H "Content-Type: application/json" -H "Prefer: return=minimal" \
  -d '{"full_name":"Antonia Rivas","verification_status":"approved","is_verified":true,"onboarding_completed":true,"phone_number":"+56912345678","phone_verified":true,"birth_date":"1995-04-12"}'

# admin: fila en admin_users
curl -s -o /dev/null -X POST "$PROJECT_URL/rest/v1/admin_users" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates,return=minimal" \
  -d "{\"user_id\":\"$ADMIN_ID\",\"role\":\"admin\"}"

echo "==> 6/6  Reapuntando .env y admin-review/config.js al cloud ..."
cat > .env <<EOF
EXPO_PUBLIC_SUPABASE_URL=$PROJECT_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY
EOF
cat > admin-review/config.js <<EOF
// Apuntado al proyecto Supabase CLOUD.
window.HIVE_ADMIN_CONFIG = {
  supabaseUrl: '$PROJECT_URL',
  supabaseAnonKey: '$ANON_KEY',
  reviewFunctionName: 'review-verification',
};
EOF

echo
echo "✅ LISTO. Backend desplegado en $PROJECT_URL"
echo "   Usuarios:  $ATLETA_EMAIL / $ATLETA_PASS   |   $ADMIN_EMAIL / $ADMIN_PASS"
echo "   Reinicia Expo:  npm run web   (para tomar el nuevo .env)"
