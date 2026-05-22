// ─── Nonogram Solver ──────────────────────────────────────────────────────
// Solver convention: 1 = filled, 0 = empty (independent of VAL_* constants).

// Memoised: same hints + size will always produce the same placements.
const _placementsCache = new Map();

// Returns all valid ways to fill a line of `size` cells that satisfy `hints`.
function _linePlacements(hints, size) {
    const key = size + ':' + hints.join(',');
    if (_placementsCache.has(key)) return _placementsCache.get(key);

    const out = [];
    if (hints.length === 0) { out.push(new Array(size).fill(0)); _placementsCache.set(key, out); return out; }

    function gen(hi, pos, row) {
        if (hi === hints.length) {
            const r = row.slice();
            while (r.length < size) r.push(0);
            out.push(r);
            return;
        }
        const g = hints[hi];
        let minRem = g;
        for (let i = hi + 1; i < hints.length; i++) minRem += 1 + hints[i];

        for (let p = pos; p + minRem <= size; p++) {
            const r = row.slice();
            while (r.length < p) r.push(0);
            for (let i = 0; i < g; i++) r.push(1);
            if (hi < hints.length - 1) r.push(0);
            gen(hi + 1, p + g + 1, r);
        }
    }
    gen(0, 0, []);
    _placementsCache.set(key, out);
    return out;
}

// Generates a random boolean row of exactly `size` cells with k groups,
// where k is chosen uniformly in [minGroups, maxGroups].
// Returns null if the constraints are impossible for this size.
function _randomValidRow(size, minGroups, maxGroups) {
    const k = minGroups + Math.floor(Math.random() * (maxGroups - minGroups + 1));
    if (2 * k - 1 > size) return null;

    // Distribute extra cells across 2k+1 slots:
    //   slots 0..k-1  → extra cells added to group i (group size = 1 + dist[i])
    //   slot  k       → leading gap
    //   slots k+1..2k-1 → extra gap after separator i (between group i-1 and i)
    //   slot  2k      → trailing gap
    const extra = size - (2 * k - 1);
    const numSlots = 2 * k + 1;
    const dist = new Array(numSlots).fill(0);
    for (let i = 0; i < extra; i++) dist[Math.floor(Math.random() * numSlots)]++;

    const row = [];
    for (let g = 0; g < dist[k]; g++) row.push(false);            // leading gap
    for (let g = 0; g < 1 + dist[0]; g++) row.push(true);         // group 0
    for (let i = 1; i < k; i++) {
        for (let g = 0; g < 1 + dist[k + i]; g++) row.push(false); // separator + extra
        for (let g = 0; g < 1 + dist[i]; g++) row.push(true);      // group i
    }
    for (let g = 0; g < dist[2 * k]; g++) row.push(false);        // trailing gap

    return row;
}

// Returns the number of valid solutions (up to maxSol) for the puzzle.
// Uses filtered column candidates: as each row is placed the column candidate
// sets shrink, making deeper checks O(survivors) instead of O(all placements).
// Returns -1 if nodeLimit is hit (treat as "unknown / accept").
function countNonogramSolutions(rowHints, colHints, maxSol = 2, nodeLimit = 500000) {
    const n = rowHints.length;
    const grid = new Array(n);
    let count = 0;
    let nodes = 0;

    const rowP = rowHints.map(h => _linePlacements(h, n));
    const colP = colHints.map(h => _linePlacements(h, n));

    function solve(row, colCands) {
        if (count >= maxSol || nodes >= nodeLimit) return;
        if (row === n) { count++; return; }

        for (const rp of rowP[row]) {
            if (count >= maxSol || nodes >= nodeLimit) return;
            nodes++;

            // Filter each column's candidate set to those consistent with rp
            const newColCands = new Array(n);
            let ok = true;
            for (let c = 0; c < n; c++) {
                const val = rp[c];
                const filtered = colCands[c].filter(cp => cp[row] === val);
                if (filtered.length === 0) { ok = false; break; }
                newColCands[c] = filtered;
            }

            if (ok) {
                grid[row] = rp;
                solve(row + 1, newColCands);
            }
        }
    }

    solve(0, colP);
    return nodes >= nodeLimit ? -1 : count;
}
