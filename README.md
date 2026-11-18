# Blog personal de Diogo Flores

Bitácora de Diogo Amir Flores Vásquez sobre su familia, sus estudios y sus viajes. El sitio utiliza HTML, CSS y JavaScript. Incluye paneles fotográficos en la portada, un álbum personal y carruseles en la entrada de viajes. Las fotos están en formato WebP. Las fuentes y licencias de las imágenes de lugares figuran en `public/creditos.html`.

## Verlo en tu computadora

Abre `public/index.html` en tu navegador. Si tienes Python 3, también puedes ejecutar `python -m http.server 8000 --directory public` desde la carpeta del proyecto y visitar [localhost:8000](http://localhost:8000).

## Subir a GitHub y desplegar con Vercel

1. Descomprime el ZIP y crea un repositorio en GitHub.
2. Sube el contenido de la carpeta descomprimida. En la raíz del repositorio deben quedar `vercel.json`, `README.md` y la carpeta `public/`.
3. En Vercel, abre **Add New → Project**, importa el repositorio y selecciona **Deploy**. La configuración incluida publica `public/` sin comandos de compilación ni variables de entorno.

[Guía oficial de Vercel para GitHub](https://vercel.com/docs/git/vercel-for-github)

## Editar el blog

- Cambia la portada, las tarjetas y el álbum en `public/index.html`.
- Edita las entradas en `public/bitacora/`. Para agregar una, duplica una página de esa carpeta, actualiza su título, descripción y contenido, y agrega una tarjeta en la portada que apunte al archivo nuevo.
- Guarda las fotos en `public/assets/`. Al añadirlas al álbum, usa una descripción breve en `alt` y otra en `data-caption` para la vista ampliada.
- Los colores y fuentes están al inicio de `public/assets/styles.css`.
