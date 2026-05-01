import { useEffect, useRef, useState } from "react";

export function useAsync(funcionAsync, deps = []) {
  const [estado, setEstado] = useState({
    status: "idle",
    data: null,
    error: null,
  });

  const idSolicitudRef = useRef(0);
  // La función es una que devuelve una promesa que 
  // resuelve con los datos. Se pasa por referencia para
  // evitar que se vuelva a ejecutar al cambiar el estado.
  const funcionAsyncRef = useRef(funcionAsync);

  funcionAsyncRef.current = funcionAsync;

  useEffect(() => {
    // Incrementamos el id de solicitud para que, si el componente
    // se desmonta y se vuelve a montar rápido, las respuestas
    // anteriores no se apliquen (evita race conditions).
    const idSolicitud = ++idSolicitudRef.current;
    const controlador = new AbortController();

    setEstado({ status: "loading", data: null, error: null });

    Promise.resolve()
      .then(() => funcionAsyncRef.current({ signal: controlador.signal }))
      .then((datos) => {
        // Si el id de la solicitud ya no coincide con el ref actual,
        // significa que se inició otra solicitud más nueva y esta
        // respuesta ya no es relevante. La descartamos.
        if (idSolicitud !== idSolicitudRef.current) return;
        setEstado({ status: "success", data: datos, error: null });
      })
      .catch((error) => {
        if (controlador.signal.aborted) return;
        if (idSolicitud !== idSolicitudRef.current) return;
        setEstado({ status: "error", data: null, error });
      });

    return () => controlador.abort();
  }, deps);

  return estado;
}
