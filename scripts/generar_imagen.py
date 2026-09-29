#!/usr/bin/env python3
"""Genera y edita imágenes con la API de imágenes de OpenAI (el modelo de ChatGPT).

Solo usa la biblioteca estándar de Python 3: no hay que instalar nada.

  python3 scripts/generar_imagen.py "prompt" --size 4:5 --out imagenes/gesto.png
  python3 scripts/generar_imagen.py "prompt" --image foto-producto.webp --input-fidelity high
  python3 scripts/generar_imagen.py --list-models

La clave sale de OPENAI_API_KEY (variable de entorno, o un archivo .env en la raíz
del repo, que git ignora). Nunca la escribas en un archivo versionado.
"""
import argparse
import base64
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE_URL = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
FALLBACK_MODEL = "gpt-image-2"
SIZES = {
    "square": "1024x1024", "cuadrado": "1024x1024", "1:1": "1024x1024",
    "portrait": "1024x1536", "vertical": "1024x1536", "2:3": "1024x1536",
    "landscape": "1536x1024", "horizontal": "1536x1024", "3:2": "1536x1024",
    # Solo gpt-image-2 acepta tamaños libres (lados múltiplos de 16).
    "4:3": "1536x1152", "4:5": "1088x1360", "9:16": "1152x2048", "16:9": "1536x864",
}
FORMATS = {".png": "png", ".jpg": "jpeg", ".jpeg": "jpeg", ".webp": "webp"}


class Fail(Exception):
    pass


def api_key():
    key = os.environ.get("OPENAI_API_KEY", "").strip()
    env_file = ROOT / ".env"
    if not key and env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            name, _, value = line.partition("=")
            if name.strip().removeprefix("export ").strip() == "OPENAI_API_KEY":
                key = value.strip().strip("'\"")
    if not key:
        raise Fail("Falta OPENAI_API_KEY: cargala como variable del entorno o en un archivo .env en la raíz del repo.")
    return key


def http(url, data=None, headers=None, timeout=600):
    host = urllib.parse.urlsplit(url).netloc
    try:
        req = urllib.request.Request(url, data=data, headers=headers or {})
        with urllib.request.urlopen(req, timeout=timeout) as res:
            return res.read()
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")
        try:
            detail = json.loads(detail)["error"]["message"]
        except (ValueError, KeyError, TypeError):
            pass
        raise Fail(f"{host} respondió {e.code}: {detail}")
    except urllib.error.URLError as e:
        msg = f"No se pudo conectar con {host}: {e.reason}"
        if "Tunnel connection failed" in str(e.reason):
            msg += f"\nLa red del entorno no deja salir a {host}: agregalo a los dominios permitidos del entorno."
        raise Fail(msg)
    except TimeoutError:
        raise Fail(f"{host} tardó demasiado en responder; probá de nuevo.")


def api(path, key, body=None, content_type=None):
    headers = {"Authorization": f"Bearer {key}"}
    if content_type:
        headers["Content-Type"] = content_type
    return json.loads(http(BASE_URL + path, body, headers))


def image_models(key):
    return sorted(m["id"] for m in api("/models", key)["data"] if "image" in m["id"])


def pick_model(key):
    # El gpt-image-N más nuevo de la cuenta (sin -mini ni snapshots con fecha).
    try:
        ids = image_models(key)
    except Fail:
        return FALLBACK_MODEL
    versions = [(tuple(map(int, m[1].split("."))), m[0])
                for m in (re.fullmatch(r"gpt-image-(\d+(?:\.\d+)?)", i) for i in ids) if m]
    return max(versions)[1] if versions else FALLBACK_MODEL


def sniff(data):
    if data.startswith(b"\x89PNG"):
        return "image/png", ".png"
    if data.startswith(b"\xff\xd8\xff"):
        return "image/jpeg", ".jpg"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp", ".webp"
    return None, None


def load_image(src):
    if re.match(r"https?://", src):
        # Sin Accept explícito el CDN de Shopify puede devolver AVIF, que la API no acepta.
        data = http(src, headers={"Accept": "image/png,image/jpeg,image/webp"}, timeout=120)
    else:
        try:
            data = Path(src).read_bytes()
        except OSError as e:
            raise Fail(f"No se pudo leer {src}: {e.strerror}")
    mime, ext = sniff(data)
    if not mime:
        raise Fail(f"{src}: la referencia tiene que ser PNG, JPG o WebP.")
    return mime, ext, data


def multipart(fields, files):
    boundary = uuid.uuid4().hex
    parts = [f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode()
             for name, value in fields.items()]
    for name, filename, mime, data in files:
        parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"; filename="{filename}"\r\n'
                     f"Content-Type: {mime}\r\n\r\n".encode() + data + b"\r\n")
    parts.append(f"--{boundary}--\r\n".encode())
    return b"".join(parts), f"multipart/form-data; boundary={boundary}"


def main():
    p = argparse.ArgumentParser(description="Genera y edita imágenes con la API de OpenAI (gpt-image, el modelo de ChatGPT).")
    p.add_argument("prompt", nargs="?", help="la imagen que querés (o usá --prompt-file)")
    p.add_argument("--prompt-file", help="leer el prompt de un archivo de texto")
    p.add_argument("--image", action="append", default=[], metavar="ARCHIVO_O_URL",
                   help="imagen de referencia, repetible hasta 16: la foto real del producto, una pose, un estilo")
    p.add_argument("--input-fidelity", choices=["low", "high"],
                   help="con --image: 'high' respeta más los detalles de la referencia (envase, logo, rostro)")
    p.add_argument("--out", help="archivo de salida; la extensión define el formato (.png, .jpg, .webp). "
                                 "Por defecto imagenes/imagen-<fecha>.png")
    p.add_argument("--size", default="auto",
                   help="WxH (con gpt-image-2, lados múltiplos de 16), auto, o 1:1, 2:3, 3:2, 4:3, 4:5, 9:16, 16:9")
    p.add_argument("--quality", default="high", choices=["low", "medium", "high", "auto"])
    p.add_argument("-n", type=int, default=1, help="cuántas variantes generar (1 a 10)")
    p.add_argument("--background", choices=["auto", "opaque", "transparent"], help="transparent: fondo transparente (.png o .webp)")
    p.add_argument("--compression", type=int, help="compresión 0-100 para .jpg y .webp")
    p.add_argument("--moderation", choices=["auto", "low"], help="low: filtro de contenido menos estricto")
    p.add_argument("--model", default=os.environ.get("OPENAI_IMAGE_MODEL"),
                   help="por defecto OPENAI_IMAGE_MODEL o el gpt-image más nuevo de la cuenta")
    p.add_argument("--list-models", action="store_true", help="listar los modelos de imagen de la cuenta y salir")
    args = p.parse_args()

    key = api_key()
    if args.list_models:
        print("\n".join(image_models(key)))
        return

    if bool(args.prompt) == bool(args.prompt_file):
        p.error("pasá el prompt o --prompt-file (uno de los dos)")
    prompt = args.prompt or Path(args.prompt_file).read_text(encoding="utf-8").strip()
    out = Path(args.out) if args.out else ROOT / "imagenes" / f"imagen-{time.strftime('%Y%m%d-%H%M%S')}.png"
    fmt = FORMATS.get(out.suffix.lower())
    if not fmt:
        p.error("--out tiene que terminar en .png, .jpg o .webp")

    refs = [load_image(src) for src in args.image]
    model = args.model or pick_model(key)
    fields = {"model": model, "prompt": prompt, "size": SIZES.get(args.size, args.size),
              "quality": args.quality, "n": args.n, "output_format": fmt}
    for name in ("background", "compression", "moderation"):
        value = getattr(args, name)
        if value is not None:
            fields["output_compression" if name == "compression" else name] = value

    print(f"Generando con {model}…", file=sys.stderr)
    if refs:
        if args.input_fidelity:
            fields["input_fidelity"] = args.input_fidelity
        field = "image[]" if len(refs) > 1 else "image"
        files = [(field, f"ref{i}{ext}", mime, data) for i, (mime, ext, data) in enumerate(refs, 1)]
        res = api("/images/edits", key, *multipart(fields, files))
    else:
        res = api("/images/generations", key, json.dumps(fields).encode(), "application/json")

    items = res.get("data") or []
    if not items:
        raise Fail(f"OpenAI no devolvió imágenes: {json.dumps(res)[:500]}")
    out.parent.mkdir(parents=True, exist_ok=True)
    for i, item in enumerate(items, 1):
        path = out if len(items) == 1 else out.with_name(f"{out.stem}-{i}{out.suffix}")
        path.write_bytes(base64.b64decode(item["b64_json"]))
        print(path)
    usage = res.get("usage") or {}
    if usage:
        print(f"Tokens: {usage.get('input_tokens')} de entrada, {usage.get('output_tokens')} de salida", file=sys.stderr)


if __name__ == "__main__":
    try:
        main()
    except Fail as e:
        sys.exit(f"Error: {e}")
