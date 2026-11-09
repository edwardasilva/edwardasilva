/**
 * src/lib/damper.ts
 * Damper Flow Model
 *
 * Author: Edward Silva
 * Creation Date: 07 November, 2026
 * Last Update: 07 November, 2026
 *
 * Evaluates the plane Poiseuille model from the EMBR critical design report: the annular gap is treated
 * as flow between flat plates, and the pressure drop across it pushes on the piston head. Geometry and
 * fluid values come from the report's MATLAB scripts. Like those scripts, it leaves out the magnetic
 * field, so it gives the least-damped force.
 *
 * File Structure:
 * - Constants: shared geometry and fluid
 * - C_V1 and C_V2: the two designs
 * - dampingForce: force at a shaft velocity
 *
 * Where this file is used within the repository:
 * - src/components/DamperFigure.astro
 *
 * Usage:
 * $ `npm run dev` : Runs in the browser, and at build time for the checks
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 * NOTICE: This file contains personal biographical data.
 * It is strictly excluded from the repository's MIT License and
 * may not be reproduced, distributed, or modified without permission.
 */

const C_ID_TUBE = 20.2e-3;
const C_D_ROD = 10e-3;
const C_MU = 0.055;

export interface PistonGeometry {
    diameter: number;
    length: number;
}

export const C_V1: PistonGeometry = { diameter: 16.324e-3, length: 4.5e-3 };
export const C_V2: PistonGeometry = { diameter: 19.2e-3, length: 20e-3 };

/**
 * @brief Computes the gap between the piston and the tube
 * @param geometry Piston geometry
 * @return Radial gap in meters
 */
export function radialGap({ diameter }: PistonGeometry): number {
    return (C_ID_TUBE - diameter) / 2;
}

/**
 * @brief Evaluates the damping force
 * @param velocity Rebound shaft velocity in meters per second
 * @param geometry Piston geometry
 * @return Force in newtons
 */
export function dampingForce(velocity: number, geometry: PistonGeometry): number {
    const areaRod = (Math.PI / 4) * C_D_ROD ** 2;
    const areaPiston = (Math.PI / 4) * geometry.diameter ** 2;
    const width = (Math.PI * (C_ID_TUBE + geometry.diameter)) / 2;
    const flow = velocity * areaRod;
    const gap = radialGap(geometry);
    const gradient = (12 * flow * C_MU) / (gap ** 3 * width);

    return gradient * geometry.length * areaPiston;
}
