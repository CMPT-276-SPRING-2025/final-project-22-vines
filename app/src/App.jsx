import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Upload from './pages/Upload'
import About from './pages/About';
import FAQ from './pages/FAQ';

// Only modify to include more pages
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Upload" element={<Upload />} />
        <Route path="/About" element={<About />} />  {/* Add About route */}
        <Route path="/FAQ" element={<FAQ />} /> {/* Add FAQ route */}
      </Routes>
    </Router>
  )
}

export default App
