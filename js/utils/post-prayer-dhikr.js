/**
 * Hayat — Pure immutable post-prayer dhikr progress helpers.
 */

function validSequence(sequence) {
  return Array.isArray(sequence) && sequence.length > 0 && sequence.every(function (item) {
    return item && typeof item.id === 'string' &&
      Number.isInteger(item.targetRepetitions) && item.targetRepetitions > 0;
  }) && new Set(sequence.map(function (item) { return item.id; })).size === sequence.length;
}

function copy(progress) {
  return {
    currentIndex: progress.currentIndex,
    currentItemId: progress.currentItemId,
    currentCount: progress.currentCount,
    completedItemIds: progress.completedItemIds.slice(),
    complete: progress.complete
  };
}

export function createInitialDhikrProgress(sequence) {
  if (!validSequence(sequence)) {
    return {
      currentIndex: 0,
      currentItemId: null,
      currentCount: 0,
      completedItemIds: [],
      complete: false
    };
  }
  return {
    currentIndex: 0,
    currentItemId: sequence[0].id,
    currentCount: 0,
    completedItemIds: [],
    complete: false
  };
}

export function normalizeDhikrProgress(sequence, session) {
  if (!validSequence(sequence)) return createInitialDhikrProgress(sequence);
  if (!session || typeof session !== 'object') return createInitialDhikrProgress(sequence);

  var ids = sequence.map(function (item) { return item.id; });
  var seen = new Set();
  var completed = [];
  if (Array.isArray(session.completedItemIds)) {
    session.completedItemIds.forEach(function (id) {
      if (ids.indexOf(id) !== -1 && !seen.has(id)) {
        seen.add(id); completed.push(id);
      }
    });
    completed.sort(function (a, b) { return ids.indexOf(a) - ids.indexOf(b); });
  }

  var currentIndex = ids.indexOf(session.currentItemId);
  if (currentIndex < 0) {
    currentIndex = ids.findIndex(function (id) { return !seen.has(id); });
    if (currentIndex < 0) currentIndex = sequence.length - 1;
  }

  var currentItem = sequence[currentIndex];
  var currentCount = Number.isInteger(session.currentCount) && session.currentCount >= 0
    ? Math.min(session.currentCount, currentItem.targetRepetitions)
    : 0;
  if (seen.has(currentItem.id)) currentCount = currentItem.targetRepetitions;

  var complete = completed.length === sequence.length;
  return {
    currentIndex: currentIndex,
    currentItemId: currentItem.id,
    currentCount: currentCount,
    completedItemIds: completed,
    complete: complete
  };
}

export function incrementDhikrCount(sequence, progress) {
  var normalized = normalizeDhikrProgress(sequence, progress);
  if (!validSequence(sequence) || normalized.complete || !normalized.currentItemId) return normalized;
  var item = sequence[normalized.currentIndex];
  var next = copy(normalized);
  next.currentCount = Math.min(next.currentCount + 1, item.targetRepetitions);
  if (next.currentCount === item.targetRepetitions &&
      next.completedItemIds.indexOf(item.id) === -1) {
    next.completedItemIds.push(item.id);
    next.completedItemIds.sort(function (a, b) {
      return sequence.findIndex(function (x) { return x.id === a; }) -
        sequence.findIndex(function (x) { return x.id === b; });
    });
  }
  next.complete = next.completedItemIds.length === sequence.length;
  return next;
}

export function goToPreviousDhikrItem(sequence, progress) {
  var normalized = normalizeDhikrProgress(sequence, progress);
  if (!validSequence(sequence) || normalized.currentIndex <= 0) return normalized;
  var next = copy(normalized);
  next.currentIndex -= 1;
  next.currentItemId = sequence[next.currentIndex].id;
  next.currentCount = next.completedItemIds.indexOf(next.currentItemId) !== -1
    ? sequence[next.currentIndex].targetRepetitions : 0;
  return next;
}

export function goToNextDhikrItem(sequence, progress, options) {
  var normalized = normalizeDhikrProgress(sequence, progress);
  if (!validSequence(sequence) || normalized.complete) return normalized;
  var currentItem = sequence[normalized.currentIndex];
  var targetReached = normalized.currentCount >= currentItem.targetRepetitions;
  if (!targetReached && !(options && options.allowSkip === true)) return normalized;

  var next = copy(normalized);
  if (targetReached && next.completedItemIds.indexOf(currentItem.id) === -1) {
    next.completedItemIds.push(currentItem.id);
  }
  next.completedItemIds.sort(function (a, b) {
    return sequence.findIndex(function (x) { return x.id === a; }) -
      sequence.findIndex(function (x) { return x.id === b; });
  });
  next.complete = next.completedItemIds.length === sequence.length;
  if (next.currentIndex < sequence.length - 1) {
    next.currentIndex += 1;
    next.currentItemId = sequence[next.currentIndex].id;
    next.currentCount = next.completedItemIds.indexOf(next.currentItemId) !== -1
      ? sequence[next.currentIndex].targetRepetitions : 0;
  }
  return next;
}

export function getDhikrProgressSummary(sequence, progress) {
  if (!validSequence(sequence)) return { completedItems: 0, totalItems: 0, percentage: 0 };
  var normalized = normalizeDhikrProgress(sequence, progress);
  var completed = Math.min(normalized.completedItemIds.length, sequence.length);
  return {
    completedItems: completed,
    totalItems: sequence.length,
    percentage: Math.max(0, Math.min(100, Math.round(completed / sequence.length * 100)))
  };
}
