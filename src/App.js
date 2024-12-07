import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import StartScreen from "./StartScreen";
import Game from "./Game";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartScreen />} />
        <Route path="/:gameCode" element={<Game />} />
      </Routes>
    </Router>
  );
}

export default App;
