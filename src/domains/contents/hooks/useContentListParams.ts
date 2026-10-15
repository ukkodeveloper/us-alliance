import { useSearchParams } from 'react-router';

import { CATEGORIES, type Category, PUBLISH_STATUSES, type PublishStatus } from '../../../api/contents';

const FIRST_PAGE = 1;

function parsePage(rawPage: string | null) {
  const page = Number(rawPage);
  return Number.isInteger(page) && page >= FIRST_PAGE ? page : FIRST_PAGE;
}

function parseCategory(rawCategory: string | null) {
  return CATEGORIES.find(category => category === rawCategory);
}

function parsePublishStatus(rawPublishStatus: string | null) {
  return PUBLISH_STATUSES.find(publishStatus => publishStatus === rawPublishStatus);
}

export function useContentListParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = {
    page: parsePage(searchParams.get('page')),
    category: parseCategory(searchParams.get('category')),
    publish_status: parsePublishStatus(searchParams.get('publish_status')),
  };

  function setPage(page: number) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', String(page));
      return next;
    });
  }

  function setFilter(key: 'category' | 'publish_status', value: string | undefined) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value == null) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      next.delete('page');
      return next;
    });
  }

  function setCategory(category: Category | undefined) {
    setFilter('category', category);
  }

  function setPublishStatus(publishStatus: PublishStatus | undefined) {
    setFilter('publish_status', publishStatus);
  }

  return { params, setPage, setCategory, setPublishStatus };
}
