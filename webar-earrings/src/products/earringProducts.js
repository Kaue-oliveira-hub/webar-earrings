export const EARRING_ANCHOR_PRESETS = {
  LOBE_DROP: "lobe-drop",
  LOBE_CENTER: "lobe-center",
  LOBE_HOOP: "lobe-hoop",
};

export const EARRING_TYPES = {
  STUD: "stud",
  CHAIN: "chain",
  HOOP: "hoop",
};

export const EARRING_PRODUCTS = [
  {
    id: "stone-stud",
    name: "Pendiente piedra",
    type: EARRING_TYPES.STUD,
    anchorPreset: EARRING_ANCHOR_PRESETS.LOBE_CENTER,

    variants: [
      {
        id: "blue",
        name: "Azul",
        imageUrl: "/earrings/stud-blue.png",
        type: EARRING_TYPES.STUD,
        anchorPreset: EARRING_ANCHOR_PRESETS.LOBE_CENTER,

        anchor: {
          x: 0.5,
          y: 0.5,
        },

        scale: 0.04,
        rotation: 0,

        sideAdjustments: {
          right: {
            anchor: {
              x: 0.5,
              y: 0.5,
            },
            scale: 0.08,
            rotation: 0,
          },

          left: {
            anchor: {
              x: 0.5,
              y: 0.5,
            },
            scale: 0.08,
            rotation: 0,
          },
        },
      },

      {
        id: "red",
        name: "Rojo",
        imageUrl: "/earrings/stud-red.png",
        type: EARRING_TYPES.STUD,
        anchorPreset: EARRING_ANCHOR_PRESETS.LOBE_CENTER,

        anchor: {
          x: 0.5,
          y: 0.5,
        },

        scale: 0.04,
        rotation: 0,

        sideAdjustments: {
          right: {
            anchor: {
              x: 0.5,
              y: 0.5,
            },
            scale: 0.08,
            rotation: 0,
          },

          left: {
            anchor: {
              x: 0.5,
              y: 0.5,
            },
            scale: 0.08,
            rotation: 0,
          },
        },
      },
    ],
  },

  {
    id: "gold-chain",
    name: "Pendiente cadena",
    type: EARRING_TYPES.CHAIN,
    anchorPreset: EARRING_ANCHOR_PRESETS.LOBE_DROP,

    variants: [
      {
        id: "gold",
        name: "Dorado",
        imageUrl: "/earrings/chain-gold.png",
        type: EARRING_TYPES.CHAIN,
        anchorPreset: EARRING_ANCHOR_PRESETS.LOBE_DROP,

        anchor: {
          x: 0.5,
          y: 0.02,
        },

        scale: 0.15,
        rotation: 0,

        sideAdjustments: {
          right: {
            anchor: {
              x: 0.5,
              y: 0.02,
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

  {
    id: "gold-hoop",
    name: "Aro dorado",
    type: EARRING_TYPES.HOOP,
    anchorPreset: EARRING_ANCHOR_PRESETS.LOBE_HOOP,

    variants: [
      {
        id: "gold",
        name: "Dorado",
        imageUrl: "/earrings/hoop-gold.png",
        type: EARRING_TYPES.HOOP,
        anchorPreset: EARRING_ANCHOR_PRESETS.LOBE_HOOP,

        anchor: {
          x: 0.48,
          y: 0.18,
        },

        scale: 0.16,
        rotation: 0,

        sideAdjustments: {
          right: {
            anchor: {
              x: 0.48,
              y: 0.18,
            },
            scale: 0.16,
            rotation: 0,
          },

          left: {
            anchor: {
              x: 0.52,
              y: 0.18,
            },
            scale: 0.16,
            rotation: 0,
          },
        },
      },
    ],
  },
];

export const DEFAULT_EARRING_PRODUCT = EARRING_PRODUCTS[0];
export const DEFAULT_EARRING_VARIANT = DEFAULT_EARRING_PRODUCT.variants[0];

export function getAllEarringVariants() {
  return EARRING_PRODUCTS.flatMap((product) =>
    product.variants.map((variant) => ({
      ...variant,
      productId: product.id,
      productName: product.name,
    })),
  );
}