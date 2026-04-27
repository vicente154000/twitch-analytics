import { useEffect, useRef, useState } from "react";

export function useAsync(factory, deps = []) {
  const [state, setState] = useState({
    status: "idle",
    data: null,
    error: null,
  });

  const requestIdRef = useRef(0);
  const factoryRef = useRef(factory);

  // Mantener la última versión de la función sin disparar el efecto
  factoryRef.current = factory;

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    const controller = new AbortController();

    setState({ status: "loading", data: null, error: null });

    Promise.resolve()
      .then(() => factoryRef.current({ signal: controller.signal }))
      .then((data) => {
        if (requestId !== requestIdRef.current) return;
        setState({ status: "success", data, error: null });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        if (requestId !== requestIdRef.current) return;
        setState({ status: "error", data: null, error });
      });

    return () => controller.abort();
  }, deps);

  return state;
}

