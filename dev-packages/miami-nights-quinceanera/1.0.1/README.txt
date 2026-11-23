MIAMI NIGHTS · QUINCEAÑERA — 1.0.1
Contrato: template1.md, edición 2026-11-23 (API de referencia 568c151).
Paquete premium de nivel 1, sin JavaScript. Autor: Quinvite.

DISEÑO
Azul noche, neón cian/rosado, caligrafía dorada, títulos condensados Art Déco,
portada fotográfica en arco con anillos neón, skyline y palmeras originales. Tres paletas:
Neón Miami, Azul eléctrico y Atardecer dorado. Textos ES/EN.

PORTADA DINÁMICA
cover.settings.image = null. q-cover-photo utiliza la fotografía que cargue
la organizadora y sus ajustes de enfoque. Sin fotografía, el motor muestra
las iniciales. La foto de demostración NO está incluida en assets ni fijada
en el HTML. Los datos de nombres, invitados, cupos y fechas son dinámicos.
Las fotos de galería, los lugares y el audio pertenecen al evento.

12 SECCIONES
cover, itinerary, locations, dress_code, padrinos, gallery, rsvp, comments,
tables, suggested_music, music, closing.

MÓDULOS PREMIUM
q-comments: cards, máximo 8; muro nativo de mensajes.
q-tables: card; mesa del invitado, con privacidad resuelta por el motor.
q-suggested-music: list; búsqueda, sugerencias y votos nativos.
q-music: bar; reproductor flotante, sin comportamientos en sus ancestros.
q-rsvp: card; incluye las opciones de menú que configure el sistema.
Cada bloque aparece vacío en el HTML. El motor controla permisos, planes,
validación, envío, moderación, estados vacíos y disponibilidad.

CAMBIOS DE LA 1.0.1
- Fecha de portada con día dorado grande, mes espaciado y filetes (selectores
  estructurales: el motor no expone clases inv-date__*).
- Se quita el selector de idioma propio de la portada (el motor ya dibuja uno).
- Un solo marco por bloque (el panel nativo); se eliminan las cajas propias.
- Botón de confirmar con borde y halo neón en el botón; sin la píldora de fecha
  límite duplicada.
- Fondo de portada con el skyline, palmeras SVG (palms.svg) y anillos neón
  alrededor de la foto; funciona con una foto normal o una imagen ya compuesta.
- Dress code: Bebas dorada, siluetas SVG de vestido y traje (decorativas).
- Padrinos con título en caligrafía y nombres en serif; itinerario con línea
  vertical neón y puntos cian.
- Zonas editables: foto de portada (con enfoque), textos de cada sección,
  paleta y colores dorado/neón.

ZONAS EDITABLES
Solo la portada admite imagen (setting image). Ubicaciones, dress code y cierre
no tienen zona de imagen en el motor; los lugares muestran las fotos del evento.

ADAPTACIONES RESPECTO A LA MAQUETA
La maqueta presenta tres columnas que representan el recorrido vertical.
Esta plantilla es vertical en móvil y usa dos columnas solo en portada de
escritorio; las secciones conservan un ancho legible.
No se fija una foto de salón, pues el catálogo no ofrece una variable/bloque
para extraer esa imagen. q-locations muestra los datos y mapas del evento.
Las siluetas de vestido y traje son decorativas y fijas (no dependen del tipo
de dress code elegido).
El reproductor de fondo sigue siendo flotante; la lista de sugerencias es
una sección independiente. No se incluye audio ni marcas de terceros.
