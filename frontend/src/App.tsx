import { BrowserRouter, Route, Routes } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Skills from "./pages/Skills";
import Resources from "./pages/Resources";
import CareerPage from "./pages/Career";
import SkillGap from "./pages/SkillGap";
import Opportunities from "./pages/Opportunities";
import Chatbot from "./components/Chatbot";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/career" element={<CareerPage />} />
        <Route path="/skill-gap" element={<SkillGap />} />
        <Route path="/opportunities" element={<Opportunities />} />
      </Routes>

      <Chatbot />
    </BrowserRouter>
  );
}

export default App;