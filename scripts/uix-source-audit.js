import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['index.html', 'js', 'css'];
const SOURCE_EXTENSION = /\.(?:html|js|css)$/;
const PICTOGRAPH = /\p{Extended_Pictographic}/gu;
const SCREEN_ID = /["'`]([A-Za-z0-9]+Screen)["'`]/g;

function collect(target, output = []) {
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(target).sort()) collect(path.join(target, entry), output);
  } else if (SOURCE_EXTENSION.test(target)) {
    output.push(target);
  }
  return output;
}

const files = ROOTS.flatMap((root) => collect(root));
const rows = files.map((file) => {
  const source = fs.readFileSync(file, 'utf8');
  return {
    file,
    pictographs: (source.match(PICTOGRAPH) || []).length,
    observers: (source.match(/new MutationObserver/g) || []).length,
    inlineStyles: (source.match(/style=|\.style\.|style\.cssText/g) || []).length,
    componentRefs: Object.fromEntries(
      ['forge-card', 'stage-card', 'menu-card', 'panel', 'tab-row']
        .map((name) => [name, (source.match(new RegExp(name, 'g')) || []).length]),
    ),
    screens: [...source.matchAll(SCREEN_ID)].map((match) => match[1]),
  };
});

const sum = (key) => rows.reduce((total, row) => total + row[key], 0);
const componentRefs = {};
for (const name of ['forge-card', 'stage-card', 'menu-card', 'panel', 'tab-row']) {
  componentRefs[name] = rows.reduce((total, row) => total + row.componentRefs[name], 0);
}

const pictographFiles = rows
  .filter((row) => row.pictographs)
  .sort((left, right) => right.pictographs - left.pictographs || left.file.localeCompare(right.file));

const screenOwners = {};
for (const row of rows) {
  for (const screen of new Set(row.screens)) {
    (screenOwners[screen] ||= []).push(row.file);
  }
}

const output = {
  generatedFrom: ROOTS,
  summary: {
    sourceFiles: rows.length,
    pictographCodePoints: sum('pictographs'),
    pictographFiles: pictographFiles.length,
    mutationObserverSites: sum('observers'),
    mutationObserverFiles: rows.filter((row) => row.observers).length,
    inlineStyleSites: sum('inlineStyles'),
    inlineStyleFiles: rows.filter((row) => row.inlineStyles).length,
    screenIds: Object.keys(screenOwners).length,
    componentRefs,
  },
  pictographsByArea: {
    index: pictographFiles.filter((row) => row.file === 'index.html').reduce((n, row) => n + row.pictographs, 0),
    screens: pictographFiles.filter((row) => row.file.startsWith('js/screens/')).reduce((n, row) => n + row.pictographs, 0),
    patches: pictographFiles.filter((row) => row.file.startsWith('js/patches/')).reduce((n, row) => n + row.pictographs, 0),
    data: pictographFiles.filter((row) => row.file.startsWith('js/data/')).reduce((n, row) => n + row.pictographs, 0),
    css: pictographFiles.filter((row) => row.file.startsWith('css/')).reduce((n, row) => n + row.pictographs, 0),
  },
  topPictographFiles: pictographFiles.slice(0, 40).map(({ file, pictographs }) => ({ file, pictographs })),
  mutationObserverFiles: rows.filter((row) => row.observers).map(({ file, observers }) => ({ file, observers })),
  screenOwners,
};

console.log(JSON.stringify(output, null, 2));
