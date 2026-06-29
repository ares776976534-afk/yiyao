import type { CSSProperties } from 'react';

type PrismTheme = Record<string, CSSProperties>;

export const alphaCodeTheme: PrismTheme = {
  'code[class*="language-"]': {
    color: '#1B1C1D',
    fontFamily: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: '0.875em',
    lineHeight: '1.6',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    tabSize: 2,
    hyphens: 'none',
  },
  'pre[class*="language-"]': {
    color: '#1B1C1D',
    fontFamily: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: '0.875em',
    lineHeight: '1.6',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    tabSize: 2,
    hyphens: 'none',
    padding: '16px',
    margin: '0',
    overflow: 'auto',
    background: '#FFFFFF',
  },

  // Comments
  comment: { color: '#7C7F9A', fontStyle: 'italic' },
  prolog: { color: '#7C7F9A' },
  doctype: { color: '#7C7F9A' },
  cdata: { color: '#7C7F9A' },

  // Punctuation
  punctuation: { color: '#1B1C1D' },
  namespace: { opacity: 0.7 },

  // Keywords & properties — brand accent
  property: { color: '#6E50FF' },
  keyword: { color: '#6E50FF' },
  selector: { color: '#6E50FF' },
  'attr-name': { color: '#6E50FF' },
  entity: { color: '#6E50FF', cursor: 'help' },
  url: { color: '#6E50FF' },

  // Tags — warning red
  tag: { color: '#F55353' },
  deleted: { color: '#F55353' },
  important: { color: '#F55353', fontWeight: 'bold' },

  // Strings — orange
  string: { color: '#FD963C' },
  char: { color: '#FD963C' },
  'attr-value': { color: '#FD963C' },
  inserted: { color: '#FD963C' },
  regex: { color: '#FD963C' },

  // Numbers & builtins — blue
  boolean: { color: '#2FBDFF' },
  number: { color: '#2FBDFF' },
  constant: { color: '#2FBDFF' },
  symbol: { color: '#2FBDFF' },
  builtin: { color: '#2FBDFF' },

  // Functions & class names — purple
  function: { color: '#C073FF' },
  'class-name': { color: '#C073FF' },

  // Operators — secondary text
  operator: { color: '#4D4D5F' },

  // Generic
  variable: { color: '#1B1C1D' },
  bold: { fontWeight: 'bold' },
  italic: { fontStyle: 'italic' },
};
