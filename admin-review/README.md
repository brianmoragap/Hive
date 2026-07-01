# Hive Admin Review

Panel web separado de la app móvil para revisar solicitudes de identidad.

## Qué hace

- Inicia sesión con una cuenta admin en Supabase Auth.
- Lista postulaciones pendientes, aprobadas o rechazadas.
- Abre selfie, frente de cédula y serial desde Storage privado.
- Aprueba o rechaza una solicitud.
- Inserta notificación interna y dispara correo mediante una Edge Function.

## Requisitos

1. Aplicar el `schema.sql` actualizado en Supabase.
2. Crear al menos una cuenta revisora en `public.admin_users`.
3. Desplegar la Edge Function `review-verification`.
4. Configurar `RESEND_API_KEY` y `HIVE_REVIEW_FROM_EMAIL` en Supabase Edge Functions si quieres correo real.

## Crear un admin

Primero crea la cuenta normal en Supabase Auth. Luego agrega su `user_id`:

```sql
insert into public.admin_users (user_id, role)
values ('UUID_DEL_USUARIO', 'admin')
on conflict (user_id) do update
set role = excluded.role;
```

## Abrir el panel

Sirve la carpeta por HTTP local. No abras el archivo con `file://`.

```bash
cd /Users/brianmoraga/Documents/hive/admin-review
python3 -m http.server 4173
```

Después abre:

`http://localhost:4173`

## Configuración

Edita [config.js](/Users/brianmoraga/Documents/hive/admin-review/config.js) si cambias de proyecto Supabase.

## Edge Function

La función esperada por el panel es:

`review-verification`

Su código quedó en:

[index.ts](/Users/brianmoraga/Documents/hive/supabase/functions/review-verification/index.ts)
