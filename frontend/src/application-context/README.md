## Context

### Uso
Se usa un contexto cuando requieres informacion en varios lados del sitio web, esto puede ser por ejemplo, el usuario en sesion, la capacidad de generar mensajes de alertas desde cualquier lado, etc. 

### Estructura general
- export ... = createContext(): Esta linea se pone para initializar el objeto del contexto, la nombre del objeto deberia ir como: el contexto que deseas compartir, y enseguida *Context*. Un ejemplo es el `contextoUsuario`, queremos compartir el usuario y le sigue *Context*.
- export function ContextProvider({ children }): En este viene la logica que requiere el contexto para poder compartir la informacion, su nombre deberia de ser el nombre que se puso al usar el `createContext()` y enseguida *Provider*. La parte mas importante es la funcion `return ()`, donde viene `value`, lo que se guarde en value es lo que se desea compartir, esto puede ser funciones o variables de estado *(useState)*. Y dentro del elemento va `{children}` que viene siendo los hijos que se encuentran los componentes que le siguen, basicamente las cosas que se ven actualmente en la pagina.
- export function use*nombre*Context: La funcion que se llame dentro de componentes u otros contextos para utilizar la informacion porporcionada en `value`.
```javascript
const { variable, funcion } = useContextoNombre();
```
De alli ya tienes acceso a las variables o funciones que usas del contexto. 

### Donde se posicionan en el proyecto?
Revisa el `main.jsx`, todos los contextos que se usan al nivel de aplicacion se posicionan alli. Pero por ejemplo, imaginemos tenemos el area del sitio web general para manejar las mesas, entonces se podria hacer un contexto `manageTablesContext`, pero ese no se necesitaria en toda la aplicacion, ya que una sola seccion del portal de admins maneja las mesas. Entonces se ubicaria arriba de la seccion para manejar las mesas, esto podria ser:
```javascript
<ContextoManejaMesas>
    <ManejaMesas />
<ContextoManejaMesas/>

```
En este caso el `{children}` de lo cual se hablo anteriormente seria el componente `ManejaMesas` y sus hijos, y unicamente esos podrian usar el `ContextoManejaMesas`. Esta informacion se colocaria en algun `return ()` de algun componente de `React`.