import { CodeSnippet } from '@carbon/react';

/**
 * CopyCodeBlock
 *
 * Wraps Carbon's multi-line CodeSnippet with a language/title label above it.
 * Copy-to-clipboard is built into Carbon's CodeSnippet component natively.
 *
 * Props:
 *   code      {string}  — The code / command text to display and copy
 *   language  {string}  — Display label (e.g. "bash", "dockerfile", "yaml")
 *   title     {string}  — Optional heading/title above the code block
 *   description {string} — Optional explanatory text above the code snippet
 *   caption   {string}  — Optional caption shown below the block
 */
export default function CopyCodeBlock({ code, language, title, description, caption }) {
  return (
    <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }}>
      {title && (
        <h4
          style={{
            fontSize: '1.0625rem',
            fontWeight: 600,
            marginBottom: '0.25rem',
            color: 'var(--cds-text-primary)',
          }}
        >
          {title}
        </h4>
      )}
      {description && (
        <p
          style={{
            fontSize: '0.9375rem',
            lineHeight: 1.6,
            color: 'var(--cds-text-secondary)',
            marginBottom: '0.5rem',
          }}
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}
      {language && (
        <p
          style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--cds-code-01-font-family, monospace)',
            color: 'var(--cds-text-secondary)',
            marginBottom: '0.25rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {language}
        </p>
      )}
      <CodeSnippet
        type="multi"
        feedback="Copied to clipboard!"
        hideCopyButton={false}
        wrapText
      >
        {code}
      </CodeSnippet>
      {caption && (
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--cds-text-secondary)',
            marginTop: '0.375rem',
            fontStyle: 'italic',
          }}
        >
          {caption}
        </p>
      )}
    </div>
  );
}
