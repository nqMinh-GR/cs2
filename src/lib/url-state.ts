/** `?case=<id>` deep links without a router. */
export function readCaseParam() {
  try {
    return new URLSearchParams(window.location.search).get('case');
  } catch {
    return null;
  }
}

export function writeCaseParam(caseId: string | null, replace = false) {
  try {
    const url = new URL(window.location.href);
    if (caseId) url.searchParams.set('case', caseId);
    else url.searchParams.delete('case');
    const method = replace ? 'replaceState' : 'pushState';
    window.history[method]({ caseId }, '', `${url.pathname}${url.search}${url.hash}`);
  } catch {
    /* History API unavailable (sandboxed iframe): the in-memory state still works. */
  }
}
