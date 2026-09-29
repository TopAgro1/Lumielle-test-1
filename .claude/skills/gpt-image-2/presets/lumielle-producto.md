# Preset: lumielle-producto

## Cuándo aplica
Imágenes de la tienda Lumielle: fotos de producto, escenas de uso (lifestyle), imágenes para las secciones de la landing (`index.html`) y creatividades de Meta Ads. El producto actual es la crema para cuello y escote con doble rodillo (SADOER).

## Sizes recomendados
Según dónde va la imagen:

| Destino | Size |
|---|---|
| Landing: portada y oferta (móvil) | `4:3` → 1536x1152 |
| Landing: secciones con imagen al costado | `4:5` → 1088x1360 |
| Landing: oferta (escritorio), feed cuadrado | `1:1` → 1024x1024 |
| Meta Ads feed | `4:5` → 1088x1360 |
| Meta Ads stories y reels | `9:16` → 1152x2048 |

## Quality recomendada
`high` para lo que se publica (el envase y la piel tienen que verse nítidos); `medium` o `low` con `-n 3` para explorar ideas.

## Referencias
Siempre que aparezca el producto, pasar su foto real con `--image` y `--input-fidelity high`, e indexarla en el prompt como `Image 1`. Fotos disponibles en el CDN de Shopify:

- Frasco sobre pedestal: `https://cdn.shopify.com/s/files/1/1030/6922/1143/files/sadoer-pedestal.webp?v=1790197592&width=1200`
- Primer plano: `https://cdn.shopify.com/s/files/1/1030/6922/1143/files/sadoer-closeup.webp?v=1790197592&width=1200`
- Gesto de uso: `https://cdn.shopify.com/s/files/1/1030/6922/1143/files/sadoer-facehold.webp?v=1790197592&width=1400`

Si `cdn.shopify.com` está bloqueado en la red del entorno, pedir que lo habiliten o que suban la foto al repo.

## Composición
- Un solo foco: el producto o el gesto de pasar el rodillo por el cuello, de abajo hacia arriba
- Personas: mujer adulta (40 a 60 años, salvo que la campaña diga otra cosa), piel real con textura y poros, cuello y escote visibles, expresión tranquila
- Escenas cotidianas y creíbles: baño o tocador con luz natural de mañana, ropa puesta (el rodillo aplica la crema sin tocarla con los dedos)
- Espacio libre a un costado si la imagen va a llevar texto encima
- En `9:16`, dejar las franjas de arriba y de abajo sin texto ni producto: la interfaz de stories y reels las tapa

## Estilo visual
- Paleta Lumielle v2: blancos, nude cálido (#f5eee8), lila claro (#f1eafb, #e4d8f5) y violeta como acento (#7b52b0, #4b2e83). Nada de neón ni saturados
- Fotografía editorial de cosmética: luz suave y difusa, sombras suaves, fondo limpio
- Materiales que acompañan: mármol claro, lino, cerámica, toallas blancas, alguna planta; sin otros productos de marca

## Texto en imagen
Solo si se pide: el copy va mejor en el texto del anuncio y en la página. Si lleva texto: máximo 5 palabras, en español rioplatense, entre comillas dobles en el prompt (ejemplo: `"¿Y EL CUELLO?"`), serif de alto contraste estilo Bodoni.

## Constraints obligatorios (al final del prompt)
```
Keep the exact product from Image 1: bottle shape, cap, roller applicator, label text and colors. Do not redesign, relabel or add packaging. Realistic skin texture, no plastic retouching. No before-and-after comparison. No watermark. No extra text not specified. No other brands or logos.
```

Además, sin excepción:
- No generar "antes y después" ni resultados exagerados en la piel (Meta restringe ese tipo de imagen en cosmética y sería una promesa inventada)
- No presentar a personas generadas como clientas reales, reseñas o UGC: la landing solo muestra opiniones y videos reales

## Template de prompt

```
[Uso: e.g. Vertical lifestyle photo for a skincare landing page / Meta feed ad].
[Background/scene: lugar, luz, materiales, paleta Lumielle].
Image 1: the product (neck and décolletage cream with a double roller applicator).
[Subject: quién o qué, pose, framing, dónde está el producto, qué hace].
[Key details: luz, lente/framing, textura de piel, espacio libre para texto].
[Text if any: "[TEXTO]" in high-contrast serif, [posición]].
[Constraints obligatorios].
```

## Ejemplo

**Pedido:** imagen para la sección "La solución" (4:5), el gesto de uso con el producto real

**Prompt:**
```
Vertical lifestyle photograph for a skincare landing page, 4:5.
Bright bathroom vanity in soft morning window light, warm nude and white tones with a subtle lilac accent, light marble counter, folded white linen towel.
Image 1: the product, a neck and décolletage cream with a double roller applicator.
A woman in her early 50s wearing a cream knit top, chin slightly raised, gliding the product from Image 1 upward along the side of her neck with one hand, relaxed expression, eyes half closed. Framing from shoulders to top of head, neck and collarbone in sharp focus.
Photorealistic, 85mm lens look, shallow depth of field, natural skin texture with visible pores and fine lines.
Keep the exact product from Image 1: bottle shape, cap, roller applicator, label text and colors. Do not redesign, relabel or add packaging. Realistic skin texture, no plastic retouching. No before-and-after comparison. No watermark. No extra text not specified. No other brands or logos.
```

**Comando:**
```bash
python3 scripts/generar_imagen.py --prompt-file <scratchpad>/prompt.txt --size 4:5 --quality high \
  --image "https://cdn.shopify.com/s/files/1/1030/6922/1143/files/sadoer-pedestal.webp?v=1790197592&width=1200" \
  --input-fidelity high --out imagenes/lumielle-producto-gesto-cuello-20260929.png
```
