# Auditoría del tema publicado de Lumielle

**Tema auditado:** "Copia de Lumielle videos carrusel (Claude)", el tema **publicado** (rol MAIN) de la tienda Lumielle, www.lumielle.com.ar. Revisión del 30 de septiembre de 2026.
**Método:** el tema tiene 153 archivos. Leí completos todos los que usa la tienda publicada (layout, configuración, grupos de encabezado y pie, las secciones y plantillas en uso, snippets, CSS y JS). De los que ninguna página usa, verifiqué que no se usan y leí los que podían ser un riesgo (prueba inventada, textos fijos, código de otras marcas). Después crucé todo con los datos reales de la tienda: productos, variantes, inventario, perfil de envío, descuentos, colecciones y páginas.

## Resumen

El corazón del tema, las 6 secciones `tc-*` (Tema Convertible), está bien pensado: la anatomía anuncio → compra → opiniones → deseo → confianza → oferta, los packs con ahorro calculado con precios reales, los marcadores `[envio_gratis_desde]` y `[medios_de_pago]` que leen la configuración, y el respeto por "reducir movimiento". El problema es todo lo que las rodea. El tema es la suma de **tres temas anteriores** (Zolvi/Velotte, landing Lumielle v1 y GemPages), con código de esas marcas, secciones que ya no se usan y parches encima de parches. En la tienda hay además **seis cosas que hoy pueden costar ventas o traer problemas legales**.

| Severidad | Hallazgos |
|---|---|
| Crítico (ventas o legales, hoy) | 6 |
| Alto | 8 |
| Medio | 11 |

Todo lo que no es propio de Lumielle quedó resuelto en el **Tema Convertible 1.0** (`tema-convertible/`, `dist/tema-convertible-1.0.0.zip`). Lo propio de la tienda Lumielle (precios, stock, textos cargados) hay que corregirlo en la tienda: la lista está al final.

## Críticos

| # | Hallazgo | Dónde | Impacto | En el Tema Convertible |
|---|---|---|---|---|
| C1 | **El envío gratis no coincide con el checkout.** El tema dice "Envío gratis desde $45.000" (ajuste `free_shipping_threshold`), pero el perfil de envío de Shopify cobra $5.000 hasta $49.999 y es gratis recién desde $50.000. La marquesina además tiene el texto fijo "ENVÍO GRATIS DESDE $45.000". | Tema → Conversión; `header-group.json`; carrito | Un pedido de $45.000 a $49.999 ve "envío gratis desbloqueado" y en el checkout le cobran $5.000. | El umbral vive en un solo ajuste (0 = no se promete nada) y los textos usan `[envio_gratis_desde]`. La guía obliga a copiarlo del perfil de envío. |
| C2 | **Agregar al carrito falla en silencio.** Los dos productos tienen inventario 0. El carrito lateral (`velotte.js`) no revisa la respuesta de Shopify: ante el error 422 abre el carrito vacío sin explicar nada. | `assets/velotte.js` | Cada clic en "Agregar" desde un anuncio termina en un carrito vacío. | `tc.js` muestra el motivo debajo del botón ("Se agotó…") y no abre el carrito; el botón dice "Sin stock" si la variante no está disponible. Probado. |
| C3 | **Multi colágeno activo con precio $0** en las tres variantes. | Productos | La home lo muestra como "Muy pronto"; la ficha se puede abrir. | — (dato de la tienda) |
| C4 | **Prueba social sin fuente arriba del titular.** La crema muestra "4,9 ★ · 59 vendidos". La fuente cargada ("Sadoer") tiene 9 reseñas con distribución 6 × 5★ y 3 × 4★ (promedio 4,7, no 4,9) y no tiene link. El interruptor global "Mostrar puntajes y cantidad de reseñas" está apagado, pero las secciones `tc-*` no lo leen. | `templates/product.json` (`prueba_corta`, `prueba_promedio`), `tc-compra`, `tc-opiniones` | "59 vendidos" se lee como ventas de la tienda (hoy hay 3 pedidos de prueba). Riesgo con Meta Ads y con Defensa del Consumidor. | La línea de estrellas exige el nombre de la fuente y lo imprime siempre ("4,8 · 1.961 reseñas en iHerb"). Los puntajes propios solo aparecen con el interruptor activado y 10 reseñas o más. |
| C5 | **"Producción nacional certificada · Todo se formula, envasa y despacha en Argentina"** en las colecciones, con productos importados (SADOER; Micro Ingredients, EE. UU.). | `templates/collection.json`, `collection.coleccion-tienda.json` (sección `trust-stickers`) | Afirmación falsa sobre el origen (Ley 22.802 de lealtad comercial). | La sección no existe en el tema nuevo. |
| C6 | **Textos entre corchetes publicados** en el colágeno: "RNPA [N° DE REGISTRO]" (dos veces) e "[IMPORTADOR Y N° DE RNPA]". | `templates/product.lumielle.json` | Se ve a medio hacer y es un dato obligatorio para suplementos. | Checklist de publicación: "ningún texto entre corchetes". |

## Altos

| # | Hallazgo | Dónde | En el Tema Convertible |
|---|---|---|---|
| A1 | Las 6 reseñas de iHerb del colágeno **no se ven**: con "Mostrar" activado pero el nombre de la fuente vacío, la sección oculta el puntaje y también la lista de reseñas externas. | `tc-opiniones` + `product.lumielle.json` | Las reseñas externas se muestran aunque falte el nombre; el puntaje, no. |
| A2 | **Dos colores de marca en la misma tienda:** home y crema en violeta, colágeno en ciruela. El acento se elige sección por sección (13 veces en la ficha) y toda sección nueva entra en ciruela. | todas las `tc-*` | Un solo acento global en Tema → Configuración; las secciones vienen en "El del tema". |
| A3 | **Dos lenguajes visuales:** colección, carrito, búsqueda, 404 y pie usan el sistema Velotte (Instrument Serif, Archivo, Outfit); home y producto usan TC (DM Serif Display, Figtree). Se descargan 5 familias tipográficas. | `layout/theme.liquid`, `velotte*.css` | Un solo sistema en toda la tienda; 2 familias, elegibles desde la configuración. |
| A4 | **Contacto sin formulario:** la página Contacto usa la plantilla `page.contact`, que no existe; cae en la plantilla genérica. | Páginas | `page.contact.json` con formulario, WhatsApp y horario. |
| A5 | El upsell del carrito apunta a la colección `linea-completa`, que **no existe**. | Tema → Conversión | Ajuste opcional; si falta, el bloque no aparece. |
| A6 | Carrito lateral sin accesibilidad: no es un diálogo, no mueve ni atrapa el foco, Escape no lo cierra. La versión accesible de `tc-compra` se borraba sola al cargar. | `sections/cart-drawer.liquid`, `tc.js` | Un solo carrito, diálogo modal con foco atrapado, Escape y retorno del foco. |
| A7 | **Código muerto y de otras marcas:** 19 secciones sin uso, 18 plantillas huérfanas (12 de producto, 3 de colección y 3 de home), 4 layouts y 70 KB de CSS de GemPages, un bloque generado por IA con paleta oliva, 20 archivos `.txt` sueltos (restos de pruebas), fotos de banco y de producto dentro del tema. Nombres Zolvi, Velotte, Lumielle, colágeno y SADOER en archivos y código. | `sections/`, `templates/`, `assets/`, `layout/`, `blocks/` | Nada de eso existe en el tema nuevo: 59 archivos, todos en uso. |
| A8 | Secciones heredadas con **prueba inventada lista para usar:** "Aviso de compras" ("Alguien de Rosario compró…" con ciudades tipeadas a mano y horarios al azar) y "Testimonios" con tres reseñas ficticias por defecto y fotos de banco. Hoy no están en ninguna página, pero cualquiera puede agregarlas desde el editor. | `sales-pop.liquid`, `testimonials.liquid` | No existen. |

## Medios

| # | Hallazgo | En el Tema Convertible |
|---|---|---|
| M1 | Cada sección `tc-*` carga `lm-colageno.css`, `tc.css` y Google Fonts por su cuenta (hasta 13 veces la misma etiqueta en la ficha). Opiniones tiene CSS y JS en línea. | Se cargan una vez en el layout (`tc-base.css`, `tc.css`, `tc.js`). |
| M2 | Controles con poco contraste: puntos de la galería y otros elementos en `#d9cfe0` (1,4:1 sobre blanco). | Controles en `#948aa6` (3,3:1); el tono claro queda solo para decoración. |
| M3 | Despacho y fecha de entrega con hora fija de Argentina y sin feriados: un feriado dice "lo despachamos hoy". | Huso horario y feriados en la configuración (probado con el 12 de octubre). |
| M4 | Los videos de opiniones se reproducen solos aunque el teléfono pida reducir movimiento. | Con "reducir movimiento" quedan quietos. |
| M5 | Emojis y exclamaciones en el carrito (🚚, "¡Envío gratis desbloqueado!"), contra las reglas del sistema. | Íconos de línea y tono del sistema. |
| M6 | El H1 de la ficha es la frase del anuncio y el nombre del producto queda fuera del encabezado (SEO). | El nombre va dentro del H1 para buscadores y lectores de pantalla. |
| M7 | El precio con formato fijo "$ " en `velotte.js`, ignorando el formato de moneda de la tienda. | Un solo formateador que lee el formato de Shopify. |
| M8 | Buscador sin etiqueta; tabla comparativa sin encabezados de fila. | Corregido. |
| M9 | Ajustes del tema con datos de ejemplo: autor "Zolvi Argentina", links a shopify.dev; CSS personalizado en la configuración (`.card{border-radius:30px}`, `overflow-x:hidden !important`). | Metadatos propios; sin CSS suelto. |
| M10 | Banner de oferta con "ciclo de horas" (reloj que se reinicia), hoy desactivado. | No existe: la urgencia usa solo fecha de fin real. |
| M11 | Textos: "nos serivirá", "Devolución en Lumielle" como fila de comparación, "reseñas de clientas" (voz de marca fija). | Plantillas neutras; la voz se escribe por marca. |

## Lo que funciona y se conservó

- Anatomía 80/20 de la ficha (13 secciones) y la sección "TC · Contenido" con 13 diseños.
- Packs x1 / x2 / x3 con ahorro, precio por unidad, "la 2.ª por $X" y lista de valor calculados con los precios de Shopify.
- Una sola fuente de verdad para envío y pagos (`store-tokens`, `pay-copy`, `pay-allowed`).
- Barra fija de compra desde el primer segundo en celular, galería con datos grandes, reseñas con fotos y visor, carrusel de videos.
- Foco visible, objetivos táctiles de 44 px y animaciones apagadas con "reducir movimiento".

## Qué hacer hoy en la tienda Lumielle

El tema nuevo no toca la tienda publicada. Estas correcciones son de datos y textos de Lumielle:

1. **Envío:** poner 50000 en Tema → Conversión → "Envío gratis desde", o cambiar el perfil de envío a $45.000. Cambiar el texto fijo de la marquesina por `ENVÍO GRATIS DESDE [envio_gratis_desde]` o por el monto correcto.
2. **Stock:** cargar inventario de las tres variantes de la crema (o permitir vender sin stock si es por pedido).
3. **Colágeno:** cargarle precio o pasarlo a borrador.
4. **Prueba de la crema:** borrar "59 vendidos" y la línea "4,9/5 · 59 compras verificadas" hasta tener ventas reales; en Opiniones, corregir el promedio de la fuente a 4,7 (o la distribución) y agregar el link a las reseñas originales.
5. **Colecciones:** quitar el bloque "Producción nacional certificada".
6. **Colágeno:** completar el RNPA y el importador, o borrar esas frases. Escribir "iHerb" en "Nombre de la fuente" para que se vean las reseñas.
7. Crear la plantilla de contacto con formulario, o cambiar la página Contacto a la plantilla por defecto.
8. Borrar el ajuste de colección de upsell o crear la colección `linea-completa`.
