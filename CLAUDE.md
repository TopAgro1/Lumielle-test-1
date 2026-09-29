# Lumielle · notas para Claude

- Imágenes: generalas vos con la skill `gpt-image-2` (`.claude/skills/gpt-image-2`, que usa `scripts/generar_imagen.py` y la API de OpenAI). Cuando otra skill pida "prompts de imágenes para ChatGPT", generá las imágenes en lugar de entregar solo los prompts.
- La clave de OpenAI sale de `OPENAI_API_KEY` (variable del entorno o `.env`, que git ignora). Nunca la escribas en un archivo versionado ni en un commit.
