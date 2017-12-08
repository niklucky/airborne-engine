module.exports = {
  protocol: 'https',
  apiHost: 'example.com',
  host: '127.0.0.1',
  port: 3008,
  debug: true,
  db: {
    mysql: {
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '12345',
      database: 'Airborne_test',
      driver: 'mysql',
      charset: 'utf8mb4',
      dateStrings: true
    }
  },
  sources: {
    orders: 'orders',
    users: 'users'
  },
  auth: {
    host: 'localhost',
    port: 3042
  },
};
