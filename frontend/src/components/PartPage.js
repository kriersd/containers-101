import { useState, useEffect } from 'react';
import { Grid, Column, Button, Tag } from '@carbon/react';
import { ChevronLeft, ChevronRight } from '@carbon/icons-react';
import TopicSection from './TopicSection';
import { part1 } from '../content/part1';
import { part2 } from '../content/part2';
import { part3 } from '../content/part3';

const PARTS = { 1: part1, 2: part2, 3: part3 };

const PART_TAG_TYPES = { 1: 'teal', 2: 'purple', 3: 'blue' };

/** Convert a topic title to a URL-safe anchor id */
function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function PartPage({ partId, onBack, onNavigate }) {
  const part = PARTS[partId];
  const [activeId, setActiveId] = useState('');

  // Intersection observer — highlights the active TOC item as user scrolls
  useEffect(() => {
    const sectionIds = part.topics.map((t) => slugify(t.title));

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [partId, part.topics]);

  function scrollToTopic(id) {
    const el = document.getElementById(id);
    if (el) {
      // Account for sticky header height
      const y = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  return (
    <div>
      {/* ── Sticky Part Header ─────────────────────────────────────────── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'var(--cds-background)',
          borderBottom: '1px solid var(--cds-border-subtle)',
          padding: '0.625rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <Button
          kind="ghost"
          size="sm"
          renderIcon={ChevronLeft}
          onClick={onBack}
          style={{ flexShrink: 0 }}
        >
          Overview
        </Button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
          <Tag type={PART_TAG_TYPES[partId]} size="sm">
            Part {partId}
          </Tag>
          <span
            style={{
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: 'var(--cds-text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {part.title}
          </span>
        </div>

        {/* Next Part button — not shown on Part 3 */}
        {partId < 3 && (
          <Button
            kind="tertiary"
            size="sm"
            renderIcon={ChevronRight}
            iconDescription="Next part"
            onClick={() => onNavigate(partId + 1)}
            style={{ flexShrink: 0 }}
          >
            Part {partId + 1}
          </Button>
        )}
      </div>

      {/* ── Main Layout: TOC + Content ─────────────────────────────────── */}
      <Grid style={{ marginTop: '1.5rem', paddingBottom: '4rem' }}>

        {/* Left column: Table of Contents (sticky sidebar) */}
        <Column sm={0} md={0} lg={3} xlg={3}>
          <div
            style={{
              position: 'sticky',
              top: '3.5rem',
              paddingTop: '0.5rem',
              maxHeight: 'calc(100vh - 5rem)',
              overflowY: 'auto',
            }}
          >
            <p
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--cds-text-secondary)',
                marginBottom: '0.75rem',
                paddingLeft: '0.75rem',
              }}
            >
              Topics
            </p>
            <nav aria-label="Table of contents">
              {part.topics.map((topic) => {
                const id = slugify(topic.title);
                const isActive = activeId === id;
                return (
                  <button
                    key={id}
                    onClick={() => scrollToTopic(id)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.4rem 0.75rem',
                      background: isActive ? 'var(--cds-layer-selected)' : 'transparent',
                      border: 'none',
                      borderLeft: isActive
                        ? '3px solid var(--cds-interactive)'
                        : '3px solid transparent',
                      cursor: 'pointer',
                      color: isActive ? 'var(--cds-text-primary)' : 'var(--cds-text-secondary)',
                      fontSize: '0.8125rem',
                      lineHeight: 1.5,
                      fontWeight: isActive ? 600 : 400,
                      transition: 'all 0.15s',
                    }}
                  >
                    {topic.title}
                  </button>
                );
              })}
            </nav>
          </div>
        </Column>

        {/* Right column: Topic sections */}
        <Column sm={4} md={8} lg={13} xlg={13}>
          {/* Part intro header */}
          <div style={{ paddingTop: '0.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--cds-border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Tag type={PART_TAG_TYPES[partId]} size="md">Part {partId}</Tag>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 300, margin: 0, color: 'var(--cds-text-primary)' }}>
                {part.title}
              </h1>
            </div>
            <p style={{ color: 'var(--cds-text-secondary)', fontSize: '1rem', margin: 0 }}>
              {part.description}
            </p>
          </div>

          {/* All topic sections */}
          {part.topics.map((topic) => (
            <TopicSection
              key={topic.id}
              id={slugify(topic.title)}
              title={topic.title}
              tag={topic.tag}
              body={topic.body}
              callouts={topic.callouts}
              codeBlocks={topic.codeBlocks}
              keyPoints={topic.keyPoints}
            />
          ))}

          {/* Bottom navigation */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '2rem',
              marginTop: '2rem',
              borderTop: '1px solid var(--cds-border-subtle)',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <Button kind="secondary" renderIcon={ChevronLeft} onClick={onBack}>
              Back to Overview
            </Button>
            {partId < 3 ? (
              <Button kind="primary" renderIcon={ChevronRight} onClick={() => onNavigate(partId + 1)}>
                Next: Part {partId + 1}
              </Button>
            ) : (
              <Button kind="primary" renderIcon={ChevronLeft} onClick={onBack}>
                Back to Overview
              </Button>
            )}
          </div>
        </Column>
      </Grid>
    </div>
  );
}
