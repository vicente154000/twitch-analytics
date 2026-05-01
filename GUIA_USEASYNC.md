# 📘 Guía Completa: useAsync y AbortController

## 1. ¿Qué es useAsync?

Es un **hook personalizado de React** que **gestiona operaciones asincrónicas** (llamadas a APIs). Automatiza toda la lógica de:
- Saber si está cargando
- Si fue exitoso
- Si falló
- Evitar bugs de race conditions
- Limpiar solicitudes cuando el componente se desmonta

---

## 2. El estado que devuelve

```javascript
{
  status: "idle" | "loading" | "success" | "error",
  data: null,      // Los datos si fue exitoso
  error: null      // El error si falló
}
```

---

## 3. Parámetros

```javascript
useAsync(funcionAsync, deps)
```

| Parámetro | Qué es | Ejemplo |
|-----------|--------|---------|
| `funcionAsync` | Función que devuelve promesa | `({ signal }) => fetch(url, { signal }).then(r => r.json())` |
| `deps` | Dependencias (como useEffect) | `[consulta, pagina]` - se re-ejecuta si cambian |

---

## 4. Cambios que hicimos

### Renombramos `fabrica` por `funcionAsync`
- **Antes:** `function useAsync(fabrica, deps = [])`
- **Después:** `function useAsync(funcionAsync, deps = [])`
- **Por qué:** `funcionAsync` es más descriptivo y claro en español

---

## 5. ¿Qué es `signal`?

Es una herramienta para **detener/cancelar solicitudes HTTP**. Viene del objeto `AbortController`.

### Partes clave:

```javascript
const controlador = new AbortController();

// El controlador tiene:
controlador.signal    // Para MONITOREAR si fue cancelado
controlador.abort()   // Para CANCELAR la operación
```

---

## 6. Cómo funciona el vínculo signal ↔ controlador

```
AbortController
    ↓
    ├─ .signal → Objeto que monitorea cancelación
    │   ├─ .aborted (true/false)
    │   └─ Dispara evento 'abort' cuando se cancela
    │
    └─ .abort() → Método que cancela todo
        ├─ Cambia signal.aborted a true
        └─ Dispara evento en signal
```

**Es como un interruptor y una bombilla del mismo circuito eléctrico.**

---

## 7. El flujo en useAsync

```javascript
useEffect(() => {
  // 1. Crear controlador
  const controlador = new AbortController();
  
  // 2. Cambiar estado a "loading"
  setEstado({ status: "loading", data: null, error: null });
  
  // 3. Ejecutar la función asincrónica pasando signal
  Promise.resolve()
    .then(() => funcionAsyncRef.current({ signal: controlador.signal }))
    // fetch recibe signal y lo monitorea
    
    .then((datos) => {
      // Si fue éxito, actualizar estado
      setEstado({ status: "success", data: datos, error: null });
    })
    .catch((error) => {
      // Si fue abortado (componente se desmontó), ignorar
      if (controlador.signal.aborted) return;
      
      // Si otro error, guardar error
      setEstado({ status: "error", data: null, error });
    });
  
  // 4. Al desmontar o cambiar deps: CANCELAR la solicitud
  return () => {
    controlador.abort();
  };
}, deps);
```

---

## 8. Flujo en tus componentes

### Home.jsx
```javascript
const top = useAsync(
  ({ signal }) => obtenerTopAnime({ limit: 6, signal }),
  ["top"]  // Se ejecuta una sola vez (array vacío = solo al montar)
);
```

### Explorar.jsx
```javascript
const resultado = useAsync(
  ({ signal }) =>
    buscarAnime({
      q: consulta,
      page: pagina,
      signal,
    }),
  [consulta, pagina],  // Se re-ejecuta si cambian
);
```

### Detalles.jsx
```javascript
const resultado = useAsync(
  async ({ signal: senal }) => {
    // 3 llamadas en paralelo, todas con signal
    const [detalle, personajes, imagenes] = await Promise.all([
      obtenerAnimePorId({ id, senal }),
      obtenerPersonajesAnime({ id, senal }).catch(() => null),
      obtenerImagenesAnime({ id, senal }).catch(() => null),
    ]);
    return { detail: detalle, chars: personajes, pics: imagenes };
  },
  [id],
);
```

---

## 9. El servicio (jikan.js)

```javascript
async function obtenerJikan(ruta, { params: parametros, signal: senal } = {}) {
  const url = construirUrl(ruta, parametros);
  
  // IMPORTANTE: signal se pasa a fetch
  const respuesta = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal: senal,  // ← Aquí fetch monitorea cancelación
  });

  if (!respuesta.ok) {
    throw new Error(`Error ${respuesta.status}`);
  }

  return respuesta.json();
}

export async function obtenerTopAnime({ page: pagina = 1, limit: limite = 12, signal: senal } = {}) {
  return obtenerJikan("/top/anime", { 
    params: { page: pagina, limit: limite }, 
    signal: senal 
  });
}
```

---

## 10. Timeline: Qué pasa si el usuario navega rápido

```
0ms    → fetch inicia solicitud
        → signal se guarda en fetch
        ├─ signal.aborted = false

50ms   → Usuario hace click en otro link

50ms   → Component se desmonta
        → return () => controlador.abort() se ejecuta
        ├─ signal.aborted = true
        ├─ Dispara evento 'abort'
        └─ fetch recibe evento

51ms   → fetch cancela solicitud HTTP

100ms  → Respuesta intenta llegar del servidor
        → fetch ya fue cancelado, ignorado
        → .catch() detecta signal.aborted = true
        → No actualiza el estado ✅
```

---

## 11. Problemas que evita

| Problema | Sin Signal | Con Signal |
|----------|-----------|-----------|
| Usuario navega rápido | ❌ Error "Can't update unmounted component" | ✅ Se cancela automáticamente |
| Búsqueda: escribir rápido | ❌ 10 solicitudes simultáneas | ✅ Solo la última se ejecuta |
| Cambiar página | ❌ Datos mezclados de 2 páginas | ✅ Solicitud anterior se cancela |
| Component se desmonta | ❌ Memory leak | ✅ Limpio y seguro |

---

## 12. Cómo se conectan signal y fetch

```javascript
// signal SABE que fue abortado porque:

// 1. Comparte referencia
const signal = controlador.signal;
// signal es el MISMO objeto que monitoreamos

// 2. AbortController cambia propiedades internas
controlador.abort();
// → signal._aborted = true (interno)
// → Dispara evento 'abort' en signal

// 3. fetch escucha ese evento
fetch(url, { signal })
// → fetch registra: signal.addEventListener('abort', ...)
// → Cuando abort() se ejecuta, fetch lo recibe
// → Cancela la solicitud HTTP
```

---

## 13. Verificación manual

```javascript
const controlador = new AbortController();

// Estado inicial
console.log(controlador.signal.aborted); // false

// Registra listener para ver cuándo pasa
controlador.signal.addEventListener('abort', () => {
  console.log('¡Abortado! signal.aborted es:', controlador.signal.aborted);
});

// Cancela
controlador.abort();

console.log(controlador.signal.aborted); // true
```

---

## 14. Race Condition: La razón del `idSolicitud`

```javascript
// Sin idSolicitud:
useAsync(() => fetch('/api/page/1'))  // Solicitud 1
useAsync(() => fetch('/api/page/2'))  // Solicitud 2

// Si Solicitud 2 llega antes que Solicitud 1:
// setState(page2_data)
// setState(page1_data)  // ❌ Mostrando página 1 cuando pidió página 2!
```

**Con idSolicitud:**
```javascript
idSolicitud = 1; fetch('/api/page/1')
idSolicitud = 2; fetch('/api/page/2')

// Cuando llega page 1:
// if (1 !== 2) return;  // ✅ Ignorada

// Cuando llega page 2:
// if (2 === 2) setState(...) // ✅ Actualizada
```

---

## 15. Resumen de memoria

### El flujo mágico:
1. **Component monta** → useAsync crea AbortController
2. **Llama funcionAsync con signal** → fetch recibe signal
3. **Pasa tiempo** → fetch espera respuesta
4. **Usuario navega** → component se desmonta
5. **return cleanup function** → controlador.abort()
6. **signal cambia a abortado** → fetch cancela
7. **catch detecta signal.aborted** → no actualiza state
8. **✅ Sin errores, sin memory leaks**

### Piensa en AbortController como:
- **Interruptor:** `controlador.abort()`
- **Bombilla monitoreada:** `fetch(..., { signal })`
- **Circuito:** La referencia compartida entre ambos

---

## 16. En tu proyecto: PUNTOS CLAVE

✅ **SIEMPRE pasar `signal` a fetch**
```javascript
fetch(url, { signal })  // Correcto
fetch(url)              // ❌ No se puede cancelar
```

✅ **SIEMPRE pasar `signal` a través de toda la cadena**
```javascript
// Component → useAsync → jikan.js → fetch
const resultado = useAsync(
  ({ signal }) => obtenerTopAnime({ signal }),  // ✓ Pasado
  deps
);
```

✅ **En servicios, recibir y pasar `signal`**
```javascript
export async function obtenerTopAnime({ signal } = {}) {
  return obtenerJikan("/top/anime", { signal });
}
```

✅ **En useAsync, ignorar si se canceló**
```javascript
.catch((error) => {
  if (controlador.signal.aborted) return;  // ✓ Importante
  setEstado({ status: "error", data: null, error });
});
```

---

## 17. Referencias en el proyecto

- Hook: [src/hooks/useAsync.js](src/hooks/useAsync.js)
- Servicios: [src/services/jikan.js](src/services/jikan.js)
- Uso en Home: [src/pages/Home.jsx](src/pages/Home.jsx)
- Uso en Explorar: [src/pages/Explorar.jsx](src/pages/Explorar.jsx)
- Uso en Detalles: [src/pages/Detalles.jsx](src/pages/Detalles.jsx)

---

## 18. Fórmula rápida para recordar

```
useAsync + signal = No race conditions + No memory leaks + Código limpio
```

**Sin entender esto:** Código frágil, bugs aleatorios, comportamiento extraño  
**Entendiéndolo:** Control total, confiable, profesional

---

**¡Guarda este archivo y úsalo de referencia!**
