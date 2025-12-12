import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Research from './components/Research';
import Reads from './components/Reads';
import Contact from './components/Contact';
import CustomCursor from './components/CustomCursor';
import bgVideo from './assets/backg_video.mp4';

function App() {
  return (
    <div className="App" style={{ position: 'relative' }}>
      {/* Custom Cursor */}
      <CustomCursor />
      {/* Full-screen background video */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        overflow: 'hidden'
      }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            minWidth: '100%',
            minHeight: '100%',
            width: 'auto',
            height: 'auto',
            transform: 'translate(-50%, -50%)',
            objectFit: 'cover',
            opacity: 0.6
          }}
        >
          <source src={bgVideo} type="video/mp4" />
        </video>
        {/* Dark overlay for better text readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.5) 100%)'
        }} />
      </div>

      <Navbar />
      <Hero />

      {/* Professional sections with gradient transition */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 10%, rgba(0, 0, 0, 0.9) 20%, rgba(0, 0, 0, 0.95) 100%)'
      }}>
        <About />
        <Experience />
        <Projects />
        <Research />
        <Reads />
        <Contact />
      </div>
    </div>
  );
}

export default App;
