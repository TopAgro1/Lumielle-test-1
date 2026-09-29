# Preset: generico

## Cuándo aplica
Cualquier imagen que no encaje en los otros presets: slides de presentaciones, assets para artículos, ilustraciones conceptuales, mocks de producto, imágenes de blog, etc.

## Sizes recomendados
No hay recomendación fija — preguntar o inferir del uso final:

- Presentación (16:9): `1536×864`
- Artículo/blog: `1200×640` o `1536×864`
- Asset cuadrado: `1024×1024`
- Vertical: `1024×1536`

## Quality recomendada
Depende del caso:
- `low`: draft / ideación rápida
- `medium`: uso digital general
- `high`: output final con texto fino, detalles importantes, o identidad

## Referencias
Opcional según el pedido. Usar si el usuario provee imagen de estilo o contenido base.

## Composición
Adaptar según el pedido. Principios generales:
- Jerarquía visual clara: qué es lo más importante y dónde se ubica
- Espacio en blanco suficiente para que el contenido respire
- Consistencia estilística

## Texto en imagen
Definir según el pedido. Siempre:
- Texto literal entre comillas en el prompt
- Especificar tipografía y posición si importa
- Usar `quality=high` si hay texto pequeño

## Constraints obligatorios
```
No watermark. No extra text not specified in the prompt. No stock photography aesthetic unless explicitly requested.
```

## Template de prompt

```
[Describir el tipo de imagen y su uso]. 
[Background/scene: color, textura, contexto]. 
[Subject: qué es lo principal, dónde está, cómo se ve]. 
[Key details: materiales, estilo, composición, framing, lighting]. 
[Text if any: "[texto]" in [style], [position]]. 
[Constraints: no watermark, no extra text, preserve X, etc.].
```

## Notas de uso

Si no está claro, preguntar al usuario:
1. ¿Para qué se va a usar? (plataforma/contexto)
2. ¿Qué size necesita? (o cuál es el ratio apropiado)
3. ¿Es output final o draft?

Con esa información, elegir quality y size apropiados antes de generar.
