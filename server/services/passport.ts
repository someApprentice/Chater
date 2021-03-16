import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt'

import { authorize } from './authorizer';

const SECRET = process.env.SECRET;

passport.use(new Strategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET
}, (payload, done) => {
  try {
    let user = authorize(payload);

    done(null, user);
  } catch (err) {
    done(err);
  }
}));

export default passport;
