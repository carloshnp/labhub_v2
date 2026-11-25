import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { EquipmentProvider } from "./contexts/EquipmentContext";
import "./index.css";

function App() {
  return (
    <EquipmentProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </EquipmentProvider>
  );
}

export default App;
