export const FACE_LANDMARK_INDEXES = {
  leftSide: {
    upper: 127,
    middle: 93,
    lower: 132,
    outer: 234,
  },

  rightSide: {
    upper: 356,
    middle: 323,
    lower: 361,
    outer: 454,
  },
};

export const EAR_DEBUG_LANDMARK_INDEXES = [
  FACE_LANDMARK_INDEXES.leftSide.upper,
  FACE_LANDMARK_INDEXES.leftSide.middle,
  FACE_LANDMARK_INDEXES.leftSide.lower,
  FACE_LANDMARK_INDEXES.leftSide.outer,

  FACE_LANDMARK_INDEXES.rightSide.upper,
  FACE_LANDMARK_INDEXES.rightSide.middle,
  FACE_LANDMARK_INDEXES.rightSide.lower,
  FACE_LANDMARK_INDEXES.rightSide.outer,
];