import React, { useState } from 'react'

const Contact = () => {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const formData = new FormData(form)
    const name = formData.get('name')
    const email = formData.get('email')
    const message = formData.get('message')

    try {
      const res = await fetch('https://formsubmit.co/ajax/saifactplanet@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          message,
          _template: 'table',
          subject: `Portfolio contact from ${name}`,
        })
      })

      if (!res.ok) throw new Error('Failed to send message. Please try again later.')
      const data = await res.json()
      if (data?.success !== 'true' && data?.success !== true) {
        throw new Error('Unable to send right now. Please try again later.')
      }

      setSent(true)
      form.reset()
      setTimeout(() => setSent(false), 4000)
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
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
            </div>

            <a
              href="https://drive.google.com/uc?export=download&id=1QkaojjaE19q2KasFag9vbVyWSRCwKfm7"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn2"
            >
              Download Resume
            </a>
          </div>

          <div className="contact-right">
            <div className="form-card">
              <form name="contact-form" onSubmit={handleSubmit} noValidate>
                <label htmlFor="name" className="sr-only">Your Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  required
                  aria-label="Your Name"
                />

                <label htmlFor="email" className="sr-only">Your Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  required
                  aria-label="Your Email"
                />

                <label htmlFor="message" className="sr-only">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  placeholder="Tell me about your project..."
                  aria-label="Your Message"
                ></textarea>

                <button type="submit" className="btn btn2" disabled={loading} aria-busy={loading}>
                  {loading ? 'Sending…' : 'Send Message'}
                </button>
              </form>
              {error && (
                <span role="alert" style={{ color: '#ff6b6b', marginTop: '8px', display: 'inline-block' }}>{error}</span>
              )}
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
