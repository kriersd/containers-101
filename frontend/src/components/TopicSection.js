import { Grid, Column, Tag, InlineNotification, UnorderedList, ListItem, StructuredListWrapper, StructuredListHead, StructuredListRow, StructuredListCell, StructuredListBody } from '@carbon/react';
import CopyCodeBlock from './CopyCodeBlock';

/**
 * TopicSection
 *
 * Renders a single topic as a rich content section.
 *
 * Props:
 *   title       {string}              — Topic heading
 *   tag         {{ label, type }}     — Carbon Tag label and type
 *   body        {string[]}            — Array of paragraphs (HTML strings)
 *   images      {{ src, alt, caption, maxWidth, position }[]}
 *                                     — Optional images. position: 'top' (before body) | 'middle' (after body, before callouts) | 'inline-N' (after Nth paragraph)
 *                                       Defaults to 'top' if omitted.
 *   callouts    {{ kind, title, subtitle }[]}  — Carbon InlineNotification callout boxes
 *   codeBlocks  {{ language, code, caption }[]} — Code blocks with copy button
 *   keyPoints   {string[]}            — Bullet-point summary list
 *   comparisonTable {{ headers: string[], rows: string[][] }}
 *                                     — Optional comparison table rendered between body and callouts
 *   id          {string}              — Anchor id for TOC deep-linking
 */

function ImageBlock({ img }) {
  return (
    <Column sm={4} md={8} lg={12}>
      <div style={{ margin: '1rem 0 1.5rem', textAlign: 'center' }}>
        <img
          src={img.src}
          alt={img.alt || ''}
          style={{
            maxWidth: img.maxWidth || '600px',
            width: '100%',
            borderRadius: '4px',
            border: '1px solid var(--cds-border-subtle)',
            display: 'block',
            margin: '0 auto',
          }}
        />
        {img.caption && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)', marginTop: '0.5rem', fontStyle: 'italic' }}>
            {img.caption}
          </p>
        )}
      </div>
    </Column>
  );
}

export default function TopicSection({
  title,
  tag,
  body = [],
  images = [],
  callouts = [],
  codeBlocks = [],
  commandCards = [],
  keyPoints = [],
  comparisonTable,
  // Legacy single-image props — still supported for backwards compatibility
  image,
  secondaryImage,
  id,
}) {
  // Normalise: merge legacy props into images array
  const allImages = [
    ...(image ? [{ position: 'top', ...image }] : []),
    ...(secondaryImage ? [{ position: 'middle', ...secondaryImage }] : []),
    ...images,
  ];

  const topImages    = allImages.filter((img) => !img.position || img.position === 'top');
  const middleImages = allImages.filter((img) => img.position === 'middle');

  return (
    <section
      id={id}
      style={{
        paddingTop: '2.5rem',
        paddingBottom: '2rem',
        borderBottom: '1px solid var(--cds-border-subtle)',
      }}
    >
      <Grid>
        {/* Topic heading row */}
        <Column sm={4} md={8} lg={12}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                lineHeight: 1.3,
                margin: 0,
                color: 'var(--cds-text-primary)',
              }}
            >
              {title}
            </h2>
            {tag && (
              <Tag type={tag.type || 'blue'} size="md">
                {tag.label}
              </Tag>
            )}
          </div>
        </Column>

        {/* Top images (before body text) */}
        {topImages.map((img, i) => <ImageBlock key={`top-${i}`} img={img} />)}

        {/* Body paragraphs */}
        {body.length > 0 && (
          <Column sm={4} md={8} lg={12}>
            {body.map((paragraph, i) => (
              <p
                key={i}
                style={{
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  marginBottom: '1rem',
                  color: 'var(--cds-text-primary)',
                }}
                dangerouslySetInnerHTML={{ __html: paragraph }}
              />
            ))}
          </Column>
        )}

        {/* Middle images (after body, before callouts) */}
        {middleImages.map((img, i) => <ImageBlock key={`mid-${i}`} img={img} />)}

        {/* Comparison table */}
        {comparisonTable && (
          <Column sm={4} md={8} lg={12}>
            <div style={{ margin: '1.25rem 0 1.5rem', overflowX: 'auto' }}>
              <StructuredListWrapper>
                <StructuredListHead>
                  <StructuredListRow head>
                    {comparisonTable.headers.map((h, i) => (
                      <StructuredListCell key={i} head>
                        {h}
                      </StructuredListCell>
                    ))}
                  </StructuredListRow>
                </StructuredListHead>
                <StructuredListBody>
                  {comparisonTable.rows.map((row, ri) => (
                    <StructuredListRow key={ri}>
                      {row.map((cell, ci) => (
                        <StructuredListCell key={ci} noWrap={ci === 0}>
                          <span dangerouslySetInnerHTML={{ __html: cell }} />
                        </StructuredListCell>
                      ))}
                    </StructuredListRow>
                  ))}
                </StructuredListBody>
              </StructuredListWrapper>
            </div>
          </Column>
        )}

        {/* Callout notifications */}
        {callouts.length > 0 && (
          <Column sm={4} md={8} lg={12}>
            {callouts.map((callout, i) => (
              <div key={i} style={{ marginBottom: '0.75rem' }}>
                <InlineNotification
                  kind={callout.kind || 'info'}
                  title={callout.title}
                  subtitle={callout.subtitle}
                  lowContrast
                  hideCloseButton
                />
              </div>
            ))}
          </Column>
        )}

        {/* Command Cards (Interactive interactive-styled command cards) */}
        {commandCards.length > 0 && (
          <Column sm={4} md={8} lg={12}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem',
                margin: '1.25rem 0',
              }}
            >
              {commandCards.map((card, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--cds-layer)',
                    border: '1px solid var(--cds-border-subtle)',
                    borderTop: '3px solid var(--cds-interactive, #0f62fe)',
                    borderRadius: '4px',
                    padding: '1rem 1.125rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                      <code
                        style={{
                          fontSize: '0.9375rem',
                          fontWeight: 700,
                          color: 'var(--cds-text-primary)',
                          background: 'var(--cds-layer-accent, rgba(15, 98, 254, 0.08))',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '3px',
                        }}
                      >
                        {card.command}
                      </code>
                      {card.badge && (
                        <Tag type={card.badgeType || 'cool-gray'} size="sm">
                          {card.badge}
                        </Tag>
                      )}
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', margin: '0.25rem 0 0.5rem', lineHeight: 1.45 }}>
                      {card.description}
                    </p>
                  </div>
                  {card.tip && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        paddingTop: '0.5rem',
                        borderTop: '1px dashed var(--cds-border-subtle)',
                        fontSize: '0.8125rem',
                        color: 'var(--cds-text-helper, #6f6f6f)',
                        lineHeight: 1.4,
                      }}
                    >
                      <strong style={{ color: 'var(--cds-text-primary)' }}>Tip: </strong>
                      <span dangerouslySetInnerHTML={{ __html: card.tip }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Column>
        )}

        {/* Code blocks */}
        {codeBlocks.length > 0 && (
          <Column sm={4} md={8} lg={12}>
            {codeBlocks.map((block, i) => (
              <CopyCodeBlock
                key={i}
                code={block.code}
                language={block.language}
                title={block.title}
                description={block.description}
                caption={block.caption}
              />
            ))}
          </Column>
        )}

        {/* Key points bullet list */}
        {keyPoints.length > 0 && (
          <Column sm={4} md={8} lg={12}>
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem 1.25rem',
                background: 'var(--cds-layer)',
                borderLeft: '4px solid var(--cds-interactive)',
                borderRadius: '0 4px 4px 0',
              }}
            >
              <p
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: 'var(--cds-text-primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Key Points
              </p>
              <UnorderedList>
                {keyPoints.map((point, i) => (
                  <ListItem
                    key={i}
                    style={{ fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '0.25rem' }}
                  >
                    <span dangerouslySetInnerHTML={{ __html: point }} />
                  </ListItem>
                ))}
              </UnorderedList>
            </div>
          </Column>
        )}
      </Grid>
    </section>
  );
}
