//App.jsx
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import TemplateEditor from './Modules/Template_editer';

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes WITHOUT navbar */}
        <Route path="/" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />

        {/* Routes WITH navbar */}
        <Route element={<MainLayout />}>
          <Route path="/template_editor" element={<TemplateEditor />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;