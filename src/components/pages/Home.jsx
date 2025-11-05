import React from 'react'

// Import components
import Navbar from '../sections/Navbar'
import Header from '../sections/Header'
import About from '../sections/About'
import Skills from '../sections/Skills'
import Projects from '../sections/Projects'
import Contact from '../sections/Contact'

const Home = () => {
  return (
    <>
      <Navbar />
      <Header />
      <About />
      <Skills />
      <Projects />
      <Contact />
    </>
  )
}

export default Home

