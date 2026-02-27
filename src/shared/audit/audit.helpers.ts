/**
 * Compares two objects and returns the differences as a clean object
 */
export function getChanges(oldObj: Record<string, any> | null, newObj: Record<string, any> | null): Record<string, { old: any; new: any }> {
    const changes: Record<string, { old: any; new: any }> = {};

    if (!oldObj && !newObj) return changes;
    if (!oldObj) return { _newRow: { old: null, new: newObj } };
    if (!newObj) return { _deletedRow: { old: oldObj, new: null } };

    const keys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    for (const key of keys) {
        // Skip comparing system properties if needed, e.g. updated_at
        if (key === 'updated_at' || key === 'updatedAt') continue;

        if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
            changes[key] = {
                old: oldObj[key],
                new: newObj[key],
            };
        }
    }

    return changes;
}
