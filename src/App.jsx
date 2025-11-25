import React from 'react'
import './styles/index.scss'

// Import components
import Navbar from './components/sections/Navbar'
import Header from './components/sections/Header'
import About from './components/sections/About'
import Skills from './components/sections/Skills'
import Projects from './components/sections/Projects'
import Recommendations from './components/sections/Recommendations'
import Contact from './components/sections/Contact'

export default function App() {

  return (
    <main>
      <Navbar />
      <Header />
      <About />
      <Skills />
      <Projects />
      <Recommendations />
      <Contact />
    </main>
  )
}