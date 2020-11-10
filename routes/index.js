const util = require('util');

module.exports = (app, mysqlConnection) => {
  // OP in the chat
  const query = util.promisify(mysqlConnection.query).bind(mysqlConnection);

  app.get('/getInterviews', async (req, res) => {
    let data = await query('select * from Interviews');
    res.json(data);
  });
};
