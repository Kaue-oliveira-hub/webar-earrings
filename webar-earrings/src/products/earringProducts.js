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
        id: "stud-blue",
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
            scale: 0.04,
            rotation: 0,
          },

          left: {
            anchor: {
              x: 0.5,
              y: 0.5,
            },
            scale: 0.04,
            rotation: 0,
          },
        },
      },

      {
        id: "stud-red",
        name: "Rojo",
        imageUrl: "/earrings/stud-red.png",
        type: EARRING_TYPES.STUD,
        anchorPreset: EARRING_ANCHOR_PRESETS.LOBE_CENTER,

        anchor: {
          x: 0.45,
          y: 0.5,
        },

        scale: 0.04,
        rotation: 0,

        sideAdjustments: {
          right: {
            anchor: {
              x: 0.45,
              y: 0.5,
            },
            scale: 0.04,
            rotation: 0,
          },

          left: {
            anchor: {
              x: 0.55,
              y: 0.5,
            },
            scale: 0.04,
            rotation: 0,
          },
        },
      },
    ],
  },

  {
    id: "chain-gold",
    name: "Pendiente cadena",
    type: EARRING_TYPES.CHAIN,
    anchorPreset: EARRING_ANCHOR_PRESETS.LOBE_DROP,

    variants: [
      {
        id: "chain-gold",
        name: "Cadena",
        imageUrl: "/earrings/chain-gold.png",
        type: EARRING_TYPES.CHAIN,
        anchorPreset: EARRING_ANCHOR_PRESETS.LOBE_DROP,

        anchor: {
          x: 0.5,
          y: 0.2,
        },

        scale: 0.5,
        rotation: 0,

        sideAdjustments: {
          right: {
            anchor: {
              x: 0.5,
              y: 0.2,
            },
            scale: 0.5,
            rotation: 0,
          },

          left: {
            anchor: {
              x: 0.45,
              y: 0.2,
            },
            scale: 0.5,
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
        id: "hoop-gold",
        name: "Aro Dorado",
        imageUrl: "/earrings/hoop-gold.png",
        type: EARRING_TYPES.HOOP,
        anchorPreset: EARRING_ANCHOR_PRESETS.LOBE_HOOP,

        anchor: {
          x: 0.45,
          y: 0.18,
        },

        scale: 0.06,
        rotation: 0,

        sideAdjustments: {
          right: {
            anchor: {
              x: 0.45,
              y: 0.18,
            },
            scale: 0.06,
            rotation: 0,
          },

          left: {
            anchor: {
              x: 0.5,
              y: 0.18,
            },
            scale: 0.06,
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