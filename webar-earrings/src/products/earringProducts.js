export const EARRING_PRODUCTS = [
  {
    id: "test-earring",
    name: "Pendiente de prueba",
    variants: [
      {
        id: "default",
        name: "Versión de prueba",
        imageUrl: "/earrings/earring1.png",
        type: "drop",

        anchor: {
          x: 0.5,
          y: 0.02,
        },

        scale: 0.15,
        rotation: 0,

        sideAdjustments: {
          right: {
            anchor: {
              x: 0.1,
              y: 0.1,
            },
            scale: 0.15,
            rotation: 0,
          },

          left: {
            anchor: {
              x: 0.5,
              y: 0.02,
            },
            scale: 0.15,
            rotation: 0,
          },
        },
      },
    ],
  },
];

export const DEFAULT_EARRING_VARIANT = EARRING_PRODUCTS[0].variants[0];