const util = require('util');
const express = require('express');
const mysql = require('mysql');
const moment = require('moment');
const router = express.Router();
const { scheduleEmail } = require('../handlers/EmailScheduler');

const connectDB = require('../database/index.js');
const EmailScheduler = require('../handlers/EmailScheduler');
const mysqlConnection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});
connectDB.connect(mysqlConnection);

const query = util.promisify(mysqlConnection.query).bind(mysqlConnection);

router.get('/getInterviews', async (req, res) => {
  let interviewsList = await query('select * from Interviews');
  let { date } = req.query;
  let currentInterviewList = [];
  interviewsList.forEach((interview) => {
    let curr_date = new Date(parseInt(interview.start_time))
      .toISOString()
      .split('T')[0];
    if (curr_date == date) {
      currentInterviewList.push(interview);
    }
  });
  if (currentInterviewList[0] == null) res.json([]);
  res.json(currentInterviewList);
});

router.get('/is-user-available', async (req, res) => {
  let { start_time, end_time, email, user_role } = req.query;
  let user = await query(`select * from User where email="${email}"`);
  if (user[0]?.user_role !== user_role || user?.length == 0) {
    res.json({
      status: 'err',
    });
  }
  start_time = parseInt(start_time);
  end_time = parseInt(end_time);
  let userInterviewsList = await query(
    `select * from Interviews where ${user_role}="${email}"`
  );

  userInterviewsList.map((interview) => {
    let interview_start_time = parseInt(interview.start_time);
    let interview_end_time = parseInt(interview.end_time);

    if (start_time <= interview_start_time && end_time >= interview_end_time) {
      res.json({
        status: 'err',
      });
    } else if (
      start_time >= interview_start_time &&
      end_time <= interview_end_time
    ) {
      res.json({
        status: 'err',
      });
    } else if (
      start_time <= interview_start_time &&
      end_time <= interview_end_time &&
      end_time >= interview_start_time
    ) {
      res.json({
        status: 'err',
      });
    } else if (
      start_time >= interview_start_time &&
      start_time <= interview_end_time &&
      end_time >= interview_end_time
    ) {
      res.json({
        status: 'err',
      });
    }
  });

  res.json({
    status: 'ok',
  });
});
router.get('/is-user-modification-available', async (req, res) => {
  let { start_time, end_time, email, user_role, id } = req.query;
  let user = await query(`select * from User where email="${email}"`);
  if (user[0]?.user_role !== user_role || user?.length == 0) {
    res.json({
      status: 'err',
    });
  }
  start_time = parseInt(start_time);
  end_time = parseInt(end_time);
  let userInterviewsList = await query(
    `select * from Interviews where ${user_role}="${email}"`
  );
  let newuserInterviewsList = [];
  userInterviewsList.forEach((interview) => {
    if (interview.id != id) newuserInterviewsList.push(interview);
  });
  console.log(newuserInterviewsList);

  if (newuserInterviewsList.length == 0) {
    res.json({
      status: 'ok',
    });
  }

  newuserInterviewsList.map((interview) => {
    let interview_start_time = parseInt(interview.start_time);
    let interview_end_time = parseInt(interview.end_time);

    if (start_time <= interview_start_time && end_time >= interview_end_time) {
      res.json({
        status: 'err',
      });
    } else if (
      start_time >= interview_start_time &&
      end_time <= interview_end_time
    ) {
      res.json({
        status: 'err',
      });
    } else if (
      start_time <= interview_start_time &&
      end_time <= interview_end_time &&
      end_time >= interview_start_time
    ) {
      res.json({
        status: 'err',
      });
    } else if (
      start_time >= interview_start_time &&
      start_time <= interview_end_time &&
      end_time >= interview_end_time
    ) {
      res.json({
        status: 'err',
      });
    }
  });

  res.json({
    status: 'ok',
  });
});

router.post('/addInterview', async (req, res) => {
  let { start_time, end_time, duration, interviewee, interviewer } = req.body;
  await query(
    `insert into Interviews(start_time, end_time, duration, interviewee, interviewer) values("${start_time}", "${end_time}", "${duration}", "${interviewee}", "${interviewer}")`
  );
  scheduleEmail(interviewee, new Date(parseInt(start_time)));
  scheduleEmail(interviewer, new Date(parseInt(start_time)));
  res.send(200);
});

router.post('/delete', async (req, res) => {
  let { id } = req.query;
  await query(`delete from Interviews where id=${id}`);
  res.send(200);
});

router.post('/modify', async (req, res) => {
  let { start_time, end_time, duration, interviewee, interviewer } = req.body;
  console.log(
    `\n\n\n\n\n\n\n\nupdate Interviews set start_time="${start_time}", end_time="${end_time}", duration="${duration}", interviewee="${interviewee}", interviewer="${interviewer}" where id=${id}`
  );
  await query(
    `update Interviews set start_time="${start_time}", end_time="${end_time}", duration="${duration}", interviewee="${interviewee}", interviewer="${interviewer}" where id=${id}`
  );
  res.send(200);
});

module.exports = router;
