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

## Imágenes con ChatGPT (gpt-image-2)

Claude genera y edita imágenes con la API de imágenes de OpenAI: pedile "hacé una foto del producto en…" y usa la skill `gpt-image-2` (`.claude/skills/gpt-image-2`, adaptada de [AgustinGoniDev/gpt-image-2-skill-claude-code](https://github.com/AgustinGoniDev/gpt-image-2-skill-claude-code)), que tiene la guía de prompts, un preset para Lumielle y el script `scripts/generar_imagen.py` (Python 3, sin instalar nada). Las imágenes quedan en `imagenes/`.

Para que funcione en Claude Code en la web, en la configuración del entorno (menú del entorno en la barra de título de la sesión → Edit):

1. **Clave**: cargá `OPENAI_API_KEY` con tu clave de OpenAI, en "API credentials" si aparece o como variable de entorno. La toman las sesiones nuevas. No la pegues en el chat ni en un archivo del repo.
2. **Red**: en Network access, agregá `api.openai.com` a los dominios permitidos, y `cdn.shopify.com` para usar las fotos de la tienda como referencia.
3. La cuenta de OpenAI necesita saldo. Si la API pide verificar la organización, se hace en platform.openai.com → Settings → Organization → General.

Uso directo del script:

```sh
# Con la foto real del producto como referencia, formato 4:5 para el feed de Meta
python3 scripts/generar_imagen.py "The product from Image 1 on light marble, soft morning light" \
  --image "https://cdn.shopify.com/s/files/1/1030/6922/1143/files/sadoer-pedestal.webp?v=1790197592&width=1200" \
  --input-fidelity high --size 4:5 --out imagenes/marmol.png

# Tres variantes en calidad media para elegir, con el prompt en un archivo
python3 scripts/generar_imagen.py --prompt-file prompt.txt -n 3 --quality medium --size 9:16

# Modelos de imagen de la cuenta, y todas las opciones
python3 scripts/generar_imagen.py --list-models
python3 scripts/generar_imagen.py --help
```

Tamaños: `1:1`, `4:5`, `4:3`, `9:16`, `16:9`, `2:3`, `3:2` o `WxH` (lados múltiplos de 16). Usa el `gpt-image` más nuevo de la cuenta; `--model` o `OPENAI_IMAGE_MODEL` lo fijan.

## Fuentes citadas en la página

- "Rethinking the aging neck", European Journal of Plastic Surgery (2026): https://link.springer.com/article/10.1007/s00238-026-02520-9
- American Academy of Dermatology, "How to apply sunscreen": https://www.aad.org/public/everyday-care/sun-protection/shade-clothing-sunscreen/how-to-apply-sunscreen
- Kafi y col., "Improvement of naturally aged skin with vitamin A (retinol)", Archives of Dermatology (2007): https://pubmed.ncbi.nlm.nih.gov/17515510/
