import { Grid, Column, Tag, InlineNotification, UnorderedList, ListItem } from '@carbon/react';
import CopyCodeBlock from './CopyCodeBlock';

/**
 * TopicSection
 *
 * Renders a single topic as a rich content section.
 *
 * Props:
 *   title       {string}              — Topic heading
 *   tag         {{ label, type }}     — Carbon Tag label and type (e.g. 'blue', 'red', 'green', 'teal', 'purple', 'warm-gray')
 *   body        {string[]}            — Array of paragraphs rendered as <p> elements
 *   callouts    {{ kind, title, subtitle }[]}  — Carbon InlineNotification callout boxes
 *   codeBlocks  {{ language, code, caption }[]} — Code blocks with copy button
 *   keyPoints   {string[]}            — Bullet-point summary list
 *   id          {string}              — Anchor id for TOC deep-linking
 */
export default function TopicSection({
  title,
  tag,
  body = [],
  callouts = [],
  codeBlocks = [],
  keyPoints = [],
  id,
}) {
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

        {/* Code blocks */}
        {codeBlocks.length > 0 && (
          <Column sm={4} md={8} lg={12}>
            {codeBlocks.map((block, i) => (
              <CopyCodeBlock
                key={i}
                code={block.code}
                language={block.language}
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
