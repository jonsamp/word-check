export function duplicates(items) {
    const visitedItemsSet = new Set();
    const duplicatedItemsSet = new Set();
    for (const item of items) {
        if (visitedItemsSet.has(item)) {
            duplicatedItemsSet.add(item);
        }
        else {
            visitedItemsSet.add(item);
        }
    }
    return [...duplicatedItemsSet];
}
//# sourceMappingURL=duplicates.js.map