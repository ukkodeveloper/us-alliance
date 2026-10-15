import { useSearchParams } from 'react-router';

const FIRST_PAGE = 1;

function parsePage(value: string | null) {
  const page = Number(value);
  return Number.isInteger(page) && page >= FIRST_PAGE ? page : FIRST_PAGE;
}

export function useNotificationListParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePage(searchParams.get('page'));

  function setPage(nextPage: number) {
    setSearchParams(previousParams => {
      const nextParams = new URLSearchParams(previousParams);
      nextParams.set('page', String(nextPage));
      return nextParams;
    });
  }

  return { page, setPage };
}
