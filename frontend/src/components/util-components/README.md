## Util Components

### Uso
Los componentes en esta carpeta son componentes reutilizables que se pueden usar en cualquier parte de la aplicación. Estos componentes proporcionan funcionalidades comunes como inputs, modales, etc. No contienen lógica de negocio específica, solo funcionalidades visuales y de interacción.

### Reglas
- Todos los componentes deben ser reutilizables y no depender de lógica de negocio específica
- Los componentes de input (`TextInput` y `Textarea`) manejan su propia sincronización con el valor proporcionado mediante `value` y `setValue`
- Los componentes que requieren contexto (como `Modal` y `Dropdown`) deben estar dentro del contexto correspondiente en el árbol de componentes
- Si un componente necesita hacer peticiones al backend, esa lógica debe estar en la carpeta `fetch/` y ser llamada desde el componente que usa el util component

### Estructura general
- Sigue el mismo patron que los componentes normales.
