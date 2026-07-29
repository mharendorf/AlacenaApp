# Handoff: Alacena — Lista de Supermercado (MVP)

## Overview
App móvil para llevar la lista de compras de un hogar, compartida entre sus miembros. Nombre de marca propuesto: **Alacena** (alternativas evaluadas: Despensa, Mercadito). Este paquete es para implementar el MVP descripto en `funcional-lista-supermercado-mvp.md` con el diseño visual de `SuperApp.dc.html` como referencia.

## About the Design Files
`SuperApp.dc.html` es un **prototipo de diseño interactivo en HTML/React** (formato "Design Component" de la herramienta de diseño usada) — no es código de producción. Es una referencia de look & feel e interacción, pensada para iOS (React Native o Flutter, a definir, según sección 8 del funcional). La tarea es **recrear estas pantallas y flujos en el entorno real de la app** (RN/Flutter + el backend elegido), usando los patrones y librerías del proyecto, no incrustar este HTML.

Para inspeccionar el prototipo: abrir `SuperApp.dc.html` en un navegador. La lógica de estado está en la clase `Component` al final del archivo (búsqueda de `class Component extends DCLogic`); el layout está en el HTML del medio.

## Fidelity
**Alta fidelidad (hifi)** en cuanto a paleta, tipografía, espaciado y componentes (chips, pills, tarjetas). Recrear pixel-perfect los estilos abajo. Los datos (artículos, hogar, código de invitación) son de ejemplo/mock — el modelo de datos real está en el funcional (sección 4).

## Design Tokens
Sistema de diseño "Organic" (`design-system/styles.css`, `design-system/readme.md` incluidos completos).

- **Colores base**: fondo `#f5ead8`, texto `#201e1d`, acento 1 (terracota) `#c67139`, acento 2 (salvia) `#7a8a5e`. Cada acento tiene una rampa tonal 100–900 (ver `styles.css`).
- **Tipografía**: encabezados en `Caprasimo` (Google Fonts), cuerpo en `Figtree`. Tamaños: h1 42px, h2 32px, h3 25px, h4 20px; cuerpo 15px/1.55.
- **Radios**: sm 8px, md 16px, lg 28px; botones/inputs/pills siempre `border-radius: 999px`; tarjetas y sheets ~32px.
- **Sombras**: sm/md/lg definidas en `styles.css`, tonos tenues sobre el fondo cálido.
- **Colores de categoría** (no vienen del sistema base, derivados en OKLCH manteniendo su mismo tono/luminosidad para que combinen):
  - Almacén: `oklch(93% 0.04 80)` fondo / `oklch(38% 0.09 80)` texto (dorado)
  - Bebidas: `oklch(93% 0.035 230)` / `oklch(38% 0.08 230)` (azul)
  - Higiene Personal: `oklch(93% 0.035 320)` / `oklch(38% 0.08 320)` (lavanda)
  - Frescos: rampa salvia `--color-accent-2-100` / `--color-accent-2-800`
  - Limpieza: `oklch(93% 0.035 195)` / `oklch(38% 0.07 195)` (cian)
  - Varios: rampa terracota `--color-accent-100` / `--color-accent-800`
  - Color destructivo (botón eliminar): `oklch(55% 0.15 35)` — rojo-terracota desaturado, no viene del sistema pero mantiene su calidez.

## Screens / Views

### 1. Onboarding — Bienvenida (`isWelcome`)
- Centrado vertical. Círculo de 88px (fondo `--color-accent-200`) con ícono de casa.
- H1 "Alacena" (Caprasimo 34px) + subcopy centrado.
- Botón primario **"Ir a mi hogar"**: para el uso recurrente (entrar directo a la lista existente), es la acción más frecuente y por eso va primero.
- Botón secundario **"Configurar un hogar"**: al tocarlo se expande in-place (no navega) y revela dos botones — **"Crear un hogar"** y **"Tengo un código"** — para el caso, más esporádico, de dar de alta o unirse a un hogar. Estado `setupExpanded` en el prototipo.

### 2. Onboarding — Crear hogar (`isCreate`)
- Botón ícono "volver" (chevron) arriba a la izquierda.
- Input de texto "Nombre del hogar" (placeholder "Casa Mai").
- Botón primario "Continuar", deshabilitado si el campo está vacío.

### 3. Onboarding — Código de invitación (`isInvite`)
- Ícono de check en círculo salvia claro.
- Título "¡{nombre del hogar} está lista!" + copy.
- Tarjeta con el código generado (ej. `CASA-7XQ2`) + botón copiar.
- Botón primario "Continuar a la lista".

### 4. Onboarding — Unirse a un hogar (`isJoin`)
- Volver + input "Código de invitación" (mayúsculas) + botón "Unirme".

### 5. Landing / Inicio (`isHome`)
- Pantalla intermedia tras el onboarding y accesible con el botón "volver al inicio" desde la Lista.
- Título con nombre del hogar + subcopy.
- Tarjeta resumen (fondo `--color-surface`, radio 24px): contador grande "XX de YY" + "artículos pendientes de comprar", separador, "Última compra: <fecha>".
- Dos botones apilados: "Agregar producto" (primario, abre directamente el alta de artículo sobre la Lista) y "Ver la lista" (secundario).

### 6. Lista (`isLista`)
- Header: botón ícono "volver al inicio" (→ Landing), nombre del hogar + "Última compra: X · Y pendientes de Z", botón ícono "Opciones" (abre sheet de opciones), botón "Finalizar compra".
- Buscador (input con ícono lupa) que filtra por nombre/marca.
- Lista agrupada por las 6 categorías fijas (Almacén, Bebidas, Higiene Personal, Frescos, Limpieza, Varios), cada grupo con: badge de color + ícono, nombre, contador, chevron — **tap en el header del grupo colapsa/expande esa categoría**.
- Fila de artículo: checkbox circular (tap = marca/desmarca comprado, tachando el texto y bajando opacidad a 0.45), nombre + "marca · variedad", tag con cantidad+unidad. **Swipe hacia la izquierda** revela dos acciones (editar = salvia, eliminar = rojo-terracota); umbral de apertura -70px, tope -140px.
- Botón flotante circular (52px, esquina inferior derecha) "+" para agregar artículo.
- Toast inferior (fondo `--color-neutral-900`) al finalizar compra: "Compra finalizada · fecha actualizada", autodesaparece a los 2.4s.
- Estado vacío: ícono + "Tu lista está vacía..." + CTA "Agregar producto".

### 7. Sheet — Alta/edición de artículo (overlay sobre Lista)
- Handle superior, título "Nuevo artículo"/"Editar artículo".
- Campos: Nombre (obligatorio), selector de categoría en chips (6, con ícono+color, chip seleccionado invierte fondo/texto), Marca y Variedad (opcionales, en fila), Cantidad (stepper +/-) y Unidad (segmented control: unidad/litro/kg/paquete).
- Acciones: "Eliminar" (solo en edición), "Cancelar", "Guardar" (deshabilitado sin nombre).

### 8. Sheet — Opciones de la lista (overlay sobre Lista)
- Botón "Marcar todos como no comprados" (resetea el flag `estado` de todos los artículos a `pendiente`).
- Lista de las 6 categorías con un switch mostrar/ocultar cada una de la vista de Lista (no borra los artículos, solo oculta el grupo).
- Botón "Listo" para cerrar.

## Interactions & Behavior
- **Swipe/checkbox para marcar comprado**: ambos conviven — tap en el círculo marca/desmarca; swipe revela editar/eliminar. Implementado en el prototipo con pointer events (`onPointerDown/Move/Up`), clamp de traslación entre 0 y -140px, snap-open si se supera -70px.
- **Finalizar Compra**: no desmarca artículos; solo registra fecha (sección 6 del funcional) y muestra confirmación visual (toast).
- **Colapsar categoría** vs **ocultar categoría** son dos cosas distintas: colapsar es un accordion visual (persiste en memoria durante la sesión); ocultar (desde Opciones) saca la categoría completa de la vista.
- **Alta rápida desde Landing**: el botón "Agregar producto" en la pantalla de inicio navega directo al formulario de alta (no pasa por el menú), consistente con el requerimiento 5.1.
- Todas las transiciones de sheets son `slide up` desde abajo con backdrop semitransparente; cerrar con tap en el backdrop o botón explícito.

## State Management (referencia del prototipo)
Estado relevante a portar a la arquitectura real:
- `screen`: welcome | create | invite | join | home | lista (navegación)
- `setupExpanded`: bool — controla si en Bienvenida se muestran las opciones "Crear un hogar" / "Tengo un código"
- `items`: array de artículos (ver modelo de datos, sección 4.1 del funcional)
- `search`: texto de búsqueda
- `collapsed`: mapa categoría → colapsada sí/no (UI, no persiste en backend)
- `hiddenCategories`: mapa categoría → oculta sí/no (podría persistir como preferencia de usuario/hogar)
- `sheet`: null | 'add' | 'edit' (+ `form` con los campos del artículo en edición)
- `optionsOpen`: bool
- `lastPurchase`, `inviteCode`, `householdNameInput`: datos de hogar

El modelo de datos definitivo (Artículo, Hogar, Usuario), reglas de negocio, offline y decisiones ya confirmadas están en `funcional-lista-supermercado-mvp.md` — es la fuente de verdad funcional; este README cubre solo la capa visual/interacción.

## Assets
- Iconografía: SVGs dibujados a mano imitando el estilo Lucide (stroke-width ~2.2–2.8, sin relleno) — no hay assets de imagen. Si el proyecto tiene acceso a Lucide, reemplazar por los íconos reales equivalentes: `home`, `check`, `copy`, `search`, `package/box` (Almacén), `cup-soda` (Bebidas), `droplet` (Higiene), `leaf` (Frescos), `spray-can` (Limpieza), `tag/star` (Varios), `pencil`, `trash`, `plus`, `chevron-left/right`, `sliders`.
- Fuentes: Caprasimo y Figtree vía Google Fonts (ver `@import` al inicio de `design-system/styles.css`).

## Files
- `SuperApp.dc.html` — el prototipo completo (todas las pantallas y estados).
- `design-system/styles.css` — hoja de tokens y componentes del sistema Organic (colores, tipografía, spacing, radios, sombras, clases `.btn`, `.input`, `.card`, `.tag`, `.seg`, etc.).
- `design-system/readme.md` — guía completa del sistema de diseño.
- `funcional-lista-supermercado-mvp.md` — documento funcional original (alcance, modelo de datos, reglas de negocio, pantallas, decisiones confirmadas, puntos abiertos).
