# Instalar el Tema Convertible en una tienda nueva

El tema está en `dist/tema-convertible-1.0.0.zip`. Se instala una vez por tienda; después se adapta a la marca desde la configuración y a los productos desde el editor, sin tocar código.

## 1. Subir el tema (5 minutos)

1. Descargá `dist/tema-convertible-1.0.0.zip` de este repositorio.
2. En Shopify: **Tienda online → Temas → Agregar tema → Subir archivo zip** y elegí el archivo.
3. Cuando termine de subir, tocá **Personalizar**. No lo publiques todavía.

## 2. La marca (lo único que cambia de una tienda a otra)

En el editor, **Configuración del tema** (ícono de engranaje):

| Grupo | Qué completar |
|---|---|
| Marca | Logo (SVG o PNG de una tinta), alto del logo, favicon. Sin logo, el encabezado escribe el nombre de la tienda en la tipografía de titulares. |
| Color de acento | Un preset (Ciruela, Violeta, Salvia, Océano, Terracota, Grafito) o Personalizado con 5 tonos. Toda la tienda toma el color de acá. |
| Tipografía | Titulares (5 serif o la misma del texto) y texto (6 sans). |
| Envío y despacho | **Copiá los valores de Configuración → Envío y entrega:** envío gratis desde y costo fijo. 0 = no se promete. Despacho, días de entrega, horario de corte, huso horario y feriados. |
| Medios de pago | Tildá solo lo que hoy aparece en el checkout. Si usás transferencia con descuento, creá antes el código en Descuentos con el mismo porcentaje. |
| Garantía y prueba social | Garantía corta y frase de riesgo, iguales a tu política de devoluciones. "Mostrar puntajes propios" queda apagado hasta tener reseñas de pedidos reales. |
| Contacto | Link de WhatsApp, mail y horario. |
| Legales | Razón social, CUIT, domicilio, link del botón de arrepentimiento (obligatorio en Argentina), Data Fiscal. |
| Redes | Instagram, TikTok, Facebook, YouTube. |

## 3. Lo que la tienda tiene que tener

- **Menús:** "Menú principal" (`main-menu`) y "Menú del pie" (`footer`). Las tiendas nuevas los traen.
- **Páginas:** Botón de arrepentimiento (`/pages/arrepentimiento`), Política de devoluciones, Política de envíos, Términos, Contacto (con la plantilla `page.contact`, la que traen las tiendas nuevas).
- **Productos con packs:** variantes llamadas `Pack x1`, `Pack x2`, `Pack x3` (o `Caja x6`, cualquier cosa que termine en `x` + número). El tema calcula solo el ahorro contra la unidad, el precio por unidad, "la 2.ª por $X", la lista de valor y el cambio de pack en el carrito.
- **Productos con opciones** (talle, color, sabor): se muestran como opciones con su precio; si tienen precio de comparación, el ahorro sale de ahí.
- **Stock cargado.** Si una variante no tiene stock, el botón dice "Sin stock" y, si alguien igual intenta comprar, ve el motivo.

## 4. Adaptar a los productos

**Home** (Página de inicio): Portada (promesa, foto, accesos a productos), Productos (un bloque por producto con su hook, o una colección), Comprar acá, Preguntas y Marca gigante.

**Producto** (Plantilla de producto predeterminada): viene armada con la anatomía completa. Reemplazá cada texto guía:

| # | Sección | Qué va |
|---|---|---|
| 1 | TC · Compra | Frase del anuncio (palabra por palabra), promesa, 3 beneficios, volanta y dato, fotos extra de galería, unidad (crema, bolsa…), notas de cada pack, acordeones. La descripción de Shopify aparece sola como primer acordeón. |
| 2 | TC · Opiniones | Calificación de otra tienda con fuente, fecha y link; reseñas (externas o propias); videos de usuarios con permiso. Sin datos, invita a dejar reseña con número de pedido. |
| 3 | El dolor | El problema con las palabras de la clienta + 3 situaciones. |
| 4 | Por qué importa | El mecanismo + fuente citable (opcional el recuadro "Qué dice la ciencia"). |
| 5 | Fricciones | Por qué hoy no se resuelve. |
| 6 | La solución | El producto responde a cada fricción. |
| 7 | Cómo se usa | 3 pasos con foto. |
| 8 | Garantía | La garantía exacta; el sello toma la garantía corta de la configuración. |
| 9 | Preguntas | Envío, pago, devolución, uso, contraindicaciones. Los montos salen solos con `[envio_gratis_desde]`, `[envio_fijo]`, `[medios_de_pago]`, `[cuotas]`, `[garantia]`. |
| 10 | Oferta final | Cierra el hook y repite los packs con la lista de valor. |

Opcionales de "TC · Contenido" para sumar cuando haya material real: Lo que suele probarse, Qué tiene, Calidad (etiqueta o ficha técnica), Comparación contra lo genérico, Momentos, Texto legal.

**Varios productos:** para cada uno, en el editor, **Plantillas → Producto → Crear plantilla** a partir de la predeterminada, y asignala al producto en el admin.

## 5. Antes de publicar

- [ ] En un celular de 390 px: foto, título y precio sin scroll; barra de compra visible.
- [ ] El envío gratis del tema es igual al del perfil de envío (probá un carrito justo debajo y justo arriba del umbral).
- [ ] Pack del medio preseleccionado y ahorro correcto en los tres.
- [ ] Agregar al carrito abre el carrito lateral; "Finalizar compra" llega al checkout.
- [ ] Medios de pago, garantía y devolución dicen lo mismo en anuncio, página y checkout.
- [ ] Ningún texto guía ni entre corchetes publicado; ningún nombre de otra marca.
- [ ] Toda prueba social tiene fuente; reseñas propias solo de pedidos confirmados.
- [ ] Leyendas legales de la categoría en acordeones, oferta y pie.
- [ ] Píxel de Meta conectado desde Configuración → Eventos de clientes o con el canal de Facebook e Instagram, y el evento Agregar al carrito probado.

## Qué no trae (a propósito o todavía)

- Plantillas de cuentas de clientes clásicas: el tema asume las cuentas nuevas de Shopify (las que vienen activadas en tiendas nuevas).
- Un solo idioma (español).
- Las fuentes se cargan de Google Fonts. Para la mejor velocidad, subir los `.woff2` a Archivos y cambiar el snippet `tc-vars`.

## Actualizar el tema

El código fuente está en `tema-convertible/`. Después de un cambio: `cd tools && npm install && npm run validar && npm run probar && npm run zip`. `npm run vista` genera una vista previa local con capturas (necesita Chromium).
