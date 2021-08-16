const jwt = require('jsonwebtoken');

const secret = process.env.SECRET_TOKEN || 'secret';
const expiration = process.env.TOKEN_EXPIRY || '2h';

module.exports = {
  authMiddleware: function ({ req }) {
    // allows token to be sent via req.body, req.query, or headers
    let token = req.body.token || req.query.token || req.headers.authorization;

    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    if (!token) {
      return req;
    }

    console.log(token);

    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      console.log('Invalid token');
    }

    return req;
  },
  expressAuthMiddleware: (req, res, next) => {
    // allows token to be sent via req.body, req.query, or headers

    let token = req.headers.authorization; 
    console.log(token);
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    if (!token) {
      return req;
    }

    jwt.verify(token, secret, { maxAge: expiration }, (err, {data}) => {
      if (err) {
        console.log(err);
      }
      req.user = data;
      next()
    });
  },
  signToken: function ({ firstName, email, _id }) {
    const payload = { firstName, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
