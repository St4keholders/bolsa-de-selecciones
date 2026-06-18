# 🏆 GUÍA DE SETUP MANUAL - LA BOLSA DE SELECCIONES

> **Objetivo:** Dejar listo absolutamente todo lo que requiere intervención manual (Supabase Cloud, credenciales, esquema SQL, variables de entorno) **antes** de que Claude Code empiece a programar. Al final encontrarás el prompt exacto para enviarle a Claude Code.

> **Carpeta del proyecto:** `MUNDIAL/`
> **Archivos que deben estar dentro de `MUNDIAL/` antes de empezar:**
> - `DOCUMENTO_DE_REQUERIMIENTOS_TÉCNICOS.docx` (el PRD)
> - `GUIA_SETUP_MUNDIAL.md` (este archivo)

---

## 📋 ORDEN DE EJECUCIÓN

1. Crear proyecto en Supabase Cloud
2. Guardar credenciales
3. Ejecutar el script SQL completo (esquema + datos + funciones + RLS)
4. Configurar autenticación
5. Crear el usuario administrador
6. Promover ese usuario a admin
7. Crear el archivo `.env.local` en `MUNDIAL/`
8. Verificar checklist final
9. Enviar el prompt a Claude Code

---

## PASO 1 — Crear proyecto en Supabase Cloud

1. Entra a **https://supabase.com/dashboard** e inicia sesión.
2. Clic en **"New Project"**.
3. Configura:
   - **Name:** `bolsa-selecciones-mundial`
   - **Database Password:** genera una contraseña fuerte y **guárdala en un gestor de contraseñas** (la vas a necesitar si algún día te conectas por psql/DBeaver)
   - **Region:** elige la más cercana a Colombia → `South America (São Paulo)` o `East US (North Virginia)`
   - **Pricing Plan:** Free
4. Clic en **"Create new project"** y espera 1-2 minutos a que aprovisione.

---

## PASO 2 — Guardar las credenciales

Una vez creado el proyecto, ve a **Project Settings (ícono de engranaje abajo a la izquierda) → API**.

Copia y guarda en un bloc de notas temporal estos 3 valores:

| Variable | Dónde la encuentras | Para qué sirve |
|----------|---------------------|----------------|
| **Project URL** | Sección "Project URL" | URL pública de tu Supabase |
| **anon public** | Sección "Project API keys" → `anon` `public` | Clave pública (frontend) |
| **service_role** | Sección "Project API keys" → `service_role` `secret` | Clave admin ⚠️ NUNCA exponer al frontend |

> ⚠️ **CRÍTICO:** La `service_role` key tiene permisos totales sobre la base de datos. Jamás la pongas en código que llegue al navegador. Solo se usa en API routes del servidor.

---

## PASO 3 — Ejecutar el esquema SQL completo

En el menú lateral de Supabase, abre **SQL Editor → New query**.
Pega **TODO** el siguiente bloque y haz clic en **"Run"**. Es idempotente y se puede correr de una sola vez.

```sql
-- ============================================================
-- LA BOLSA DE SELECCIONES — ESQUEMA COMPLETO
-- ============================================================

-- ----- TABLA 1: usuarios -----
CREATE TABLE public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  puntos_permanentes INTEGER NOT NULL DEFAULT 0,
  es_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----- TABLA 2: mercado_selecciones -----
CREATE TABLE public.mercado_selecciones (
  id INTEGER PRIMARY KEY,
  pais TEXT NOT NULL UNIQUE,
  ataque INTEGER NOT NULL DEFAULT 0,
  creacion INTEGER NOT NULL DEFAULT 0,
  muralla INTEGER NOT NULL DEFAULT 0,
  reflejos INTEGER NOT NULL DEFAULT 0,
  valor_total INTEGER GENERATED ALWAYS AS (ataque + creacion + muralla + reflejos) STORED,
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'eliminado'))
);

-- ----- TABLA 3: portafolio -----
CREATE TABLE public.portafolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  seleccion_id INTEGER NOT NULL REFERENCES public.mercado_selecciones(id),
  estado_carta TEXT NOT NULL DEFAULT 'activa' CHECK (estado_carta IN ('activa', 'liquidada')),
  fecha_obtencion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_portafolio_user ON public.portafolio(user_id);
CREATE INDEX idx_portafolio_user_estado ON public.portafolio(user_id, estado_carta);
CREATE INDEX idx_portafolio_user_fecha ON public.portafolio(user_id, fecha_obtencion DESC);

-- ============================================================
-- DATOS INICIALES — 32 SELECCIONES
-- (Stats distribuidos por tiers. El admin puede editarlos luego.)
-- ============================================================
INSERT INTO public.mercado_selecciones (id, pais, ataque, creacion, muralla, reflejos) VALUES
  (1,  'Argentina',        250, 250, 250, 250),
  (2,  'Francia',           245, 245, 240, 245),
  (3,  'España',            240, 245, 235, 235),
  (4,  'Inglaterra',        235, 230, 240, 240),
  (5,  'Brasil',            240, 235, 220, 220),
  (6,  'Portugal',          225, 220, 215, 215),
  (7,  'Países Bajos',      210, 215, 220, 215),
  (8,  'Bélgica',           215, 210, 210, 210),
  (9,  'Alemania',          200, 195, 195, 195),
  (10, 'Italia',            185, 195, 200, 195),
  (11, 'Croacia',           180, 200, 185, 185),
  (12, 'Uruguay',           185, 180, 180, 180),
  (13, 'Colombia',          175, 175, 170, 170),
  (14, 'México',            165, 160, 165, 170),
  (15, 'Estados Unidos',    160, 160, 165, 165),
  (16, 'Suiza',             155, 155, 160, 160),
  (17, 'Dinamarca',         150, 150, 150, 150),
  (18, 'Marruecos',         140, 140, 150, 150),
  (19, 'Senegal',           145, 135, 135, 135),
  (20, 'Japón',             130, 135, 130, 135),
  (21, 'Corea del Sur',     125, 125, 125, 125),
  (22, 'Australia',         115, 115, 120, 120),
  (23, 'Ecuador',           110, 110, 110, 110),
  (24, 'Polonia',           100, 100, 105, 105),
  (25, 'Serbia',            105, 100,  95,  95),
  (26, 'Suecia',             90,  90,  95,  95),
  (27, 'Gales',              85,  85,  85,  85),
  (28, 'Canadá',             80,  80,  80,  80),
  (29, 'Ghana',              70,  70,  70,  70),
  (30, 'Camerún',            65,  65,  65,  65),
  (31, 'Túnez',              55,  55,  55,  55),
  (32, 'Arabia Saudita',     45,  45,  45,  45);

-- ============================================================
-- TRIGGER: crear fila en public.usuarios cuando alguien se registra
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usuarios (id, nombre, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- FUNCIÓN RPC: abrir_sobre_diario()
-- Valida 24h y asigna una selección aleatoria activa.
-- ============================================================
CREATE OR REPLACE FUNCTION public.abrir_sobre_diario()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_ultima TIMESTAMPTZ;
  v_seleccion_id INTEGER;
  v_carta_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  SELECT MAX(fecha_obtencion) INTO v_ultima
  FROM public.portafolio
  WHERE user_id = v_user_id;

  IF v_ultima IS NOT NULL AND v_ultima > NOW() - INTERVAL '24 hours' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'cooldown',
      'proximo_disponible', v_ultima + INTERVAL '24 hours'
    );
  END IF;

  SELECT id INTO v_seleccion_id
  FROM public.mercado_selecciones
  WHERE estado = 'activo'
  ORDER BY RANDOM()
  LIMIT 1;

  INSERT INTO public.portafolio (user_id, seleccion_id)
  VALUES (v_user_id, v_seleccion_id)
  RETURNING id INTO v_carta_id;

  RETURN json_build_object(
    'success', true,
    'carta_id', v_carta_id,
    'seleccion_id', v_seleccion_id
  );
END;
$$;

-- ============================================================
-- FUNCIÓN RPC: liquidar_carta(carta_id)
-- Atómica: suma valor_total a puntos_permanentes y marca liquidada.
-- ============================================================
CREATE OR REPLACE FUNCTION public.liquidar_carta(carta_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_seleccion_id INTEGER;
  v_estado_carta TEXT;
  v_estado_seleccion TEXT;
  v_valor INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  SELECT seleccion_id, estado_carta INTO v_seleccion_id, v_estado_carta
  FROM public.portafolio
  WHERE id = carta_id AND user_id = v_user_id;

  IF v_seleccion_id IS NULL THEN
    RAISE EXCEPTION 'Carta no encontrada o no pertenece al usuario';
  END IF;

  IF v_estado_carta = 'liquidada' THEN
    RAISE EXCEPTION 'Carta ya liquidada';
  END IF;

  SELECT valor_total, estado INTO v_valor, v_estado_seleccion
  FROM public.mercado_selecciones
  WHERE id = v_seleccion_id;

  IF v_estado_seleccion = 'eliminado' THEN
    RAISE EXCEPTION 'No se puede liquidar una selección en quiebra';
  END IF;

  UPDATE public.usuarios
  SET puntos_permanentes = puntos_permanentes + v_valor
  WHERE id = v_user_id;

  UPDATE public.portafolio
  SET estado_carta = 'liquidada'
  WHERE id = carta_id;

  RETURN json_build_object('success', true, 'puntos_ganados', v_valor);
END;
$$;

-- ============================================================
-- FUNCIÓN RPC: declarar_quiebra(seleccion_id)
-- Solo admin. Pone stats en 0 y marca selección como eliminada.
-- ============================================================
CREATE OR REPLACE FUNCTION public.declarar_quiebra(seleccion_id_param INTEGER)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND es_admin = TRUE
  ) THEN
    RAISE EXCEPTION 'Acceso denegado: requiere admin';
  END IF;

  UPDATE public.mercado_selecciones
  SET ataque = 0, creacion = 0, muralla = 0, reflejos = 0, estado = 'eliminado'
  WHERE id = seleccion_id_param;

  RETURN json_build_object('success', true);
END;
$$;

-- ============================================================
-- FUNCIÓN RPC: actualizar_stats_seleccion()
-- Solo admin. Actualiza las 4 stats de una selección.
-- ============================================================
CREATE OR REPLACE FUNCTION public.actualizar_stats_seleccion(
  seleccion_id_param INTEGER,
  ataque_param INTEGER,
  creacion_param INTEGER,
  muralla_param INTEGER,
  reflejos_param INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND es_admin = TRUE
  ) THEN
    RAISE EXCEPTION 'Acceso denegado: requiere admin';
  END IF;

  UPDATE public.mercado_selecciones
  SET ataque = ataque_param,
      creacion = creacion_param,
      muralla = muralla_param,
      reflejos = reflejos_param
  WHERE id = seleccion_id_param;

  RETURN json_build_object('success', true);
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mercado_selecciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portafolio ENABLE ROW LEVEL SECURITY;

-- USUARIOS: todos los autenticados pueden VER (para el ranking)
CREATE POLICY "usuarios_select_all_auth" ON public.usuarios
  FOR SELECT TO authenticated USING (true);

-- USUARIOS: solo el propio usuario puede actualizar su fila (excepto puntos, que solo cambia vía RPC SECURITY DEFINER)
CREATE POLICY "usuarios_update_self" ON public.usuarios
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- MERCADO: todos los autenticados pueden VER
CREATE POLICY "mercado_select_all_auth" ON public.mercado_selecciones
  FOR SELECT TO authenticated USING (true);

-- MERCADO: nadie escribe directamente (solo vía RPC admin)
-- No se crean policies de INSERT/UPDATE/DELETE → bloqueadas por defecto con RLS activo

-- PORTAFOLIO: cada usuario ve solo sus cartas
CREATE POLICY "portafolio_select_own" ON public.portafolio
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- PORTAFOLIO: cada usuario crea cartas para sí mismo (aunque la RPC lo hace)
CREATE POLICY "portafolio_insert_own" ON public.portafolio
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- PORTAFOLIO: cada usuario actualiza sus cartas (la RPC también)
CREATE POLICY "portafolio_update_own" ON public.portafolio
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- ============================================================
-- REALTIME — habilitar para que el frontend escuche cambios
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.mercado_selecciones;
ALTER PUBLICATION supabase_realtime ADD TABLE public.portafolio;
ALTER PUBLICATION supabase_realtime ADD TABLE public.usuarios;

-- FIN
```

✅ Si el script termina sin errores, ya tienes:
- 3 tablas creadas con relaciones
- 32 selecciones precargadas
- 4 funciones RPC seguras (sobre, liquidar, quiebra, actualizar stats)
- RLS activado con policies correctas
- Realtime habilitado para que la UI se actualice en vivo cuando el admin edite el mercado

Verifica yendo a **Table Editor** en el sidebar: debes ver las 3 tablas y `mercado_selecciones` con 32 filas.

---

## PASO 4 — Configurar Autenticación

En el sidebar de Supabase: **Authentication → Providers**.

1. **Email** ya viene activado por defecto. Solo verifica:
   - Toggle **"Confirm email"** → **APÁGALO** para esta dinámica (los usuarios podrán entrar sin verificar correo; te ahorra el setup de SMTP). Si quieres confirmación, déjalo encendido pero configura SMTP en **Project Settings → Auth → SMTP**.
2. Ve a **Authentication → URL Configuration**:
   - **Site URL:** `http://localhost:3000` (durante desarrollo)
   - **Redirect URLs:** agrega `http://localhost:3000/**`
   - Cuando despliegues a producción (Vercel), añade también la URL de producción.

---

## PASO 5 — Crear el usuario administrador

1. En el sidebar: **Authentication → Users → "Add user" → "Create new user"**.
2. Llena:
   - **Email:** el correo que vas a usar como admin
   - **Password:** una contraseña fuerte
   - **Auto Confirm User:** ✅ enciéndelo
3. Clic en **"Create user"**.

El trigger `handle_new_user` creará automáticamente la fila en `public.usuarios` con `es_admin = FALSE`. Pero como en este momento no pasaste un `nombre` en metadata, va a usar la parte antes del `@` del email como nombre. Lo arreglamos y lo promovemos a admin en el siguiente paso.

---

## PASO 6 — Promover ese usuario a administrador

Vuelve al **SQL Editor → New query** y ejecuta (reemplaza el email):

```sql
UPDATE public.usuarios
SET es_admin = TRUE,
    nombre = 'Administrador'   -- opcional: ajusta el nombre visible
WHERE email = 'TU_EMAIL_DE_ADMIN@ejemplo.com';

-- Verifica:
SELECT id, nombre, email, es_admin FROM public.usuarios;
```

✅ Debes ver tu usuario con `es_admin = true`.

---

## PASO 7 — Crear el archivo `.env.local` en `MUNDIAL/`

Dentro de la carpeta `MUNDIAL/`, crea un archivo llamado **`.env.local`** (con el punto al inicio) con este contenido, reemplazando los placeholders con los valores del Paso 2:

```env
# === SUPABASE ===
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...PEGA_TU_ANON_KEY_AQUI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...PEGA_TU_SERVICE_ROLE_AQUI

# === APP ===
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ Verifica que tu `.gitignore` (cuando Claude Code lo genere) incluya `.env*.local`. Nunca commitees este archivo.

---

## PASO 8 — Checklist final antes de invocar a Claude Code

Marca cada uno antes de continuar:

- [ ] Proyecto Supabase creado y aprovisionado
- [ ] Las 3 URLs/keys guardadas (URL, anon, service_role)
- [ ] Script SQL completo ejecutado sin errores
- [ ] Table Editor muestra `mercado_selecciones` con 32 filas
- [ ] Email auth activado, "Confirm email" apagado
- [ ] Site URL y Redirect URLs configurados
- [ ] Usuario admin creado en Authentication → Users
- [ ] `UPDATE` ejecutado y `SELECT` confirma `es_admin = true`
- [ ] Archivo `.env.local` creado en `MUNDIAL/` con las 4 variables
- [ ] PRD (`DOCUMENTO_DE_REQUERIMIENTOS_TÉCNICOS.docx`) está en `MUNDIAL/`
- [ ] Este archivo (`GUIA_SETUP_MUNDIAL.md`) está en `MUNDIAL/`

---

## PASO 9 — PROMPT PARA CLAUDE CODE

Abre Claude Code dentro de la carpeta `MUNDIAL/` y pega **literalmente** este prompt:

```
Estás trabajando en el proyecto "La Bolsa de Selecciones", una SPA mobile-first
para una dinámica gamificada del Mundial.

ANTES DE EMPEZAR, lee los siguientes archivos en esta carpeta:
1. DOCUMENTO_DE_REQUERIMIENTOS_TÉCNICOS.docx — el PRD completo del producto
2. GUIA_SETUP_MUNDIAL.md — la guía de setup ya ejecutada (NO la repitas: Supabase,
   tablas, RPCs, RLS y datos iniciales YA ESTÁN configurados en la nube)
3. .env.local — credenciales reales de Supabase ya configuradas

CONTEXTO DEL BACKEND (ya existe, NO modificar):
- 3 tablas en Supabase: usuarios, mercado_selecciones (32 filas precargadas), portafolio
- 4 funciones RPC ya creadas: abrir_sobre_diario(), liquidar_carta(carta_id),
  declarar_quiebra(seleccion_id_param), actualizar_stats_seleccion(...)
- RLS activado con policies correctas
- Realtime habilitado en las 3 tablas
- Un usuario admin ya existe con es_admin=true en la tabla usuarios

TU TAREA:
Construir el frontend completo en Next.js + Supabase siguiendo el PRD.

STACK OBLIGATORIO:
- Next.js 15 con App Router + TypeScript + Turbopack
- Tailwind CSS (mobile-first)
- @supabase/supabase-js + @supabase/ssr
- framer-motion para animaciones (apertura de sobre)
- lucide-react para iconos

PASOS A SEGUIR EN ORDEN:

1. Inicializar Next.js en ESTA carpeta (sin sobreescribir el .docx, .md ni .env.local):
   npx create-next-app@latest . --typescript --tailwind --app --turbopack
   --eslint --no-src-dir --import-alias "@/*" --use-npm

2. Instalar dependencias adicionales:
   npm install @supabase/supabase-js @supabase/ssr framer-motion lucide-react

3. Crear estructura de carpetas:
   - lib/supabase/client.ts        (cliente browser)
   - lib/supabase/server.ts        (cliente server con cookies)
   - lib/supabase/middleware.ts    (refresh de sesión)
   - lib/types.ts                  (tipos TypeScript de las 3 tablas)
   - middleware.ts                 (protección de rutas)
   - app/login/page.tsx
   - app/register/page.tsx
   - app/(protected)/layout.tsx    (verifica sesión, redirige a /login si no hay)
   - app/(protected)/page.tsx      (Dashboard principal con las 3 secciones)
   - app/(protected)/admin-control-panel/page.tsx  (solo admin, verificar es_admin)
   - components/Header.tsx         (sticky, nombre + puntos + ranking)
   - components/SobreDiario.tsx    (animación de apertura con framer-motion)
   - components/Portafolio.tsx     (grid de cartas activas)
   - components/CartaSeleccion.tsx (carta individual con renderizado condicional de quiebra)
   - components/AdminPanel.tsx     (dropdown + 4 inputs + botones)

4. Implementar TODAS las pantallas siguiendo el PRD literalmente:
   - Auth: signup pasa el "nombre" en raw_user_meta_data para que el trigger lo guarde
   - Dashboard con scroll vertical: Sección A (sticky), B (sobre), C (portafolio)
   - Llamar a las RPC con supabase.rpc('nombre_funcion', { params })
   - Realtime: suscribirse a cambios en mercado_selecciones y portafolio para
     actualizar la UI en vivo
   - Renderizado condicional de quiebra: gris + opacidad + "0 PTS" + botón disabled
   - Animación de apertura de sobre: 1-2 segundos antes de revelar la carta
   - Countdown en estado bloqueado del sobre

5. Diseño:
   - Mobile-first estricto (max-width contenedor: 480px en mobile, centrado)
   - Paleta sugerida: fondo oscuro, acentos dorados para puntos/ranking
   - Cartas con look de "trading card" (gradiente, sombra, bordes redondeados)
   - Botón de quiebra en admin: rojo, con confirm() o modal de confirmación

6. Importante:
   - NUNCA exponer SUPABASE_SERVICE_ROLE_KEY al cliente
   - Los puntos del usuario solo se modifican vía RPC (jamás con UPDATE desde cliente)
   - La protección de /admin-control-panel debe verificar es_admin DESDE EL SERVIDOR
     (en el layout o middleware), no solo desde el cliente

Cuando termines, dame las instrucciones para correr el proyecto y probarlo.
```

---

## 🧪 CÓMO PROBAR DESPUÉS

1. Crea **dos cuentas** (una admin, otra usuario normal) desde la pantalla de registro.
2. Con la cuenta normal: abre un sobre, espera a que aparezca en el portafolio, liquídalo y verifica que los puntos suben en el header.
3. Con la cuenta admin: entra a `/admin-control-panel`, edita las stats de la selección que tiene la cuenta normal en su portafolio → verifica que el `valor_total` se actualiza en vivo en la otra ventana (gracias a Realtime).
4. Declara una "Quiebra" sobre la selección y verifica que en el portafolio de la cuenta normal la carta se vuelve gris con "0 PTS".

---

## 🆘 SI ALGO FALLA

| Síntoma | Causa probable | Solución |
|---------|---------------|----------|
| "Invalid API key" al login | `.env.local` mal copiado | Verifica que copiaste la `anon` y no la `service_role` en `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Registro funciona pero no aparece en `public.usuarios` | Trigger no ejecutó | Vuelve a correr el bloque del `CREATE TRIGGER on_auth_user_created` |
| "permission denied for table X" | RLS sin policy correcta | Revisa que las policies del Paso 3 se hayan creado (ve a Authentication → Policies) |
| El admin no entra a `/admin-control-panel` | `es_admin` quedó en false | Vuelve a correr el UPDATE del Paso 6 y verifica con el SELECT |
| Realtime no actualiza el portafolio en vivo | No se habilitó la publicación | Verifica en Database → Replication que las 3 tablas estén en `supabase_realtime` |

---

**Listo.** Cuando termines los 8 pasos del checklist, pegas el prompt del Paso 9 a Claude Code y él construye el frontend completo.
