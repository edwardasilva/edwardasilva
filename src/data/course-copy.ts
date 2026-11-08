/**
 * src/data/course-copy.ts
 * Course Copy
 *
 * Author: Edward Silva
 * Creation Date: 07 November, 2026
 * Last Update: 07 November, 2026
 *
 * The coursework page's course descriptions. Each one follows the catalog text in resume-data.json,
 * in plain English, with a line on where the work showed up. The catalog text stays in that file.
 *
 * File Structure:
 * - C_COURSE_COPY: description by course code
 * - getCourseCopy: a course's description, falling back to the catalog text
 *
 * Where this file is used within the repository:
 * - src/components/CourseEntry.astro
 *
 * Usage:
 * $ `npm run dev` : Runs at build time
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 * NOTICE: This file contains personal biographical data.
 * It is strictly excluded from the repository's MIT License and
 * may not be reproduced, distributed, or modified without permission.
 */

import type { Course } from './types';

const C_COURSE_COPY: Record<string, string> = {
    'EENG 411':
        'How to represent discrete-time signals and systems in the time, z-, and frequency domains. Each view helps you read a signal, design a filter, or sample correctly. It also covers sigma-delta conversion, multi-rate processing, and spectral analysis. The pitch tracker uses the last two. It decimates its audio to 8 kHz and finds pitch with an FFT.',
    'EENG 519':
        'Getting useful information out of raw sensor data when the signal is uncertain, with navigation, localization, and mapping as common uses. It covers random signals, the discrete-time Kalman filter and when it is optimal, filter divergence, and nonlinear estimation. My final project put an EKF and a UKF on the EMBR damper.',
    'EENG 417':
        'Control design built around observers, from the first open-loop experiments to the final implementation. It covers frequency-domain feedback design, sensitivity and fundamental limits, state space realization, and system identification. The gantry crane project runs through most of this, from fitting the cable length to a state-space controller with an observer.',
    'EENG 383':
        'Building systems from analog and digital parts around a microcontroller. You use timers, PWM, ADCs, serial links, and interrupts, all in C or C++. The course also covers fixed-point math, direct digital synthesis, lookup tables, and row scanning. The Arduino code on the maze robot and the solar tracker uses the same parts.',
    'EENG 393':
        'Taking a printed circuit board from concept through design, fabrication, and soldering. It teaches good design practice along with the real-world limits that manufacturing puts on a circuit.',
    'EENG 350':
        'A semester-long build around one challenge problem that changes every year. Teams design and prototype a full system, build it from modular subsystems, and integrate them, using concepts from across the electrical engineering courses. Our challenge became the autonomous maze robot, and I built its vision stack.',
    'EENG 307':
        'Modeling linear electrical, mechanical, fluid, and thermal systems through energy flow, then analyzing their response in the time and frequency domains. Feedback design, including PID, is done both by hand and by computer. The frequency-domain tools here are the ones behind the gantry crane margins.',
    'EENG 391':
        'Computational methods for everyday electrical engineering: plotting signals and data, analyzing and implementing digital filters, computing integrals, solving differential equations, and simulating dynamical systems. I kept using MATLAB and Simulink on later controls and estimation projects.',
    'EENG 385':
        'The large-signal and small-signal behavior of op-amps, diodes, bipolar junction transistors, and field effect transistors, plus the frequency response of standard circuits. Labs test how well your analysis matches the real circuit.',
    'EENG 386':
        "Electromagnetic theory with a practical focus. It starts with vector calculus and builds from Coulomb's and Biot-Savart laws up to Maxwell's equations. Then it covers generators, motors, transmission lines, impedance matching, and the Smith chart. I used Biot-Savart again to model the electromagnet on the EMBR damper.",
    'EENG 282':
        "An engineering analysis of DC and AC circuits, both single-phase and three-phase. It covers Ohm's and Kirchhoff's laws, Thevenin and Norton equivalents, RC and RL transients, phasors, and power.",
    'EENG 284':
        'Digital logic, from Karnaugh maps and Boolean algebra to decoders, adders, counters, registers, and finite state machines. You write designs in a hardware description language and download them onto FPGAs. Mine was Verilog.',
    'EENG 310':
        'How signals carry information and noise over time, with examples from filtering, audio and image processing, and communications. It covers convolution, Fourier series and transforms, sampling, modulation, and z-transforms. The pitch tracker uses the sampling and Fourier analysis from this class.',
    'EENG 311':
        'Signals and noise in electrical systems, with examples from radar and communications. Topics include information theory, signal-to-noise ratio, random variables, matched filters, coding and entropy, power spectral density, and bit error rate. The random-signal material comes back in Kalman filtering.',
    'EENG 389':
        "An engineering analysis of electrical machines: three-phase circuits, magnetic circuits, transformers, synchronous and induction motors, and DC machines, with lab tests of how they behave. Magnetic circuits came up again in the EMBR damper's flux path.",
    'CSCI 406':
        'Reasoning about whether an algorithm is correct, and how fast it runs in theory and in practice. It covers advanced sorting, dynamic programming, backtracking, graph algorithms, network flows, and NP-completeness.',
    'CSCI 341':
        'How computers work at the machine level: machine instructions, assembly language, operating system calls, computer arithmetic, performance, processor design, and pipelining. The assembly I wrote was RISC-V.',
    'CSCI 306':
        'Software engineering process and object-oriented design: Agile, test-driven development, UML diagrams, use cases, and design patterns. The coursework pushes version control and code review. I later ran Git for the pitch tracker and maze robot teams.',
    'CSCI 220':
        'Designing and building hash tables, trees, heaps, and graphs, analyzing their operations, and writing algorithms on them, such as graph search and minimum spanning trees. Everything is implemented in C++.',
    'CSCI 410':
        'You build an entire modern computer from the ground up, from logic gates to an assembler, a virtual machine, a compiler, and an operating system. It pulls the rest of computer science together. My tools were Verilog, C++, and Python.',
    'CSCI 358':
        'An introduction to discrete mathematics and algebraic structures. It covers formal logic, proofs, recursion, algorithm analysis, sets and combinatorics, relations, functions, and matrices. It also covers Boolean algebra, trees, graphs, finite-state machines, and regular languages.',
    'CSCI 200':
        'C++ from the start: managing memory at run time, object-oriented programming, and building algorithms from data structures and abstraction. Recursive data structures and the first software design principles come in along the way, all from the command line.',
    'CSCI 274':
        "How to work from the Linux command line: ssh, the file system, editors, compiling, redirection, searching, processes, permissions, compression, networking, and Bash scripts. My solar tracker's upload script is Bash.",
    'CSCI 290':
        'Problem-solving patterns from technical interviews and programming competitions, with more advanced data structures and algorithms. The focus is on complexity, because each problem has to be solved in a finite amount of time.',
};

/**
 * @brief Gets the description to show for a course
 * @param course Course from resume-data.json
 * @return The site's description, or the catalog text when it has none
 */
export function getCourseCopy(course: Course): string {
    return C_COURSE_COPY[course.code] ?? course.description;
}
