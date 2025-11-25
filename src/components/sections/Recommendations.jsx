import React, { useState, useEffect, useRef } from 'react'
import { recommendations } from '../../static'

const Recommendations = () => {
  const [visibleCards, setVisibleCards] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const sliderRef = useRef(null)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardId = parseInt(entry.target.dataset.cardId)
            setVisibleCards(prev => [...new Set([...prev, cardId])])
          }
        })
      },
      { threshold: 0.1 }
    )

    const cards = document.querySelectorAll('.recommendation-card')
    cards.forEach(card => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % recommendations.length)
  }

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + recommendations.length) % recommendations.length)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    
    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }

    touchStartX.current = 0
    touchEndX.current = 0
  }

  return (
    <section id="recommendations" className="recommendations-section">
      <div className="container">
        <div className="section-header">
          <h2 className="sub-title">Recommendations</h2>
          <p className="section-description">
            What colleagues and peers say about working with me
          </p>
        </div>

        {isMobile ? (
          <div className="recommendations-slider">
            <div 
              className="slider-container"
              ref={sliderRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div 
                className="slider-track"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {recommendations.map((rec, index) => (
                  <article 
                    key={rec.id} 
                    className="recommendation-card slider-card visible"
                    data-card-id={rec.id}
                  >
                    <div className="recommendation-header">
                      <div className="avatar-container">
                        <div 
                          className="avatar" 
                          style={{ backgroundColor: rec.color }}
                          aria-hidden="true"
                        >
                          {rec.avatar}
                        </div>
                        <div className="linkedin-badge">
                          <i className="fab fa-linkedin" aria-hidden="true"></i>
                        </div>
                      </div>
                      <div className="recommender-info">
                        <h3 className="recommender-name">{rec.name}</h3>
                        <p className="recommender-title">{rec.title}</p>
                        <div className="recommendation-meta">
                          <span className="relationship">{rec.relationship}</span>
                          <span className="date">{rec.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="recommendation-content">
                      <div className="quote-icon" aria-hidden="true">
                        <i className="fas fa-quote-left"></i>
                      </div>
                      <blockquote className="recommendation-text">
                        {rec.content}
                      </blockquote>
                    </div>

                    <div className="recommendation-footer">
                      <div className="platform-info">
                        <i className="fab fa-linkedin" aria-hidden="true"></i>
                        <span>LinkedIn Recommendation</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="slider-controls">
              <button 
                className="slider-btn prev-btn" 
                onClick={prevSlide}
                aria-label="Previous recommendation"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              <div className="slider-dots">
                {recommendations.map((_, index) => (
                  <button
                    key={index}
                    className={`slider-dot ${currentSlide === index ? 'active' : ''}`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to recommendation ${index + 1}`}
                  />
                ))}
              </div>
              
              <button 
                className="slider-btn next-btn" 
                onClick={nextSlide}
                aria-label="Next recommendation"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        ) : (
          <div className="recommendations-grid">
            {recommendations?.map((rec, index) => (
              <article 
                key={rec.id} 
                className={`recommendation-card ${visibleCards.includes(rec.id) ? 'visible' : ''}`}
                data-card-id={rec.id}
                style={{ '--delay': `${index * 0.2}s` }}
              >
                <div className="recommendation-header">
                  <div className="avatar-container">
                    <div 
                      className="avatar" 
                      style={{ backgroundColor: rec.color }}
                      aria-hidden="true"
                    >
                      {rec.avatar}
                    </div>
                    <div className="linkedin-badge">
                      <i className="fab fa-linkedin" aria-hidden="true"></i>
                    </div>
                  </div>
                  <div className="recommender-info">
                    <h3 className="recommender-name">{rec.name}</h3>
                    <p className="recommender-title">{rec.title}</p>
                    <div className="recommendation-meta">
                      <span className="relationship">{rec.relationship}</span>
                      <span className="date">{rec.date}</span>
                    </div>
                  </div>
                </div>

                <div className="recommendation-content">
                  <div className="quote-icon" aria-hidden="true">
                    <i className="fas fa-quote-left"></i>
                  </div>
                  <blockquote className="recommendation-text">
                    {rec.content}
                  </blockquote>
                </div>

                <div className="recommendation-footer">
                  <div className="platform-info">
                    <i className="fab fa-linkedin" aria-hidden="true"></i>
                    <span>LinkedIn Recommendation</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="recommendations-cta">
          <a 
            href="https://linkedin.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn primary-btn"
            aria-label="View more recommendations on LinkedIn"
          >
            <i className="fab fa-linkedin" aria-hidden="true"></i>
            <span>View More on LinkedIn</span>
            <i className="fas fa-external-link-alt" aria-hidden="true"></i>
          </a>
        </div>
      </div>
    </section>
  )
}

export default Recommendations
