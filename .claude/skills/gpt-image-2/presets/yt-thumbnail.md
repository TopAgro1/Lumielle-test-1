# Preset: yt-thumbnail

## Cuándo aplica
Miniaturas de YouTube. Imágenes de alta energía visual pensadas para destacar en el feed y generar clicks. Suelen incluir una persona con expresión enfatizada y texto grande.

## Sizes recomendados
- **Siempre 16:9**: `1536×864` (múltiplo de 16 más cercano al estándar 1920×1080)
- No hay variantes — YouTube thumbnail es siempre horizontal 16:9

## Quality recomendada
`high` — siempre. Las miniaturas son el primer punto de contacto visual; texto y cara deben ser nítidos.

## Referencias
Si el usuario quiere usar una foto propia (la suya, la de otra persona, o una imagen base), pedir el path. Indexar en el prompt: `"Image 1: photo of [persona/objeto]"`.

Lockear identidad cuando hay personas: `"Do not change face, hair, skin tone, body shape, or pose"`.

Si el usuario no provee referencia, generar desde texto puro describiendo el sujeto.

## Composición
- Persona: centrada o ligeramente a la izquierda, mirando a cámara
- Expresión: exagerada (sorpresa, frustración, entusiasmo) — alta energía visual
- Texto: título grande en la derecha o parte superior, 3-5 palabras máximo
- Fondo: simple, alto contraste con el sujeto (degradado oscuro, color sólido, o contexto mínimo)
- Jerarquía clara: persona > texto > fondo

## Estilo visual
- Tipografía: bold sans-serif, alto contraste (blanco sobre oscuro o negro sobre claro)
- Mood: energético, directo

## Texto en imagen
- Máximo 5-6 palabras
- ALL CAPS para el concepto principal
- Entre comillas dobles en el prompt: `Text: "CLAUDE CODE" bold, white, top-right corner`
- Evitar texto pequeño o subtítulos — ilegibles en thumbnail pequeño

## Constraints obligatorios (al final del prompt)
```
No watermark. No extra text not specified. No additional logos. Preserve sharp facial detail.
```

Si hay imagen de referencia con persona, agregar:
```
Do not change face, hair, skin tone, body shape, or pose from Image 1.
```

## Template de prompt

```
[Background: dark gradient / vibrant solid / scene with high contrast]. 
[If reference: Image 1: <descripción del sujeto>]. 
[Pose/expression: surprised, pointing, looking at camera with intensity, etc.]. 
Subject [centered / slightly left], [framing: upper body / close-up]. 
Text: "[TITULO EN MAYUSCULAS]" in bold sans-serif, [position: top-right / bottom-right], high contrast. 
Soft dramatic lighting. Photorealistic. 
No watermark. No extra text not specified.
```

## Ejemplo

**Pedido:** miniatura para video "5 errores con Claude Code", con foto de referencia

**Prompt:**
```
Dark charcoal gradient background with neon accent strip on the left edge. 
Image 1: person from the reference photo, business casual attire. 
Subject centered, upper body visible, looking directly at camera with a surprised-frustrated expression, hand raised slightly. 
Text: "5 ERRORES FATALES" in bold white sans-serif, large, top-right corner. Text: "con CLAUDE CODE" smaller, directly below, same style. 
Dramatic soft lighting from front-left. Photorealistic portrait quality. 
Do not change face, hair, skin tone, body shape, or pose from Image 1. 
No watermark. No extra text not specified. No additional logos.
```

**Parámetros:** `size 1536x864`, `quality high`, con referencia
