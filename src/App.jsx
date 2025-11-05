import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/index.scss';

import Home from './components/pages/Home';
import AllProjects from './components/pages/AllProjects';

export default function App() {
  return (
    <Router>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<AllProjects />} />
        </Routes>
      </main>
    </Router>
  );
}
