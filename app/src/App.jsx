import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Upload from './pages/Upload'
import About from './pages/About';
import FAQ from './pages/FAQ';
import Footer from './components/Footer';

// Only modify to include more pages
function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Upload" element={<Upload />} />
          <Route path="/About" element={<About />} />
          <Route path="/FAQ" element={<FAQ />} />
        </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App;