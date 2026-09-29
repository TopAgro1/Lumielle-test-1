# Preset: linkedin-infografia

## Cuándo aplica
Infografías para LinkedIn: contenido visual que explica un concepto, proceso, framework, estadística o comparación. Pensadas para el feed de LinkedIn donde se leen rápido y se guardan para referencia.

## Sizes recomendados
- Cuadrado (más común en feed): `1024×1024`
- Vertical (más espacio para contenido): `1024×1536`
- Elegir según cantidad de contenido a incluir

## Quality recomendada
`high` — infografías tienen texto y elementos estructurados; calidad baja degrada la legibilidad.

## Referencias
No necesarias habitualmente. Opcional si el usuario quiere un estilo visual específico de referencia.

## Composición
- Jerarquía visual clara: título → datos/puntos clave → fuente/CTA
- Secciones bien separadas con espacio en blanco generoso
- Iconografía simple y consistente (flat style)
- Evitar saturar con texto — si hay mucho contenido, proponer dos imágenes

## Estilo visual
- Fondos limpios: blanco, gris muy claro, o dark sólido
- Tipografía: clean sans-serif, nunca más de 2 pesos (bold para títulos, regular para cuerpo)
- Mood: profesional, tech-minimalista, confiable — no colorido ni festivo
- Si el usuario indica colores específicos, usarlos como acento

## Texto en imagen
- Título: claro y directo, máximo 8-10 palabras — entre comillas en el prompt
- Bullets/datos: máximo 5-6 ítems para que sea legible
- Especificar tipografía: `clean sans-serif, dark on white, high contrast`

## Constraints obligatorios
```
Clean layout, ample white space. No decorative clutter. No stock photo elements. No watermark. No extra text not specified in the prompt. Consistent icon style throughout.
```

## Template de prompt

```
[White / dark] background infographic for LinkedIn. 
Title at top: "[TITULO]" in bold sans-serif, [color]. 
[N] key points listed vertically, each with a simple flat icon on the left: 
  1. Bold: "[título punto 1]" — Regular: "[descripción]" 
  2. Bold: "[título punto 2]" — Regular: "[descripción]"
  ...
[Optional: bottom section with a stat or CTA: "[texto]"]
Typography: clean sans-serif, consistent weight hierarchy (bold titles, regular body). 
Ample white space between sections. No decorative elements. No watermark. No extra text.
```

## Ejemplo

**Pedido:** infografía sobre los 3 tipos de agentes de IA para empresas

**Prompt:**
```
White background LinkedIn infographic. 
Title at top: "3 TIPOS DE AGENTES DE IA PARA TU EMPRESA" in bold dark sans-serif, large. 
Three sections listed vertically with spacing, each with a minimal flat icon on the left: 
  1. Bold: "Agentes de proceso" — Regular: "Automatizan tareas repetitivas paso a paso" 
  2. Bold: "Agentes de decisión" — Regular: "Evalúan contexto y toman decisiones en tiempo real" 
  3. Bold: "Agentes de síntesis" — Regular: "Analizan información y generan reportes o resúmenes" 
Typography: clean Inter-style sans-serif, dark text, high contrast. 
Ample white space. No decorative clutter. No watermark. No extra text.
```

**Parámetros:** `size 1024x1024`, `quality high`
