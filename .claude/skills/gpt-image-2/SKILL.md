---
name: gpt-image-2
description: Genera y edita imágenes con OpenAI gpt-image-2 (el modelo de imágenes de ChatGPT) llamando a la API con scripts/generar_imagen.py. Soporta generación desde texto y edición con imágenes de referencia (archivos o URLs del CDN de Shopify). Presets para fotos de producto y anuncios de Lumielle, miniaturas de YouTube, infografías de LinkedIn y uso genérico. Triggereá cuando el usuario diga 'generá una imagen', 'creá una imagen', 'hacé una foto del producto', 'armá la creatividad del anuncio', 'armá una miniatura', 'hacé una infografía', 'necesito una imagen para...', o variantes, y cuando otra skill pida prompts de imágenes para ChatGPT: en vez de entregar el prompt, generá la imagen.
---

# Skill: gpt-image-2 — Generación de imágenes via API

Adaptada de [AgustinGoniDev/gpt-image-2-skill-claude-code](https://github.com/AgustinGoniDev/gpt-image-2-skill-claude-code). `PROMPTING_GUIDE.md` y los presets `generico`, `yt-thumbnail` y `linkedin-infografia` son los originales. Cambios: la llamada la hace `scripts/generar_imagen.py` (funciona detrás del proxy de Claude Code en la web, arma el multipart y acepta varias referencias y URLs), la clave nunca pasa por el chat, y se sumó el preset `lumielle-producto`.

---

## Step 1 — API key y red

Desde la raíz del repo:

```bash
python3 scripts/generar_imagen.py --list-models
```

- **Lista modelos**: listo, seguir.
- **`Falta OPENAI_API_KEY`**: pedile a la persona que cargue `OPENAI_API_KEY` en la configuración del entorno (menú del entorno en la barra de título de la sesión → Edit; en "API credentials" si aparece, si no como variable de entorno). La toma una sesión nueva. **No le pidas que pegue la clave en el chat.** Si ya la pegó, usala en esta sesión escribiéndola en `.env` en la raíz del repo (`OPENAI_API_KEY=...`; `.env` está en `.gitignore`, nunca lo agregues a un commit) y sugerile rotarla cuando la cargue en el entorno.
- **`Tunnel connection failed: 403`**: la red del entorno bloquea `api.openai.com`. Se agrega en Network access, en la misma configuración (y `cdn.shopify.com` para usar fotos de la tienda como referencia).
- **`respondió 401`**: clave inválida o revocada. **`403` que menciona "verified"**: hay que verificar la organización en platform.openai.com → Settings → Organization → General. **`429` con "quota"**: la cuenta de OpenAI no tiene saldo.

---

## Step 2 — Detectar preset

| Preset | Cuándo usarlo |
|--------|--------------|
| `lumielle-producto` | Fotos de producto, lifestyle, imágenes de la landing y creatividades de Meta Ads de la tienda |
| `yt-thumbnail` | Miniaturas de YouTube, thumbnails de video |
| `linkedin-infografia` | Infografías visuales para LinkedIn |
| `generico` | Cualquier otro asset sin plataforma específica |

Si no está claro, preguntar al usuario antes de continuar.

---

## Step 3 — Cargar contexto (OBLIGATORIO antes de redactar el prompt)

Cargar siempre:
1. [PROMPTING_GUIDE.md](PROMPTING_GUIDE.md) — best practices para redactar el prompt
2. El archivo de preset correspondiente en [presets/](presets/)

---

## Step 4 — Decidir parámetros

- **`--size`**: `WxH` con las reglas de gpt-image-2 (ambos lados múltiplos de 16, lado mayor < 3840px, ratio ≤ 3:1, total 655.360–8.294.400px) o un atajo: `1:1` (1024x1024), `4:5` (1088x1360), `4:3` (1536x1152), `9:16` (1152x2048), `16:9` (1536x864), `2:3` (1024x1536), `3:2` (1536x1024).
- **`--quality`**: `high` para texto fino / identidad o producto a preservar / output final; `medium` para la mayoría de casos; `low` para drafts.
- **`--image`**: referencias, repetible (archivo local o URL). Si el usuario menciona "con mi foto", "usando esta imagen", o el preset lo requiere. Preguntar qué archivo si no fue indicado. Con referencias de producto o de personas, sumar `--input-fidelity high`.
- **`-n`**: 2 a 4 variantes cuando la persona tiene que elegir.

---

## Step 5 — Redactar el prompt

Siguiendo `PROMPTING_GUIDE.md`:
1. Orden: background/scene → subject → key details → constraints
2. Siempre en inglés. El texto literal que va dentro de la imagen, en el idioma de la pieza (español rioplatense para Lumielle)
3. Texto literal en la imagen: entre comillas dobles en el prompt + ALL CAPS para titulares
4. Constraints negativos al final: "no watermark", "no extra text", etc.
5. Con referencia: incluir `"Do not change face, hair, skin tone, body shape"` si hay personas

---

## Step 6 — Resolver paths

- **Prompt**: escribirlo en un `.txt` del scratchpad y pasarlo con `--prompt-file` (evita problemas de comillas en la shell).
- **Output**: `imagenes/<preset>-<slug>-<YYYYMMDD>.png` desde la raíz del repo. La extensión define el formato (`.png`, `.webp`, `.jpg`). Con `-n` el script agrega `-1`, `-2`…
  - Ejemplo: `imagenes/lumielle-producto-crema-marmol-20260929.png`
- **Referencias**: el path o la URL que indique el usuario.

---

## Step 7 — Invocar

```bash
python3 scripts/generar_imagen.py --prompt-file <PROMPT.txt> \
  --size <WxH|atajo> --quality <low|medium|high> \
  [--image <ARCHIVO_O_URL> ...] [--input-fidelity high] [-n <N>] \
  --out imagenes/<preset>-<slug>-<YYYYMMDD>.png
```

- Usa el `gpt-image-N` más nuevo que tenga la cuenta (gpt-image-2); `--model` lo fija.
- `high` puede tardar un par de minutos: correrlo con un timeout amplio (10 minutos).
- Imprime la ruta de cada imagen y los tokens usados. Si falla, reportar el error tal cual y la causa probable según el Step 1.
- Más opciones: `--background transparent`, `--compression 0-100` (webp/jpg), `--moderation low`. Ver `--help`.

---

## Step 8 — Mostrar resultado

- Mirar la imagen antes de entregarla (abrirla con Read) y mostrársela a la persona
- Reportar: path de la imagen, parámetros usados (size, quality, modelo), prompt final (para referencia y futuras iteraciones)
- Ofrecer iterar con cambios pequeños (un cambio por vez, según la guía)
- Las imágenes quedan en `imagenes/` hasta que se commitean: si la persona las quiere conservar, commitearlas. Para usarlas en la landing hay que subirlas a Shopify (Contenido → Archivos) y cambiar la URL en `index.html`

---

## Reglas duras

- **Nunca** redactar el prompt sin haber cargado `PROMPTING_GUIDE.md` + el preset
- Prompts siempre en inglés
- Texto literal siempre entre comillas dobles en el prompt
- En iteraciones: repetir siempre los constraints de preservación (evitar drift)
- Nombre de archivo: siempre `<preset>-<slug>-<YYYYMMDD>.<ext>`
- La clave nunca va en un archivo versionado, un commit, un PR ni un comentario
