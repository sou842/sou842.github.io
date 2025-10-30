import React, { useState } from 'react'
import user from '../../assets/user.png'
import { aboutTabs } from '../../static';

const About = () => {
  const [activeTab, setActiveTab] = useState('experience')

  const openTab = (tabname) => {
    setActiveTab(tabname)
  }
  return (
    <section id="about">
      <div className="container">
        <div className="row">
          <div className="about-col-1">
            <div className="about-photo">
              <img src={user} alt="Portrait of Sourav Samanta" />
              <a
                href="https://sou842.github.io/static/media/Resume.021e0f32702288aeeddb.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="resume-overlay-btn"
                aria-label="Open resume in a new tab"
              >
                <i className="fas fa-file-alt" aria-hidden="true"></i>
                <span>Resume</span>
              </a>
            </div>
          </div>
          <div className="about-col-2">
            <h2 className="sub-title">About Me</h2>
            <p>
              Full Stack Developer with 2+ years of experience building innovative, efficient web
              applications across front-end and back-end. Passionate about modern frameworks,
              scalable architectures, and delivering high-quality solutions that drive impact.
            </p>

            <div className="tab-titles">
              {aboutTabs?.map((tab) => (
                <button
                  key={tab?.id}
                  className={`tab-links ${activeTab === tab?.id ? 'active-link' : ''}`}
                  onClick={() => openTab(tab?.id)}
                >
                  {tab?.label}
                </button>
              ))}
            </div>

            {aboutTabs?.map((tab) => (
              <div key={tab.id} className={`tab-contents ${activeTab === tab.id ? 'active-tab' : ''}`}>
                <ul className="timeline">
                  {tab.items.map((item, idx) => (
                    <li key={idx} className="timeline-item">
                      <div className="timeline-meta">{item?.period}</div>
                      <div className="timeline-content">
                        <h4>
                          {item?.title}
                          {item?.organization ? `, ${item?.organization}` : ''}
                          {item?.location ? ` — ${item?.location}` : ''}
                        </h4>
                        {item?.highlights && item?.highlights?.length > 0 && (
                          <ul className="bullets">
                            {item?.highlights?.map((point, pIdx) => (
                              <li className='bullet-item' key={pIdx}>{point}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default About;
