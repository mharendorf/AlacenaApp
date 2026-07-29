# Documento Funcional — Lista de Supermercado (MVP)

**Proyecto:** SuperApp
**Versión:** 1.0
**Fecha:** 2026-07-29
**Estado:** Para revisión de Claude Code

---

## 1. Objetivo

Aplicación móvil para llevar la lista de compras del supermercado de una casa, compartida entre los miembros del hogar. Para el MVP existe **una única lista** por hogar (no listas múltiples ni personales).

## 2. Alcance del MVP

- CRUD de artículos (crear, leer, actualizar, eliminar)
- Marcar artículo como comprado / pendiente (sin eliminarlo de la lista)
- Lista compartida entre usuarios de un mismo hogar
- Categorización de artículos
- Ordenamiento por categoría y alfabético

**Fuera de alcance del MVP** (para versiones futuras): listas múltiples, sincronización en tiempo real, notificaciones push, historial de compras detallado, sugerencias automáticas, código de barras/escaneo, Android.

## 3. Usuarios y acceso al hogar

- Cada hogar ("household") tiene una única lista compartida.
- Alta de usuario: registro con email/password (a definir si se agrega Apple Sign In).
- **Unirse a un hogar:** el usuario que crea el hogar genera un código o link de invitación; quien lo usa queda vinculado a esa lista.
- Todos los usuarios de un hogar tienen los mismos permisos (no hay rol admin en el MVP).
- Cada modificación (crear/editar/eliminar/marcar) queda asociada al usuario que la realizó, para mostrar "usuario que realizó la modificación".

**Supuesto a validar:** un usuario pertenece a un solo hogar a la vez en el MVP (simplifica el modelo).

## 4. Modelo de datos

### 4.1 Artículo (Item)

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| id | autonumérico | sí | correlativo global dentro del hogar |
| nombre | texto | sí | |
| marca | texto | no | opcional |
| variedad | texto | no | |
| cantidad | número | sí | ej. 2 |
| unidad | texto/enum | sí | ej. unidad, litro, kg, paquete |
| categoría | enum | sí | Almacén, Bebidas, Higiene Personal, Frescos, Limpieza, Varios |
| estado | boolean/enum | sí | `pendiente` / `comprado` |
| creado_por | usuario | sí | |
| modificado_por | usuario | sí | último usuario que editó |
| fecha_modificación | datetime | sí | |
| fecha_creación | datetime | sí | |

**Marca:** campo opcional (confirmado).

### 4.2 Hogar (Household)

| Campo | Tipo | Notas |
|---|---|---|
| id | autonumérico | |
| nombre | texto | ej. "Casa Mai" |
| código_invitación | texto único | para unir nuevos usuarios |
| última_fecha_compra | datetime | ver definición en sección 6 |

### 4.3 Usuario

| Campo | Tipo | Notas |
|---|---|---|
| id | autonumérico | |
| nombre | texto | |
| email | texto único | |
| household_id | referencia | hogar al que pertenece |

## 5. Pantallas

### 5.1 Landing

- Mensaje de bienvenida
- Última fecha de compra del hogar
- Cantidad total de artículos en la lista (¿total general o solo pendientes? — **a definir**, se sugiere mostrar ambos: "X pendientes de Y totales")
- Botón "Agregar producto" (acceso directo, sin pasar por el menú)
- Botón de acceso al menú de lista

### 5.2 Menú de lista

- Añadir artículo
- Ver por categoría
- Ver por orden alfabético
- Última fecha de modificación de la lista
- Usuario que realizó la última modificación

### 5.3 Lista

- Navegación por categorías: Almacén, Bebidas, Higiene Personal, Frescos, Limpieza, Varios
- Dentro de cada categoría, artículos con: número, nombre, marca, variedad, cantidad/unidad, estado (pendiente/comprado)
- Acción de marcar/desmarcar comprado sobre cada artículo (checkbox o swipe)
- Acción de editar artículo
- Acción de eliminar artículo
- Buscador de artículos dentro de la lista
- Botón "Finalizar Compra": evalúa los artículos marcados como "comprado" (ver sección 6)

### 5.4 Alta/edición de artículo

- Formulario con: nombre (obligatorio), categoría (obligatoria), marca (opcional), variedad (opcional), cantidad, unidad
- Alta rápida por texto libre (según el requerimiento "añadir por texto"): el usuario ingresa el nombre y selecciona la categoría; no hay inferencia automática de categoría/cantidad en el MVP

## 6. Reglas de negocio

- Marcar un artículo como "comprado" **no lo elimina** de la lista; queda visible con el estado marcado.
- **"Última fecha de compra":** existe un botón "Finalizar Compra" (visible en la pantalla de Lista) que evalúa los artículos con flag "comprado" y actualiza la fecha de última compra del hogar.
- **Desmarcado de artículos:** no es automático. Durante la compra, el usuario va desmarcando manualmente cada artículo a medida que lo pone en el carrito (o marcando como comprado, según se defina la interacción del checkbox). El botón "Finalizar Compra" no desmarca artículos masivamente, solo registra el evento/fecha en base al estado de los flags en ese momento.
- No se permite eliminar un hogar sin usuarios (regla técnica, no visible al usuario).
- Duplicados: el MVP no bloquea artículos con el mismo nombre (se resuelve editando manualmente).

## 7. Sincronización y conectividad

- La lista se actualiza al abrir la app o al refrescar manualmente (pull-to-refresh). No hay sincronización en tiempo real en el MVP.
- **Offline:** la app debe funcionar sin conexión. El usuario puede ver y editar artículos sin internet; los cambios se guardan localmente y sincronizan al recuperar conexión. Claude Code debe definir la estrategia de resolución de conflictos si dos usuarios editan el mismo artículo offline y sincronizan en momentos distintos.

## 8. Plataforma y stack técnico

- Cross-platform: **React Native** o **Flutter** (a decidir con Claude Code según preferencia de mantenimiento), corre en iOS para el MVP, con Android contemplado a futuro sin reescritura completa.
- Backend y base de datos: a definir con Claude Code (ej. Firebase/Supabase para velocidad de desarrollo del MVP).
- Autenticación: email/password como mínimo; evaluar Apple Sign In (recomendado si es cross-platform con intención de publicar en App Store).
- Idioma de la app: español.

## 9. Decisiones confirmadas

| # | Pregunta | Decisión |
|---|---|---|
| 1 | ¿Marca obligatoria u opcional? | Opcional |
| 2 | ¿Qué define "última fecha de compra"? | Botón "Finalizar Compra" en la pantalla de Lista, que evalúa los flags de "comprado" |
| 3 | ¿Se desmarcan los artículos al finalizar? | No automáticamente; el usuario desmarca manualmente cada artículo durante la compra |
| 4 | ¿Buscador de artículos? | Sí |
| 5 | ¿Categorías fijas o administrables? | Fijas para el MVP (las 6 definidas) |
| 6 | ¿Comportamiento offline? | Debe funcionar offline, con sincronización posterior al recuperar conexión |
| 7 | ¿Alta por texto infiere categoría/cantidad? | No; nombre y categoría son obligatorios y se ingresan manualmente |
| 8 | ¿Un usuario en más de un hogar? | No, para el MVP |
| 9 | ¿Notificaciones push? | Quedan para v2 |

## 10. Brief de diseño (para Claude Design)

### 10.1 Estilo visual

Minimalista / limpio: mucho blanco, tipografía simple, pocos colores base, foco en la funcionalidad (referencia: Apple Notes, Things). Priorizar legibilidad y velocidad de escaneo de la lista por sobre la decoración.

### 10.2 Marca

Todavía no hay nombre ni logo definido. Design puede proponer nombre de la app y una identidad mínima (tipografía + paleta) junto con las pantallas, para validar en conjunto.

### 10.3 Categorías: color + ícono

Cada una de las 6 categorías debe tener un color de acento y un ícono propio, para que la lista se escanee rápido visualmente. Punto de partida sugerido (Design puede ajustar dentro del estilo minimalista):

| Categoría | Ícono sugerido |
|---|---|
| Almacén | caja / alacena |
| Bebidas | vaso / botella |
| Higiene Personal | gota / cepillo |
| Frescos | hoja / manzana |
| Limpieza | burbujas / spray |
| Varios | estrella / etiqueta |

La paleta debe mantenerse sobria (tonos suaves o pasteles) para no romper la línea minimalista, evitando colores saturados tipo "app infantil".

### 10.4 Estados de pantalla a diseñar (no cubiertos en la sección 5)

- **Lista vacía**: primera vez que un hogar no tiene artículos cargados (mensaje + CTA para agregar el primero)
- **Estado de carga**: mientras sincroniza al abrir la app o al reconectar tras estar offline
- **Error de sincronización offline**: aviso de que hay cambios pendientes de sincronizar, o que la sincronización falló
- **Onboarding / unirse a hogar**: pantalla para ingresar el código de invitación o generarlo, incluyendo el caso de un usuario nuevo que todavía no pertenece a ningún hogar
- **Confirmación de "Finalizar Compra"**: feedback visual al usuar el botón (sección 6)

### 10.5 Plataforma

Diseñar siguiendo convenciones de iOS (Human Interface Guidelines) ya que el MVP corre en iOS, aunque el desarrollo sea cross-platform.

## 11. Puntos abiertos restantes

1. Estrategia de resolución de conflictos cuando dos usuarios editan offline el mismo artículo y sincronizan en momentos distintos (a definir por Claude Code).
2. Elección final entre React Native y Flutter.
3. Elección de backend/base de datos.

---

*Documento preparado para que Claude Code diseñe la arquitectura técnica y el modelo de datos definitivo.*
