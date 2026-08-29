import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BLACK_MARKET,MARKET2_UNLOCK_HALL_LEVEL,MARKET_OFFERS,TRADE_ROUTES,marketCanPay,marketOfferAvailable,tradeRequirementMet,tradeRouteDiscovered } from '../js/data/settlementMarket.js';

test('Settlement S6 Market 2.0 unlocks at trading-town rank with unique deterministic routes',()=>{
 assert.equal(MARKET2_UNLOCK_HALL_LEVEL,10);
 assert.ok(TRADE_ROUTES.length>=4);
 assert.equal(new Set(TRADE_ROUTES.map(r=>r.id)).size,TRADE_ROUTES.length);
 for(const route of TRADE_ROUTES){assert.ok(route.name&&route.region&&route.merchant);assert.ok(Object.keys(route.discover||{}).length);assert.ok(Object.keys(route.secureCost||{}).length);}
});

test('trade routes require adventure achievements and explicit securing',()=>{
 const green=TRADE_ROUTES.find(r=>r.id==='greenway');
 assert.equal(tradeRouteDiscovered(green,{hall:10,stageClears:7}),false);
 assert.equal(tradeRouteDiscovered(green,{hall:10,stageClears:8}),true);
 assert.equal(marketOfferAvailable(MARKET_OFFERS.find(o=>o.routeId==='greenway'),{securedRoutes:[]}),false);
 assert.equal(marketOfferAvailable(MARKET_OFFERS.find(o=>o.routeId==='greenway'),{securedRoutes:['greenway']}),true);
});

test('market offers use existing Gold/materials/processed goods and have finite stock',()=>{
 assert.ok(MARKET_OFFERS.every(o=>o.stock>=1));
 for(const offer of MARKET_OFFERS){assert.ok(!offer.cost.currency&&!offer.reward.currency);}
 assert.equal(marketCanPay({gold:100,goods:{ration:2}},{gold:100,goods:{ration:2},materials:{}}),true);
 assert.equal(marketCanPay({gold:101},{gold:100,goods:{},materials:{}}),false);
});

test('black market is secret optional content, not a normal progression gate',()=>{
 assert.ok(BLACK_MARKET.discover.rareSeen>0&&BLACK_MARKET.discover.abyssBestDepth>0);
 assert.equal(tradeRequirementMet(BLACK_MARKET.discover,{hall:20,rareSeen:99,abyssBestDepth:0}),false);
 assert.equal(tradeRequirementMet(BLACK_MARKET.discover,{hall:20,rareSeen:99,abyssBestDepth:999}),true);
});

test('Market 2.0 wiring stays inside Settlement and has no timer/daily refresh contract',()=>{
 const nav=fs.readFileSync(new URL('../js/patches/homeNavigation.js',import.meta.url),'utf8');
 const runtime=fs.readFileSync(new URL('../js/patches/settlementMarket.js',import.meta.url),'utf8');
 const ui=fs.readFileSync(new URL('../js/patches/settlementMarketUi.js',import.meta.url),'utf8');
 assert.match(nav,/settlementMarket\.js/);assert.match(nav,/settlementMarketUi\.js/);
 assert.match(runtime,/securedRoutes/);assert.match(runtime,/purchases/);assert.match(runtime,/secureSettlementTradeRoute/);assert.match(runtime,/buySettlementMarketOffer/);
 assert.match(ui,/settlementMarketBtn/);assert.match(ui,/data-trade-route/);assert.match(ui,/data-market-offer/);assert.match(ui,/data-black-market/);
 assert.doesNotMatch(runtime,/Date\.now|setInterval|daily|resetAt|refreshAt/i);
});
