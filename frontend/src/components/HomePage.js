import { Grid, Column, ClickableTile, Tag, UnorderedList, ListItem } from '@carbon/react';
import { part1 } from '../content/part1';
import { part2 } from '../content/part2';
import { part3 } from '../content/part3';

const PARTS = [part1, part2, part3];

// One accent colour per part card
const PART_TAG_TYPES = ['teal', 'purple', 'blue'];

// Short descriptions shown on each card
const PART_DESCRIPTIONS = [
  'Core concepts, architectures, the layered filesystem, Podman vs Docker, Dockerfile anatomy, and why containers beat VMs.',
  'Running containers in practice — env vars, volumes, port mapping, restart policies, privileged mode, and image tagging.',
  'Live walkthroughs — pull your first container, run Ghost blog, build a Node.js app from scratch, and tour this repo.',
];

export default function HomePage({ onNavigate }) {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'var(--cds-layer)',
          borderBottom: '1px solid var(--cds-border-subtle)',
          padding: '3rem 0 2.5rem',
        }}
      >
        <Grid>
          <Column sm={4} md={8} lg={10}>
            <p
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--cds-text-secondary)',
                marginBottom: '0.5rem',
              }}
            >
              Education Session
            </p>
            <h1
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 300,
                lineHeight: 1.2,
                margin: '0 0 1.25rem',
                color: 'var(--cds-text-primary)',
              }}
            >
              Containers 101
            </h1>
            <p
              style={{
                fontSize: '1.125rem',
                lineHeight: 1.65,
                color: 'var(--cds-text-secondary)',
                maxWidth: '640px',
                margin: 0,
              }}
            >
              A guided walkthrough of container technology — from foundational concepts to
              hands-on examples. By the end of this session you will understand what
              containers are, how to build and run them safely, and how to apply best
              practices in real-world deployments.
            </p>
          </Column>
        </Grid>
      </div>

      {/* ── Part Cards ───────────────────────────────────────────────── */}
      <div style={{ padding: '2.5rem 0 3rem' }}>
        <Grid>
          <Column sm={4} md={8} lg={16}>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--cds-text-secondary)',
                marginBottom: '1.5rem',
              }}
            >
              Select a part to begin.
            </p>
          </Column>

          {PARTS.map((part, idx) => (
            <Column key={part.id} sm={4} md={4} lg={5} xlg={5}>
              <ClickableTile
                onClick={() => onNavigate(part.id)}
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                }}
              >
                {/* Part label */}
                <Tag type={PART_TAG_TYPES[idx]} size="sm" style={{ marginBottom: '0.75rem' }}>
                  Part {part.id}
                </Tag>

                {/* Part title */}
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    lineHeight: 1.3,
                    margin: '0 0 0.75rem',
                    color: 'var(--cds-text-primary)',
                  }}
                >
                  {part.title}
                </h2>

                {/* Short description */}
                <p
                  style={{
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                    color: 'var(--cds-text-secondary)',
                    marginBottom: '1rem',
                    flex: 1,
                  }}
                >
                  {PART_DESCRIPTIONS[idx]}
                </p>

                {/* Topic list */}
                {part.topics && part.topics.length > 0 && (
                  <>
                    <p
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--cds-text-secondary)',
                        marginBottom: '0.375rem',
                      }}
                    >
                      Topics
                    </p>
                    <UnorderedList style={{ paddingLeft: '1rem' }}>
                      {part.topics.map((topic) => (
                        <ListItem
                          key={topic.id}
                          style={{
                            fontSize: '0.8125rem',
                            lineHeight: 1.5,
                            color: 'var(--cds-text-secondary)',
                            marginBottom: '0.125rem',
                          }}
                        >
                          {topic.title}
                        </ListItem>
                      ))}
                    </UnorderedList>
                  </>
                )}

                {/* CTA */}
                <p
                  style={{
                    marginTop: '1.25rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--cds-link-primary)',
                  }}
                >
                  Start Part {part.id} →
                </p>
              </ClickableTile>
            </Column>
          ))}
        </Grid>
      </div>
    </div>
  );
}
