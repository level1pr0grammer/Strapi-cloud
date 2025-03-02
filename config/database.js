module.exports = ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite'); // ค่าเริ่มต้นเป็น SQLite

  const connections = {
    sqlite: {
      client: 'sqlite',
      connection: {
        filename: env('DATABASE_FILENAME', '.tmp/data.db'),
      },
      useNullAsDefault: true,
    },
    postgres: {
      client: 'postgres',
      connection: {
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: env.bool('DATABASE_SSL', false),
      },
    },
  };

  return {
    connection: {
      ...connections[client], // ใช้ค่าตาม DATABASE_CLIENT
      debug: false,
    },
  };
};
