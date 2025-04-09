import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Upload from './pages/Upload';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Footer from './components/Footer';

/**
 * App Component
 * 
 * This is the main application component that sets up routing between different pages
 * and maintains a consistent layout with a footer across all routes.
 */

function App() {
  return (
    <Router
      future={{
         // Enable React Router v7 features:
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      {/* Main container with flex layout to ensure footer stays at bottom */}
      <div className="flex flex-col min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Upload" element={<Upload />} />
        <Route path="/About" element={<About />} />
        <Route path="/FAQ" element={<FAQ />} />
        <Route path="/Contact" element={<Contact />} />
      </Routes>
      <Footer />
      </div>
    </Router>
  );
}

export default App;