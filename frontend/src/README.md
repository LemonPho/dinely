## Estructura general

### Application-context
Cualquier contexto que se necesita al nivel aplicacion (sesion de usuario, mensajes, etc), se agrega en esa carpeta y se pone en el archivo `App.jsx`. Dentro de la carpeta de `application-context/` hay un readme que explica mas a fondo de como funcionan.

### Components
Cualquier componente en la cual su finalidad es proporcionar HTML al usuario, esto puede ser la página de login, crear cuenta, hasta puede ser un componente de utilidad (plantillas de ingreso de texto, plantillas de cartas, etc. estas se encuentran en `components/util-components`). Es la parte en donde todo lo visual se hace

### Fetch
Son los archivos que contienen las funciones necesarias para hacer peticiones al backend. Ejemplos son: solicitar informacion del usuario ingresado, hacer login, crear cuenta, crear mesa, etc. Basicamente cualquier operacion que requiere de la base de datos. Es recomendable que se dividan los funciones en archivos de su contexto, por ejemplo operacioens relacionados a mesa: `fetch/table.jsx`, usuario: `fetch/user.jsx`.

### Static
Todos los archivos `.css` que se usa, por cada plantilla de una "estructura" que se hace, se recomienda hacer un archivo `.css` por cada uno. Un ejemplo es el `card.css` que trae todas las clases necesarias para hacer un card.

### Regla general
Evitar que los archivos se pasen de 400 lineas de codigo. Si se exceden inten separarlo en varios archivos, esto aplica principalmente para los contextos y componentes. En los fetch y static no importa. Un ejemplo podria ser, en vez de tener toda la funcionalidad para manejar mesas en un solo archivo, se puede separa en varios archivos y cada uno para un funcionalidad particular como: crear, modificar y eliminar, porque seguramente todo en uno excederia ese limite. Lo que llegar a complicar con eso es que las variables muchas veces se tienen que "compartir" entre los archivos, entonces se podria adicionalmente crear un contexto para compartir esa informacion entre todos los archivos necesarios.
