import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Modal } from './Modal';

describe('Modal', () => {
  afterEach(cleanup);

  it('ESC를 누르면 닫힌다', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="제목">
        본문
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('안쪽 요소가 ESC를 이미 처리했으면(달력 닫기 등) 모달은 닫히지 않는다', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="제목">
        <input aria-label="날짜" onKeyDown={event => event.preventDefault()} />
      </Modal>
    );

    fireEvent.keyDown(screen.getByLabelText('날짜'), { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
  });
});
