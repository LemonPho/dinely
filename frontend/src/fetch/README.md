## Fetch

### Reglas
- Los fetch no deberian comunicarse con componentes u otras funciones, solamente con la estructura `response`.

### Estructura general de las funciones fetch

- `response`: Es el objeto que se regresa a la funcion que lo invoca, sirve para regresar la informacion obtenida del backend y junto la informacion del estatus, que si habia error y el codigo que regreso el backend.
- try, catch: Las peticiones que se hacen deberian de estar dentro de un bloque try {} catch {}, la idea es que si el codigo rompe feo, lo puede grabar y lo regresa mediante `response` y asi se puede despliegar un error.
- `fetch()`: Esta funcion es la que emite la peticion al backend, cuando se hace una a por ejemplo `/api/user/get-current-user/`, debera de existir ese url en `backend/urls.py`, dentro del `urlpatterns`. Si no esta el servidor regresa un estado 404. Despues del url en `fetch()`, se le incluye un objeto de informacion adicional, en las peticiones `GET` no se necesita incluir nada, pero en las peticiones `POST` se tiene que incluir el `csrftoken` dentro de `headers`. Busca un fetch que usa el metodo `POST` como ejemplo a seguir.
-  apiResponse.json(): Esta funcion lee la informacion que particularmente se solicito y lo convierte en una variable de javascript que se puede usar. Un ejemplo puede ser que al solicitar el usuario actualmente en sesion, te regrese el backend el correo, si es admin, si es empleado, de alli el .json() te regresaria un objeto con el email, si es admin y si es empleado:
```json
objeto: {
    email: "email@gmail.com",
    admin: false,
    employee: false
}
```
. Es muy importante de tener el operador `await` en su uso, si no, no espera al que la operacion .json() termine y te regresa una variable vacia.