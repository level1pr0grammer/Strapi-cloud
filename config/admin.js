module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '987654321'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'someRandomSalt'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'anotherRandomSalt'),
    },
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
});
