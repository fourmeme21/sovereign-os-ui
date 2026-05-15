import { Routes, Route } from "react-router-dom";
import App from "./App";
import JuniorLayout from "./junior/components/JuniorLayout";
import KararGecmisi from "./junior/screens/KararGecmisi";
import ProjHafizasi from "./junior/screens/ProjHafizasi";
import Baglan from "./junior/screens/Baglan";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/junior" element={<JuniorLayout />}>
        <Route index       element={<KararGecmisi />} />
        <Route path="gecmis" element={<KararGecmisi />} />
        <Route path="hafiza" element={<ProjHafizasi />} />
        <Route path="baglan" element={<Baglan />} />
      </Route>
    </Routes>
  );
}
