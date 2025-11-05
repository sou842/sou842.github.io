import React, { useState } from 'react'
import therealfeel from '../../assets/therealfeel.png'
import DYP from '../../assets/DYP.png'
import Translator from '../../assets/Translator.png'

const projectData = [
  {
    id: 1,
    image: therealfeel,
    title: "The Real Feel",
    description: "An AI-powered feedback analysis platform that transforms user feedback into actionable insights. Built with Next.js, Redux, and TanStack Query for efficient data handling, featuring Mapbox integration for geolocation and visualization, and a responsive, accessible UI with Tailwind CSS and Headless UI.",
    alt: "The Real Feel Social Media App",
    category: "Web App",
    technologies: ["Next.js", "Tailwind", "TanStack", "Node.js", "Mapbox"],
    liveUrl: "https://www.therealfeel.ai/",
    githubUrl: "private",
    isPrivate: true
  },
  {
    id: 2,
    image: DYP,
    title: "DYP",
    description: "A healthcare web platform built with React, TypeScript, MobX, and Material UI, delivering an intuitive and efficient user experience. Optimized performance for large-scale healthcare data and led a development team to ensure scalability, maintainability, and alignment with long-term business goals.",
    alt: "DYP",
    category: "Web App",
    technologies: ["React", "TypeScript", "Mobx", "Material UI", "Scss"],
    liveUrl: "https://dyp2-sb-dev01.hhstechgroup.com/",
    githubUrl: "private",
    isPrivate: true,
    requiresVPN: true
  },
  {
    id: 3,
    image: Translator,
    title: "Transletor",
    description: "A multi-language management system enabling seamless translation and localization across the DYP platform. Built with React.js, Redux, and Material UI for a scalable, responsive interface. Optimized performance for large datasets and led a team to integrate multilingual features while ensuring code quality and maintainability.",
    alt: "Translator",
    category: "Web App",
    technologies: ["React", "TypeScript", "i18n", "Redux", "Material UI"],
    liveUrl: "https://dyp2-sb-dev02.hhstechgroup.com/",
    githubUrl: "private",
    isPrivate: true,
    requiresVPN: true
  },
];

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState('All')

  const categories = ['All', ...new Set(projectData.map(project => project.category))]
  const filteredProjects = activeFilter === 'All'
    ? projectData
    : projectData.filter(project => project.category === activeFilter)

  const handleMouseMove = (e) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -6
    const rotateY = ((x - centerX) / centerX) * 6
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'rotateX(0deg) rotateY(0deg)'
  }

  return (
    <section id="projects" className="projects-section">
      <div className="container">
        <div className="section-header">
          <h2 className="sub-title">Featured Projects</h2>
          <p className="section-description">
            A showcase of my recent work, featuring modern web applications and mobile solutions built with cutting-edge technologies.
          </p>
        </div>

        <div className="project-filters">
          {categories.map((category) => (
            <button
              key={category}
              className={`filter-btn ${activeFilter === category ? 'active' : ''}`}
              onClick={() => setActiveFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="work-list interactive-grid">
          {filteredProjects?.map((project) => (
            <article
              key={project.id}
              className="work tilt project-card"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className="project-image-container">
                <img src={project?.image} alt={project.alt} />
                <div className="project-overlay">
                  <div className="project-category">{project.category}</div>

                  <div className="project-links">
                    <a
                      href={project.liveUrl}
                      className="project-link live-link"
                      aria-label={`View live demo of ${project.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fas fa-external-link-alt"></i>
                      <span>{project.requiresVPN ? 'Live Demo (VPN)' : 'Live Demo'}</span>
                    </a>
                    {project.isPrivate ? (
                      <div className="project-link private-link" title="Access restricted due to client confidentiality.">
                        <i className="fas fa-lock"></i>
                        <span>Code</span>
                        <div className="tooltip">
                          <i className="fas fa-info-circle"></i>
                          <span className="tooltip-text">Access restricted due to confidentiality.</span>
                        </div>
                      </div>
                    ) : (
                      <a
                        href={project.githubUrl}
                        className="project-link github-link"
                        aria-label={`View source code of ${project.title}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fab fa-github"></i>
                        <span>Code</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <h3 className="project-title">{project.title}</h3>
              <div className="project-content">
                <p className="project-description">{project.description}</p>

                <div className="project-technologies">
                  {project.technologies.map((tech, index) => (
                    <span key={index} className="tech-tag">{tech}</span>
                  ))}
                </div>

              </div>
            </article>
          ))}
        </div>

        <div className="projects-cta">
          <a href="#" className="btn primary-btn">
            <span>View All Projects</span>
            <i className="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
    </section>
  )
}

export default Projects;
