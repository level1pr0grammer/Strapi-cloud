module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      filename: env('DATABASE_FILENAME', '.tmp/data.db'),
    },
    useNullAsDefault: true,
  },
});