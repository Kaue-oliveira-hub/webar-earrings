# WebAR Guided Virtual Try-On for Earrings

A mobile-first WebAR prototype for ecommerce, built to let users preview earrings directly in the browser using the device camera.

**Live demo:** https://webar-earrings.vercel.app/

## Project overview

This project is a functional MVP for a guided virtual try-on experience focused on earrings.

The prototype uses the front camera, a guided ear alignment interface, MediaPipe Face Landmarker and Canvas 2D rendering to place transparent PNG earrings over the visible ear after capturing a guided photo.

The goal is to explore how lightweight WebAR experiences can reduce buyer uncertainty in ecommerce product pages, especially for accessories such as earrings, piercings and jewellery.

## Level

**Functional MVP / commercial prototype**

This is not a production-ready automatic ear tracking system. It is a guided try-on prototype designed to validate UX, product presentation and technical feasibility in a browser-based ecommerce context.

## Core features

- Mobile-first virtual try-on flow
- Camera access from browser
- Guided ear alignment interface
- Loading spinner while camera initializes
- Photo capture workflow
- Earring rendering over captured image
- Support for multiple PNG earring variants
- Left/right ear side recalculation on each capture
- Retake photo flow
- Lightweight Canvas 2D rendering
- Product variants configured from JavaScript data

## Tech stack

- Vite
- JavaScript
- MediaPipe Face Landmarker
- Canvas 2D
- HTML/CSS
- Vercel

## User flow

1. User opens the ecommerce-style product page.
2. User clicks **Probar pendiente**.
3. The camera modal opens.
4. A loading spinner appears while the camera is prepared.
5. The user places the ear inside the visual guide.
6. The user captures a photo.
7. The selected earring is rendered over the visible ear.
8. The user can switch between earring variants.
9. The user can retake the photo and try the other ear.

## Tracking approach

The MVP uses MediaPipe Face Landmarker to detect the face and estimate orientation. Because MediaPipe Face Landmarker does not provide precise earlobe landmarks, this project uses a guided alignment approach.

Instead of claiming automatic earlobe detection, the interface asks the user to place the ear inside a visual target. The system then renders the selected earring based on the guided target and recalculates the visible side on each capture.

This approach keeps the experience lightweight and browser-friendly while being honest about the limits of the current tracking method.

## Product rendering

The earrings are transparent PNG assets rendered on a Canvas 2D layer.

Each product variant can define:

- image URL
- scale
- anchor point
- rotation
- side adjustments
- thumbnail scale

This makes it possible to test different earring styles without changing the main rendering logic.

## Current product types

- Stud earrings
- Chain/drop earrings
- Long drop earrings

## Architecture

```text
src/
├── camera/
│   └── cameraController.js
├── capture/
│   └── photoCapture.js
├── config/
│   └── tryOnConfig.js
├── products/
│   └── earringProducts.js
├── rendering/
│   ├── earringRenderer.js
│   └── landmarkDebugRenderer.js
├── tracking/
│   ├── earEstimator.js
│   ├── faceAnalyzer.js
│   ├── faceLandmarkIndexes.js
│   ├── guidedEarTarget.js
│   └── poseQuality.js
├── main.js
└── style.css

public/
└── earrings/