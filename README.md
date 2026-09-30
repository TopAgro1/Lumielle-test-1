# Landing · Crema para cuello con rodillo (SADOER)

Página de venta para tráfico frío de anuncios de Meta, con el sistema de diseño Lumielle v2 (clases `lm-*`, Bodoni Moda + Figtree, acento violeta). Es un solo archivo, `index.html`: las imágenes y el logo se cargan desde el CDN de Shopify de la tienda, así que se puede subir tal cual a cualquier hosting.

## Estructura (regla 80/20: 80 % problema, 20 % producto)

| # | Sección | Qué hace |
|---|---|---|
| 1 | Portada | Hook del anuncio: "Te cuidás la cara todos los días. ¿Y el cuello?", la promesa, la imagen del gesto y la garantía |
| 2 | El dolor | Capa 1: el problema con palabras de la clienta y un cierre que valida |
| 3 | Por qué pasa | Capa 2: el mecanismo, con fuentes enlazadas |
| 4 | Por qué no se hace | Capa 3: la fricción del gesto (ropa, manos, tiempo) |
| 5 | Lo que suele probarse | Transición: las alternativas y por qué no se sostienen |
| 6 | La solución | El producto responde a cada fricción + 3 pasos de uso |
| 7 | Oferta | Packs x1 / x2 (recomendado y preseleccionado) / x3, ahorro en pesos, envío según el pack, fecha de despacho |
| 8 | Confianza | Activos, comparación, reseñas y UGC (solo con datos reales), respaldo, garantía, preguntas |
| 9 | Oferta final | Cierra el hook con los packs y el botón |

Upsells: pack recomendado en el selector, barra a envío gratis y order bump de un clic en el carrito (x1 → x2, x2 → x3). La barra fija muestra el botón con el precio desde el primer segundo. "Ir a pagar" abre el checkout real de Shopify con un enlace de carrito (`/cart/<variante>:1`) y conserva los `utm_*` del anuncio.

## Qué editar

Todo está en el objeto `LM` al principio del `<script>` de `index.html`:

- `packs`: precio y variante de Shopify de cada pack. El ahorro, el precio por unidad, el envío y el total se calculan solos.
- `freeShipFrom` y `shipCost`: umbral de envío gratis y costo fijo.
- `reviews`: pegá solo reseñas reales de pedidos confirmados. Con 1 a 9 aparecen las tarjetas; con 10 o más, también el promedio y las estrellas en la portada. Sin reseñas, la sección no se muestra.
- `ugc`: videos de redes con permiso de la autora, etiquetados con usuario y red.
- Píxel de Meta: pegá el código base en el `<head>` (hay un comentario marcando el lugar). La página ya dispara `ViewContent`, `AddToCart` e `InitiateCheckout`.

## Bloqueos antes de pautar

1. **Precio del Pack x2**: en Shopify está a $54.900, igual que el x1. La página usa $89.900 como propuesta (ahorrás $19.900, $44.950 c/u). Corregilo en Shopify o cambiá `LM.packs`: página y checkout tienen que coincidir.
2. **Inventario en 0** en las tres variantes: el checkout va a rechazar la compra hasta que cargues stock.
3. **Registro ANMAT** del producto sin confirmar.
4. **Política de devolución**: la página dice "30 días para cambios y devoluciones según nuestra política de reembolso". Si aceptan producto abierto, se puede decir con más fuerza.
5. **Envío gratis desde $60.000** sale de la descripción del producto; confirmá que es el umbral configurado en la tienda.
6. **Prueba social**: hoy hay 3 pedidos, todos de prueba y anulados. Por eso la portada muestra la garantía en lugar de estrellas y la sección de opiniones queda oculta hasta tener reseñas reales.

## Fuentes citadas en la página

- "Rethinking the aging neck", European Journal of Plastic Surgery (2026): https://link.springer.com/article/10.1007/s00238-026-02520-9
- American Academy of Dermatology, "How to apply sunscreen": https://www.aad.org/public/everyday-care/sun-protection/shade-clothing-sunscreen/how-to-apply-sunscreen
- Kafi y col., "Improvement of naturally aged skin with vitamin A (retinol)", Archives of Dermatology (2007): https://pubmed.ncbi.nlm.nih.gov/17515510/

## Tema de Shopify: fotos en las reseñas

`tema-shopify/` guarda los dos archivos del tema que se cambiaron para que cada reseña pueda llevar fotos de la clienta. Están subidos en la copia sin publicar "Copia de Lumielle videos carrusel (Claude)"; el tema en vivo no se tocó.

- `sections/tc-opiniones.liquid`: el bloque **Reseña** suma "Foto 1", "Foto 2" y "Foto 3" (opcionales), y un visor que agranda la foto al tocarla (flechas si hay más de una, cierra con la X, tocando afuera o con Esc).
- `snippets/lm-review.liquid`: muestra las fotos como miniaturas cuadradas (64 px en celular, 72 px en escritorio) entre el texto y el nombre.

Para cargarlas: Personalizar la copia → plantilla de producto → sección **TC · Opiniones** → cada reseña → "Fotos de la clienta". Sin fotos, la tarjeta queda igual que antes.
