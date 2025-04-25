exports.sanitizeUser = function (user) {
  return {
    _id: user._id,
    name: user.name,
    userName: user.userName,
    phoneNumber: user.phoneNumber,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    skinTone: user.skinTone,
    email: user.email,
    password: user.password,
  };
};

exports.sanitizeUsers = function (users) {
  return users.map((user) => ({
    _id: user._id,
    name: user.name,
    userName: user.userName,
    phoneNumber: user.phoneNumber,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    skinTone: user.skinTone,
    email: user.email,
    password: user.password,
    //role: user.role,
  }));
};

exports.sanitizeReview = function (review) {
  return {
    _id: review._id,
    review: review.review,
    rating: review.rating,
    nurse: review.nurse,
    user: review.user,
  };
};

exports.sanitizeReviewsList = function (reviews) {
  return reviews.map(exports.sanitizeReview);
};
