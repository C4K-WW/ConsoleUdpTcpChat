const { Pool } = require('pg');
connectionString = 'postgresql://dbstudent:dbstudent@localhost:5432/list';

const pool = new Pool({ connectionString: connectionString })
module.exports = { pool };