from pathlib import Path

path = Path('tests/observed-branches-m6.test.js')
text = path.read_text()
old = """  for(const stageId of branch.stageIds){
    const stage=findStage(stageId);
    assert.ok(stage,`${stageId} must resolve through findStage()`);
    assert.equal(stage.observedBranchId,BRANCH_ID);
    for(const drop of stage.dropTable)assert.ok(getItem(drop.itemId),`${drop.itemId} must resolve through getItem()`);
  }
"""
new = """  for(const stageId of branch.stageIds){
    const resolved=findStage(stageId);
    assert.ok(resolved,`${stageId} must resolve through findStage()`);
    const stage=resolved.stage;
    assert.equal(stage.observedBranchId,BRANCH_ID);
    for(const drop of stage.dropTable)assert.ok(getItem(drop.itemId),`${drop.itemId} must resolve through getItem()`);
  }
"""
if text.count(old) != 1:
    raise SystemExit(f'expected one generated findStage assertion block, found {text.count(old)}')
path.write_text(text.replace(old, new, 1))
