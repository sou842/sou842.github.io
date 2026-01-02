import React, { useEffect, useState } from 'react'

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleMenu = () => setMenuOpen((prev) => !prev)
  const handleLinkClick = () => setMenuOpen(false)

  return (
    <nav className={`${menuOpen ? 'nav-open' : ''} ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-brand">
        <a href="#header" className="text-logo" aria-label="Go to home">
          <span className="mark">S</span>
          <span className="dot">.</span>
          <span className="name">samanta</span>
        </a>
      </div>

      <div className="menu-toggle" onClick={toggleMenu}>
        <div className="hamburger">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <ul className={menuOpen ? 'active' : ''}>
        <li><a href="#header" onClick={handleLinkClick}>HOME</a></li>
        <li><a href="#about" onClick={handleLinkClick}>ABOUT</a></li>
        <li><a href="#skills" onClick={handleLinkClick}>SKILLS</a></li>
        <li><a href="#projects" onClick={handleLinkClick}>PROJECTS</a></li>
        <li><a href="#contact" onClick={handleLinkClick}>CONTACT</a></li>
      </ul>
    </nav>
  )
}

export default Navbar


