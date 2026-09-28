import { CodeSnippet } from '@carbon/react';

/**
 * CopyCodeBlock
 *
 * Wraps Carbon's multi-line CodeSnippet with a language label above it.
 * Copy-to-clipboard is built into Carbon's CodeSnippet component natively.
 *
 * Props:
 *   code      {string}  — The code / command text to display and copy
 *   language  {string}  — Display label (e.g. "bash", "dockerfile", "yaml")
 *   caption   {string}  — Optional caption shown below the block
 */
export default function CopyCodeBlock({ code, language, caption }) {
  return (
    <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
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
