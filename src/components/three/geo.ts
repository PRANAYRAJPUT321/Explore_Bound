import * as THREE from "three";
import { LAND_MASK_B64, LAND_MASK_HEIGHT, LAND_MASK_WIDTH } from "./landmask";

export const DEG = Math.PI / 180;

/** Lat/lng → point on a sphere (same convention as three-globe / equirectangular maps). */
export function latLngToVector3(lat: number, lng: number, radius = 1, target = new THREE.Vector3()) {
  const phi = (90 - lat) * DEG;
  const theta = (lng + 180) * DEG;
  return target.set(-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
}

/** Y-rotation that brings a longitude to face the camera (+Z). */
export function spinForLongitude(lng: number) {
  return Math.atan2(-Math.cos(lng * DEG), -Math.sin(lng * DEG));
}

let bits: Uint8Array | null = null;
function maskBits() {
  if (!bits) {
    const bin = atob(LAND_MASK_B64);
    bits = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bits[i] = bin.charCodeAt(i);
  }
  return bits;
}

export function isLand(lat: number, lng: number) {
  const b = maskBits();
  const x = (((Math.floor(((lng + 180) / 360) * LAND_MASK_WIDTH) % LAND_MASK_WIDTH) + LAND_MASK_WIDTH) % LAND_MASK_WIDTH);
  const y = Math.min(LAND_MASK_HEIGHT - 1, Math.max(0, Math.floor(((90 - lat) / 180) * LAND_MASK_HEIGHT)));
  const i = y * LAND_MASK_WIDTH + x;
  return (b[i >> 3] & (1 << (i & 7))) !== 0;
}

/** Evenly spaced land dots (lat/lng pairs). */
export function landDots(stepDeg: number) {
  const out: [number, number][] = [];
  for (let lat = -78; lat <= 82; lat += stepDeg) {
    const ring = Math.max(1, Math.round((360 * Math.cos(lat * DEG)) / stepDeg));
    for (let i = 0; i < ring; i++) {
      const lng = -180 + (i / ring) * 360 + (lat * 7.3) % stepDeg;
      if (isLand(lat, lng)) out.push([lat, lng]);
    }
  }
  return out;
}

export function angularDistance(aLat: number, aLng: number, bLat: number, bLng: number) {
  const a = Math.sin(((bLat - aLat) * DEG) / 2) ** 2 + Math.cos(aLat * DEG) * Math.cos(bLat * DEG) * Math.sin(((bLng - aLng) * DEG) / 2) ** 2;
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) / DEG;
}
