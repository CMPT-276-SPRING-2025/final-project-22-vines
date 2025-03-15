import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Upload from './pages/Upload'
import About from './pages/About';

// Only modify to include more pages
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Upload" element={<Upload />} />
        <Route path="/about" element={<About />} />  {/* Add About route */}
      </Routes>
    </Router>
  )
}

export default App
