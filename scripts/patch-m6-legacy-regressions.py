from pathlib import Path


def replace_one(path, old, new):
    p = Path(path)
    text = p.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{path}: expected one replacement target, found {count}')
    p.write_text(text.replace(old, new, 1))


replace_one(
    'tests/content-pack-iv-e.test.js',
    """  assert.equal(def.chronicle.length,2);\n  assert.equal(def.chronicle[0].sourceDiscoveryId,'cp4:parallax:first-contact');\n  assert.equal(def.chronicle[1].sourceDiscoveryId,'cp4:branch-anchor:tree-sovereign');""",
    """  assert.equal(def.chronicle.length,3);\n  assert.equal(def.chronicle[0].sourceDiscoveryId,'cp4:parallax:first-contact');\n  assert.equal(def.chronicle[1].sourceDiscoveryId,'cp4:branch-anchor:tree-sovereign');\n  assert.equal(def.chronicle[2].sourceDiscoveryId,'cp4:branch-anchor:deep-green-absence');""",
)

replace_one(
    'tests/content-pack-iv-e.test.js',
    """test('CP4-5 keeps hidden histories and future traversal out of the reaction copy',()=>{\n  const data=fs.readFileSync(new URL('../js/data/contentPackIVE.js',import.meta.url),'utf8');\n  assert.doesNotMatch(data,/深緑消失域|Transcendent|超観測者|日本|東京|Earth/i);\n  assert.doesNotMatch(data,/teleport|portal|traversable|Branch XP|multiverse currency/i);\n});""",
    """test('CP4-5/M6 reveals the authored second history without exposing future histories or traversal authority',()=>{\n  const data=fs.readFileSync(new URL('../js/data/contentPackIVE.js',import.meta.url),'utf8');\n  assert.match(data,/深緑消失域/);\n  assert.doesNotMatch(data,/Transcendent|超観測者|日本|東京|Earth/i);\n  assert.doesNotMatch(data,/teleport|portal|traversable|Branch XP|multiverse currency/i);\n});""",
)

replace_one(
    'tests/content-pack-iv-f.test.js',
    """  assert.match(anchor,/syncCP4IdentityReward\\(\\);return world\\(\\)\\.discoveries/);""",
    """  assert.match(anchor,/function observeAnchor\\(/);\n  assert.match(anchor,/syncCP4IdentityReward\\(\\);/);\n  assert.match(anchor,/return world\\(\\)\\.discoveries\\[anchor\\.discoveryId\\]/);""",
)

replace_one(
    'tests/content-pack-iv-g.test.js',
    """test('CP4-7 preserves hidden branch-count and absent-history boundaries',()=>{\n  const anchor=read('js/patches/contentPackIVD.js');\n  assert.match(anchor,/deepGreenAbsentHidden:true/);\n  assert.match(anchor,/totalBranchCountHidden:true/);\n  assert.doesNotMatch(cp4Runtime,/深緑消失域/);\n});""",
    """test('CP4-7/M6 keeps total Branch count hidden while revealing only the authored second history',()=>{\n  const anchor=read('js/patches/contentPackIVD.js');\n  assert.match(anchor,/deepGreenAbsentHidden:true/);\n  assert.match(anchor,/deepGreenAbsentObserved:true/);\n  assert.match(anchor,/totalBranchCountHidden:true/);\n  assert.match(cp4Runtime,/深緑消失域/);\n  assert.doesNotMatch(cp4Runtime,/Transcendent|超観測者|日本|東京|Earth/i);\n});""",
)

replace_one(
    'tests/core-loop-clr21.test.js',
    """  // Only one Branch exists in this proof; its IDs are internally unique.\n  assert.equal(OBSERVED_BRANCHES.length, 1);\n  assert.equal(new Set(branch.stageIds).size, branch.stageIds.length);""",
    """  // M6 adds a sibling Branch, but all Branch Stage IDs remain globally unique.\n  const allBranchStageIds = OBSERVED_BRANCHES.flatMap(candidate => candidate.stageIds ?? []);\n  assert.equal(new Set(allBranchStageIds).size, allBranchStageIds.length);\n  assert.ok(OBSERVED_BRANCHES.some(candidate => candidate.id === 'deep-green-absence'));\n  assert.equal(new Set(branch.stageIds).size, branch.stageIds.length);""",
)

replace_one(
    'tests/core-loop-clr21.test.js',
    """test('CLR-21 no other Observed Branch is made playable by this proof', () => {\n  // Only 王樹領・深緑の森 carries stageIds; this proof intentionally does not\n  // generalize to any other Branch yet.\n  for (const branch of OBSERVED_BRANCHES) {\n    if (branch.id === BRANCH_ID) continue;\n    assert.equal('stageIds' in branch, false);\n  }\n});""",
    """test('CLR-21/M6 playable Branch set expands only through the two authored Ch2 Branch stage lists', () => {\n  const playable = OBSERVED_BRANCHES\n    .filter(branch => Array.isArray(branch.stageIds) && branch.stageIds.length)\n    .map(branch => branch.id)\n    .sort();\n  assert.deepEqual(playable, ['deep-green-absence', 'tree-sovereign-deep-green'].sort());\n  for (const branch of OBSERVED_BRANCHES.filter(candidate => playable.includes(candidate.id))) {\n    for (const stageId of branch.stageIds) assert.ok(findStage(stageId), `${stageId} must resolve via findStage()`);\n  }\n});""",
)

replace_one(
    'tests/observed-branches-m1.test.js',
    """  assert.equal(matches.length,1);\n  assert.equal(matches[0].id,'tree-sovereign-deep-green');""",
    """  assert.equal(matches.length,2);\n  assert.deepEqual(matches.map(branch=>branch.id),['tree-sovereign-deep-green','deep-green-absence']);""",
)

replace_one(
    'tests/unique2-balance-presentation.test.js',
    """        case 'normalEnemyDmgPenalty':\n          assert.ok(effect.power <= 0.15, `${identity.id}: normal-enemy tradeoff`);\n          break;\n        default:""",
    """        case 'normalEnemyDmgPenalty':\n          assert.ok(effect.power <= 0.15, `${identity.id}: normal-enemy tradeoff`);\n          break;\n        case 'noRecoveryDmgBonus':\n          assert.ok(effect.power > 0 && effect.power <= 0.22, `${identity.id}: absence damage bonus`);\n          break;\n        default:""",
)
