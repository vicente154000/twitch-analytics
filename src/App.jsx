import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Inicio from "./pages/Home.jsx";
import ListaAnime from "./pages/Explorar.jsx";
import DetalleAnime from "./pages/Detalles.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="/anime" element={<ListaAnime />} />
        <Route path="/anime/:id" element={<DetalleAnime />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
