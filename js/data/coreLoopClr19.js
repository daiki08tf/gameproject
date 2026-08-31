/* Core Loop Rework — CLR-19 Full Region Hunt Generalization
   Region profiles decide which canonical World3 Regions use the shared CLR Hunt
   route. Combat/reward/save authorities remain in their existing systems. */
import { WORLD3_REGIONS } from './world3Regions.js';

const PROFILE_LABELS=Object.freeze({
  frontier:'開拓辺境 Hunt',
  elemental:'四境連峰 Hunt',
  fracture:'境界裂域 Hunt',
  'last-mortal':'人界最奥 Hunt',
  veil:'The Veil Hunt',
  'outer-world':'外縁世界 Hunt',
  'reverse-observation':'逆観測域 Hunt',
  'shared-observation':'共観測域 Hunt',
});

export const CLR19_HUNT_REGION_PROFILES=Object.freeze(Object.fromEntries(
  WORLD3_REGIONS.map(region=>[
    region.id,
    Object.freeze({
      regionId:region.id,
      label:PROFILE_LABELS[region.id]||`${region.name} Hunt`,
      enabled:true,
      routeKind:'shared-combat-first',
      preserveLegacyNodes:true,
    }),
  ]),
));

export function clr19HuntRegionProfile(regionId){
  return CLR19_HUNT_REGION_PROFILES[regionId]||null;
}

export function clr19RegionUsesSharedHunt(region){
  const profile=clr19HuntRegionProfile(region?.id);
  return !!(profile?.enabled&&profile.routeKind==='shared-combat-first');
}
