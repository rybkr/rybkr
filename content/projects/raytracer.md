+++
title = 'CPU Raytracer'
date = '2025-03-17'
tags = ["C++", "Algorithms"]
stack = ["C++"]
summary = "A from-scratch C++ raytracer with reflection, refraction, and Monte Carlo path tracing — no graphics libraries."
thumbnail = "/images/projects/raytracer/thumb.png"
redirect = "https://github.com/rybkr/raytracer"
draft = false
+++

**Links:** [GitHub](https://github.com/rybkr/raytracer)

## Overview

A raytracer built entirely from scratch in C++ with no graphics libraries. It implements the core rendering pipeline—ray-scene intersection, shading, and image output—from first principles.

## Features

- **Reflection and refraction**: Recursive ray tracing for mirrors and transparent materials with Fresnel blending
- **Monte Carlo path tracing**: Stochastic sampling for soft shadows, diffuse interreflection, and global illumination
- **Geometric primitives**: Spheres, planes, and triangle meshes
- **Materials**: Lambertian, metallic, and dielectric surfaces with configurable properties
- **Multi-threaded rendering**: Parallel scanline processing for faster convergence

## What I Learned

- Practical application of linear algebra and probability in rendering
- Monte Carlo integration and importance sampling
- Balancing physical accuracy against render time
