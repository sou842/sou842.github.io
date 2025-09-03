import React, { useState } from 'react'

const Contact = () => {
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
    e.target.reset()
    setTimeout(() => setSent(false), 4000)
  }
  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div className="row contact-grid">
          <div className="contact-left">
            <h2 className="sub-title">Let’s work together</h2>
            <p className="contact-tagline">Have an idea or role in mind? I’d love to hear about it.</p>

            <div className="contact-badges">
              <span className="badge">Freelance</span>
              <span className="badge">Remote</span>
              <span className="badge">On‑site</span>
            </div>

            <div className="contact-cards gradient-card">
              <a className="contact-card" href="mailto:saifactplanet@gmail.com">
                <div className="icon"><i className="fas fa-paper-plane" aria-hidden="true"></i></div>
                <div className="content">
                  <div className="label">Email</div>
                  <div className="value">saifactplanet@gmail.com</div>
                </div>
              </a>
              <a className="contact-card" href="tel:9903149299">
                <div className="icon"><i className="fas fa-phone" aria-hidden="true"></i></div>
                <div className="content">
                  <div className="label">Phone</div>
                  <div className="value">+91 99031 49299</div>
                </div>
              </a>
            </div>

            <div className="contact-social">
              <a href="https://github.com/sou842" target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile">
                <i className="fab fa-github" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile">
                <i className="fab fa-linkedin" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter Profile">
                <i className="fab fa-twitter" />
              </a>
            </div>

            <a
              href="https://sou842.github.io/static/media/Resume.021e0f32702288aeeddb.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn2"
            >
              Download Resume
            </a>
          </div>

          <div className="contact-right">
            <div className="form-card">
              <form name="contact-form" onSubmit={handleSubmit}>
                <label htmlFor="name" className="sr-only">Your Name</label>
                <input
                  id="name"
                  type="text"
                  name="Name"
                  placeholder="Your Name"
                  required
                  aria-label="Your Name"
                />

                <label htmlFor="email" className="sr-only">Your Email</label>
                <input
                  id="email"
                  type="email"
                  name="Email"
                  placeholder="Your Email"
                  required
                  aria-label="Your Email"
                />

                <label htmlFor="message" className="sr-only">Your Message</label>
                <textarea
                  id="message"
                  name="Message"
                  rows="6"
                  placeholder="Tell me about your project..."
                  aria-label="Your Message"
                ></textarea>

                <button type="submit" className="btn btn2">Send Message</button>
              </form>
              {sent && (
                <span id="msg" role="status">Thanks! I'll get back to you shortly.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
