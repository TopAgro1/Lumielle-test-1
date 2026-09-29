# Prompting Guide — OpenAI gpt-image-2

Resumen condensado de la [guía oficial de OpenAI](https://developers.openai.com/cookbook/examples/multimodal/image-gen-models-prompting-guide). Leer siempre antes de redactar un prompt.

---

## Estructura recomendada del prompt

```
[background/scene] → [subject] → [key details] → [constraints]
```

Ejemplo:
> Dark gradient background with neon green accent. Person centered, looking at camera with surprised expression, business casual attire. Bold sans-serif text "CLAUDE CODE ERRORS" top-right, high contrast. No watermark, no extra text, no logos.

---

## Subjects & materiales

- Ser concreto: materiales, formas, texturas, medio visual (photo, watercolor, 3D render, flat illustration)
- Para fotorrealismo: incluir la palabra `photorealistic` + texturas reales (pores, wrinkles, fabric wear, imperfections)
- Variantes válidas: `"real photograph"`, `"taken on a real camera"`, `"professional photography"`, `"iPhone photo"`
- Para personas: describir escala, framing corporal, mirada, interacción con objetos
  - Ejemplos: `"full body visible, feet included"`, `"looking down at the notebook, not at the camera"`, `"hands naturally gripping the phone"`

---

## Composición & framing

- Especificar: framing (close-up, wide, top-down), perspectiva (eye-level, low-angle), lighting, placement
- Placement explícito cuando importa: `"logo top-right"`, `"subject centered with negative space on left"`
- Para escenas atmosféricas (noche, lluvia, neon): agregar detalle extra de escala, atmósfera y color

---

## Texto en la imagen

- Texto literal: entre comillas dobles en el prompt → `Text: "CLAUDE CODE" in bold sans-serif`
- ALL CAPS para titulares; deletrear letra por letra palabras raras o nombres de marca
- Especificar tipografía como constraint: `"Typography: bold sans-serif, high contrast, centered, clean kerning"`
- Usar `quality=medium` o `high` para texto pequeño, layouts densos, multi-font
- Si el texto no queda bien: iterar con ajustes pequeños de wording/layout, no reescribir todo el prompt

---

## Estilo visual & fotografía

- Usar lenguaje de fotografía para resultados naturales: `lens, lighting, framing`
- Evitar lenguaje de concept art para cosas que deben verse "shipped" (mockups, UI, ads)
- Para ads/marketing: escribir como brief creativo → incluir marca, audiencia, vibe, escena y copy exacto
- Para UI/mockups: describir como spec de artifact, no como ilustración

---

## Referencias & identidad

- Indexar cada input: `"Image 1: photo of person... Image 2: style reference..."`
- Describir la interacción: `"apply Image 2's style to Image 1"`, `"put the subject from Image 1 in this scene"`
- Para preservar identidad en edits: **lockear explícitamente**:
  ```
  Do not change face, facial features, skin tone, body shape, pose, or hair in any way.
  ```
- Para ropa/outfit: `"change only the garment, preserve everything else"`
- Para multi-step workflows: usar una "character anchor" y restatar los invariants en cada iteración

---

## Constraints negativos (siempre al final del prompt)

```
No watermark. No extra text. No logos. No trademarks. Preserve [identity/layout/geometry].
```

- Usar lenguaje imperativo: `"Preserve"`, `"Do not change"`, `"Keep"`, `"Exact"`
- Evitar lenguaje vago: nada de `"maybe change"`, `"try to keep"`
- **Repetir en cada iteración** — el modelo puede drift si no se restate

---

## Quality

| Nivel | Cuándo usar |
|-------|-------------|
| `low` | Drafts, pruebas rápidas, volumen alto |
| `medium` | Baseline para la mayoría de casos |
| `high` | Texto pequeño, infografías densas, portraits, edits con identidad, outputs finales |

---

## Tamaños válidos para gpt-image-2

**Reglas:**
- Ambos lados: múltiplos de 16
- Max edge: < 3840px
- Ratio largo/corto: ≤ 3:1
- Total px: 655.360 – 8.294.400
- Tratar > 2560×1440 como experimental

**Referencias comunes:**
| Uso | Size |
|-----|------|
| Cuadrado | 1024×1024 |
| Vertical (portrait) | 1024×1536 |
| Horizontal (landscape) | 1536×1024 |
| YT Thumbnail estándar | 1536×1024 |
| Story Instagram | 1024×1792 |
| Límite confiable | 2560×1440 |

---

## Iteración

- Empezar con prompt limpio y base corta
- Refinar con **un cambio por vez** (lighting, composición, texto, etc.)
- Ejemplos de iteraciones: `"make lighting warmer"`, `"remove the extra text"`, `"restore the original background"`
- En cada iteración: restatar los constraints críticos de preservación

---

## Anti-patterns a evitar

- Lenguaje vago o genérico (`"beautiful"`, `"amazing"`, `"nice"` sin especificar qué)
- Sobre-especificar specs de cámara (se interpretan de forma laxa de todas formas)
- Lenguaje de concept art para UI/mockups → se ve como sketch, no como producto terminado
- Dejar abierta la posibilidad de que el modelo agregue elementos no pedidos
- No restatar constraints en iteraciones → drift progresivo
