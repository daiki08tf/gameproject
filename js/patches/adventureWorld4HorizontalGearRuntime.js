/* Adventure / World 4.0 — W30 Horizontal Gear runtime. Read-only. */
import { state } from '../state.js';
import { adventure4HorizontalGearCatalog,adventure4HorizontalGearByActivity,adventure4HorizontalGearSummary } from '../data/adventureWorld4HorizontalGear.js';

state.adventure4HorizontalGear=function(source=null){return source?adventure4HorizontalGearByActivity(source):adventure4HorizontalGearCatalog();};
state.adventure4HorizontalGearSummary=function(){return adventure4HorizontalGearSummary();};
