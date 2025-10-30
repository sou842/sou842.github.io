import React, { useState, useEffect, useRef } from 'react'
import { roles } from '../../static'

const Header = () => {
  const [displayText, setDisplayText] = useState('')
  const [roleIndex, setRoleIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const typingRef = useRef(null)


  useEffect(() => {
    const current = roles[roleIndex % roles.length]
    const speed = isDeleting ? 30 : 80
    const timeout = setTimeout(() => {
      const nextLength = isDeleting ? displayText.length - 1 : displayText.length + 1
      const nextText = current.slice(0, Math.max(0, nextLength))
      setDisplayText(nextText)

      if (!isDeleting && nextText === current) {
        setTimeout(() => setIsDeleting(true), 900)
      } else if (isDeleting && nextText === '') {
        setIsDeleting(false)
        setRoleIndex((prev) => (prev + 1) % roles.length)
      }
    }, speed)
    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, roleIndex])

  useEffect(() => {
    // Restart typing on mount
    setDisplayText('')
    setRoleIndex(0)
    setIsDeleting(false)
  }, [])

  return (
    <header id="header">
      <div className="container">

        <div className="header-content hero">
          <div className="hero-left">
            <div className="header-text">
              <p className="greeting">Hello, I'm</p>
              <h1 className="name">Sourav <span>Samanta</span></h1>
              <p className="title">{displayText}<span className="caret">|</span></p>
              <p className="summary">I design and build fast, accessible web experiences with modern stacks.
              </p>
              <div className="badge-list">
                <span>React</span>
                <span>Next.js</span>
                <span>Node.js</span>
                <span>TypeScript</span>
              </div>
            </div>
          </div>
          <div className="hero-right">
            <div className="iso-scene">
              <div className="iso-platform"></div>
              <div className="iso-cube cube-a"></div>
              <div className="iso-cube cube-b"></div>
              <div className="iso-brick brick-a"></div>
              <div className="iso-sphere sphere-a"></div>
              <div className="iso-sphere sphere-b"></div>
            </div>
          </div>
          <div className="scroll-cue">
            <div className="mouse"><div className="wheel"></div></div>
            <span>Scroll</span>
          </div>
        </div>

        <div className="header-social">
          <a href="https://github.com/sou842" target="_blank" rel="noopener noreferrer" className="social-link">
            <i className="fab fa-github"></i>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
            <i className="fab fa-linkedin"></i>
          </a>
        </div>
      </div>
    </header>
  )
}

export default Header
