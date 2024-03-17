const { readdir } = require('fs').promises;
const path = require('path');

const cache = new Map();

async function getFileList(dirName, filter, depth = 0) {
    const cacheKey = `${dirName}:${filter.type}:${depth}`;

    if (cache.has(cacheKey)) return cache.get(cacheKey);

    let files = [];
    const items = await readdir(dirName, { withFileTypes: true });

    for (const item of items) {
        const itemPath = path.join(dirName, item.name);

        if (item.isDirectory() && filter.recursively) {
            if (depth >= filter.maxDepth) continue;
            if (filter.exclusion && filter.exclusion.includes(item.name)) continue;

            const subFiles = await getFileList(itemPath, filter, depth + 1);
            files = [...files, ...subFiles];
        } else if (item.name.endsWith(filter.type)) files.push(itemPath);
    }

    cache.set(cacheKey, files);

    return files;
}

module.exports = {
    getFileList
}
