## Componentes

### Reglas
- Si el componente debe de hacer una peticion al backend, asegure de crear la funcion para hacer la llamada particular al backend y desde el componente llamarla, nunca incluya codigo de peticion fuera de la carpeta `fetch/`.
- Si se tiene un formato que se ingresa por parte del usuario (login, creacion mesa, modificacion usuario, etc), esta informacion del formato se debe guardar dentro de un objeto `useState()`. Un ejemplo:
```javascript
const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirmation: "",
})

//Actualizar email

function handleChange(e) {
    const { name, value } = e.target;
    setFormData({
        ...formData,
        [name]: value,
    });
}

//Element html que lo trigea
return (
    <input type="email" name="email" className="mb-2" placeholder="Email" value={registerInput.email} onChange={handleChange} />
)
```
Asi cada vez que el input cambia (onChange), la funcion `handleEmailInput` corre y actualiza el email. El sintaxis `...registerInput` quiere decir "todo lo que ya esta" y luego se actualizan los campos que se desean cambair (email: string).

### Estructura general
- function *Use*Name(): El nombrado de la funcion de React se deberia hacer con este estilo: el nombre de su esencia digamos, el nombre de la pagina podria ser o su uso, enseguida iria su utilidad, esto podria ser una pagina (Page), un componente de una pagina (Component), etc. Lo importante es seguir un patron.
- Seccion 1: Variables, variables de estado (useState) y variables de otros contextos.
- Seccion 2: Las funciones de logica del componente.
- Seccion 3: Uso de la funcion React `useEffect()`, este se posiciona al final porque muchas veces requiere acceso a varias funciones que se declararon en la seccion 2, esto es para evitar tener revueltos funciones de logica del componente y los funciones reactivos del estado (useEffect).
- Seccion 4: Condicionales if's que hacen return antes del `return ()` principal, esto es para evitar que el `return ()` use datos que no son listos para usar y asi se puede tener:
```javascript
if(!ready){
    return;
}

return (
    <html>{ object.information }<html/>
)
```
Asi en este caso, `ready` tiene la informacion (`true` o `false`) de cuando `object` ya esta disponible para usar despues de una operacion. Esto es muy importante porque si en el `render ()` se intenta acceder a un objeto o algo que no esta listo, puede romper todo el sitio y dejar una pagina en blanco. Si se posiciona un if como el del ejemplo antes de un `useEffect()`, puede generar problemas y React te avisa.
- `return ()`: La funcion que genera el HTML que el usuario visualiza. 