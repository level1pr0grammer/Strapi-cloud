module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', '35.198.199.2'), // Public IP of your Cloud SQL instance
      port: env.int('DATABASE_PORT', 5432),      // Port should be an integer
      user: env('DATABASE_USERNAME', 'postgres'),
      password: env('DATABASE_PASSWORD', 'fiatjwin'),
      database: env('DATABASE_NAME', 'postgresql'), // Use the actual database name, NOT the instance connection name
      ssl: {
        rejectUnauthorized: false,  // Typically set to false for Cloud SQL
      },
    },
  },
});
