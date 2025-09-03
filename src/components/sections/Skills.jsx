import React, { useMemo, useState } from 'react'
import { skillsGrouped } from '../../static';

const Skills = () => {
  const [activeGroup, setActiveGroup] = useState('all')
  const [viewMode, setViewMode] = useState('cards') // 'cards' | 'bars'

  const groups = [{ id: 'all', label: 'All' }, ...skillsGrouped.map(g => ({ id: g.id, label: g.label }))]

  const allItems = useMemo(() => skillsGrouped.flatMap(g => g.items.map(i => ({ ...i, group: g.id }))), [])
  const itemsToShow = activeGroup === 'all' ? allItems : allItems.filter(i => i.group === activeGroup)

  const levelToPct = (level) => {
    switch (level) {
      case 'Advanced': return 90
      case 'Intermediate': return 70
      default: return 50
    }
  }

  return (
    <section id="skills" className="skills-section">
      <div className="container">
        <h2 className="sub-title">Skills</h2>
        <div className="skills-header">
          <div className="skills-filters">
            {groups?.map(g => (
              <button
                key={g.id}
                className={`filter-pill ${activeGroup === g.id ? 'active' : ''}`}
                onClick={() => setActiveGroup(g.id)}
              >
                {g?.label}
              </button>
            ))}
          </div>
          <div className="skills-view-toggle" role="tablist" aria-label="Skills view mode">
            <button
              className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              role="tab"
              aria-selected={viewMode === 'cards'}
            >Cards</button>
            <button
              className={`view-btn ${viewMode === 'bars' ? 'active' : ''}`}
              onClick={() => setViewMode('bars')}
              role="tab"
              aria-selected={viewMode === 'bars'}
            >Bars</button>
          </div>
        </div>



        {viewMode === 'bars' && (
          <div className="skills-grid">
            {itemsToShow.map((item, idx) => (
              <div key={`${item.name}-${idx}`} className="skill-card" title={`${item.name} • ${item.level}`}>
                <div className="skill-header">
                  <span className="skill-name">{item.name}</span>
                  <span className="skill-level">{item.level}</span>
                </div>
                <div className="skill-bar">
                  <div className="skill-fill" style={{ width: `${levelToPct(item.level)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'cards' && (
          <div className="skill-groups">
            {(activeGroup === 'all' ? skillsGrouped : skillsGrouped.filter(g => g.id === activeGroup)).map(group => (
              <div key={group.id} className="group-card">
                <div className="group-header">
                  <h3 className="group-title">{group?.label}</h3>
                </div>
                <div className="group-chips">
                  {group.items.map((s, i) => (
                    <span key={`${s.name}-${i}`} className={`chip chip-${s.level.toLowerCase()}`} title={s.level}>{s.name}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Skills;
