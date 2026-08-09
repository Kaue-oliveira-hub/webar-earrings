# WebAR Guided Virtual Try-On for Earrings

Mobile-first WebAR prototype for guided virtual try-on of earrings in the browser.

This project demonstrates a lightweight ecommerce virtual try-on experience using the device camera, MediaPipe Face Landmarker and Canvas 2D rendering. The user aligns their earlobe with a visual guide, takes a photo, and can preview different earring variants on the captured image.

## Project category

- Ecommerce WebAR / virtual try-on
- Reusable product visualization prototype
- Mobile-first browser-based AR experience

## Problem solved

Buying earrings online can be difficult because customers cannot easily understand product size, visual fit or style on their own face.

This prototype reduces uncertainty by allowing users to preview earrings directly through the browser, without installing an app.

## Current level

MVP prototype.

The project is not a production-grade ear tracking system. It is a guided virtual try-on experience designed to validate UX, product visualization and ecommerce integration potential.
but the goal is an advanced live try-on
## Demo flow

1. User opens the try-on experience.
2. Camera starts directly.
3. User slightly turns their head.
4. User aligns the earlobe with the guide point.
5. User takes a photo.
6. The selected earring is rendered on the captured image.
7. User can switch between earring variants.
8. User can retake the photo.

## Technologies

- Vite
- JavaScript
- MediaPipe Tasks Vision
- Face Landmarker
- Canvas 2D
- CSS mobile-first UI
- PNG transparent product assets

## Tracking approach

The prototype uses MediaPipe Face Landmarker to detect the face and estimate which side of the face is visible.

The earring is not attached to a real anatomical earlobe landmark. Instead, the system uses a guided target point. The user aligns the earlobe with this point before taking the photo.

This approach is more stable for an MVP because MediaPipe Face Landmarker does not provide a precise earlobe or ear piercing landmark.

## Product rendering

The project supports:

- Single PNG earrings
- Product variants
- Per-side position, scale and rotation adjustments
- Layered rendering for hoop earrings
- Simple cut mask to simulate front/back depth
- Soft shadow to reduce the “flat PNG” effect

## Current product types

- Stud earrings
- Chain/drop earrings
- Hoop earrings with layered rendering

## File structure

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