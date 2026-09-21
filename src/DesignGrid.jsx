import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function DesignGrid() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const toggle = event => {
      if (event.key.toLowerCase() !== 'g' || event.repeat || event.isComposing || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable], [role="textbox"], [role="combobox"]')) return;
      setVisible(current => !current);
    };
    document.addEventListener('keydown', toggle);
    return () => document.removeEventListener('keydown', toggle);
  }, []);
  return visible ? createPortal(<div className="design-grid" aria-hidden="true"><div className="design-grid-columns wrap">{Array.from({ length: 12 }, (_, i) => <span key={i} />)}</div></div>, document.body) : null;
}
