import { useState } from 'react';

import { Button } from '../../../components/Button';
import { TextField } from '../../../components/TextField';
import { isValidLinkUrl } from '../utils/isValidLinkUrl';

type LinkFieldProps = {
  linkUrl: string | null;
  error?: string;
  onLinkUrlChange: (linkUrl: string | null) => void;
};

export function LinkField({ linkUrl, error, onLinkUrlChange }: LinkFieldProps) {
  const [linkDraft, setLinkDraft] = useState('');
  const isInserted = linkUrl != null;
  const canInsert = !isInserted && isValidLinkUrl(linkDraft.trim());

  function handleInsert() {
    onLinkUrlChange(linkDraft.trim());
    setLinkDraft('');
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <TextField
            label="링크"
            type="url"
            placeholder="삽입된 링크가 없습니다."
            value={linkDraft}
            disabled={isInserted}
            onChange={event => setLinkDraft(event.target.value)}
            onClear={() => setLinkDraft('')}
          />
        </div>
        <Button onClick={handleInsert} disabled={!canInsert} className="h-11">
          삽입
        </Button>
      </div>
      {linkUrl != null && <InsertedLink linkUrl={linkUrl} onRemove={() => onLinkUrlChange(null)} />}
      {error != null && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

type InsertedLinkProps = {
  linkUrl: string;
  onRemove: () => void;
};

function InsertedLink({ linkUrl, onRemove }: InsertedLinkProps) {
  return (
    <div className="flex h-11 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3">
      {isValidLinkUrl(linkUrl) ? (
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 flex-1 truncate text-sm text-gray-900 hover:underline"
        >
          {linkUrl}
        </a>
      ) : (
        <span className="min-w-0 flex-1 truncate text-sm text-gray-500">{linkUrl}</span>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label="삽입된 링크 삭제"
        className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gray-300 text-[10px] text-white hover:bg-gray-400"
      >
        ✕
      </button>
    </div>
  );
}
