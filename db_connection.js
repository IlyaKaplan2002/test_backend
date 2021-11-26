const helpers = require('./helpers');

const Pool = require('pg').Pool;

const ConfigParser = require('configparser');

const config = new ConfigParser();

config.read('vk-postgres.config');

const db_config = {
  user: config.get('VK', 'username'),
  host: config.get('VK', 'host'),
  database: config.get('VK', 'database'),
  password: config.get('VK', 'password'),
  port: config.get('VK', 'port'),
  ssl: {
    rejectUnauthorized: false,
  },
};

const pool = new Pool(db_config);

const getFilteredPosts = req => {
  const {
    dateFrom = '0001-01-01',
    dateTo = '9999-01-01',
    search,
    sort = 'date',
    idOfPagination = 1,
  } = req;
  // console.log(req);
  const filteredPostsRequest = `select posts.post_id as id, posts.content as text, authors.first_name, authors.last_name, posts.date_time as date, posts.likes_count + 3*posts.reposts_count+ 2*posts.comments_count as sc from posts join authors on posts.from_id = authors.profile_id where posts.date_time between '${dateFrom}' and '${dateTo}' order by ${sort} desc;`;
  return new Promise(function (resolve, reject) {
    pool.query(filteredPostsRequest, (err, res) => {
      if (err) reject(err);
      else
        resolve(
          helpers
            .sliceContent(helpers.filterBySearch(search, res), 'text')
            .slice((idOfPagination - 1) * 10, idOfPagination * 10),
        );
    });
  });
};

const getCount = req => {
  const { dateFrom = '0001-01-01', dateTo = '9999-01-01', search } = req;

  const getCountReq = `select posts.content as text, authors.first_name, authors.last_name from posts join authors on posts.from_id = authors.profile_id where posts.date_time between '${dateFrom}' and '${dateTo}';`;

  return new Promise(function (resolve, reject) {
    pool.query(getCountReq, (err, res) => {
      if (err) reject(err);
      else {
        resolve({
          count: helpers.sliceContent(helpers.filterBySearch(search, res), 'text').length,
        });
      }
    });
  });
};

const getKeywords = () => {
  return new Promise(function (resolve, reject) {
    pool.query(helpers.makeGetKeywordsRequest(), (err, res) => {
      if (err) reject(err);
      else resolve(res.rows.map(item => item.label));
    });
  });
};

const getInfo = req => {
  const { id } = req;

  return new Promise(function (resolve, reject) {
    pool.query(helpers.makeGetInfoRequest(id), (err, res) => {
      if (err) reject(err);
      else {
        const info = {};

        if (res.rows[0]) {
          info.id = res.rows[0].post_id;
          info.date = res.rows[0].date;
          info.sc = res.rows[0].sc;
          info.first_name = res.rows[0].first_name;
          info.last_name = res.rows[0].last_name;
          info.keywords = helpers.getKeywordsForItem(res.rows);
          if (res.rows[0].comment) {
            info.comments = helpers.getComments(helpers.sliceContent(res.rows, 'comment'));
          } else info.comments = false;
        } else {
          info.id = 0;
          info.date = 0;
          info.sc = 0;
          info.first_name = 0;
          info.last_name = 0;
          info.keywords = [0];
          info.comments = false;
        }

        resolve(info);
      }
    });
  });
};

const deleteKey = keyword => {
  return new Promise(function (resolve, reject) {
    pool.query(`DELETE FROM keywords WHERE label = '${keyword}';`, (err, res) => {
      if (err) {
        reject(err);
      }
      resolve('Keyword deleted!');
    });
  });
};

const addNewKey = keyword => {
  return new Promise(function (resolve, reject) {
    pool.query(
      `INSERT INTO keywords (label,searched_at) VALUES ('${keyword}', '0001-01-01 00:00:00.0') ON CONFLICT DO NOTHING;`,
      (err, res) => {
        if (err) {
          reject(err);
        }
        resolve('Keyword added!');
      },
    );
  });
};

const getDataForLineChart = req => {
  const { dateFrom = '0001-01-01', dateTo = '9999-01-01', search } = req;

  const getDataForLineChartRequest = `select posts.date_time as date, posts.likes_count + 3*posts.reposts_count+ 2*posts.comments_count as sc, posts.content as text, authors.first_name, authors.last_name from posts join authors on posts.from_id = authors.profile_id where posts.date_time between '${dateFrom}' and '${dateTo}' order by date;`;

  return new Promise(function (resolve, reject) {
    pool.query(getDataForLineChartRequest, (err, res) => {
      if (err) reject(err);
      else {
        const filteredRes = helpers.filterBySearch(search, res);
        const result = filteredRes.map(item => {
          const { date, sc } = item;
          return { date, sc };
        });
        resolve(result);
      }
    });
  });
};

const getDataForBarChart = req => {
  const { dateFrom = '0001-01-01', dateTo = '9999-01-01', search } = req;

  const getDataForBarChartRequest = `select posts.likes_count + 3*posts.reposts_count+ 2*posts.comments_count as sc, posts.content as text, authors.first_name, authors.last_name, authors.profile_id as author from posts join authors on posts.from_id = authors.profile_id where posts.date_time between '${dateFrom}' and '${dateTo}' order by author;`;

  return new Promise(function (resolve, reject) {
    pool.query(getDataForBarChartRequest, (err, res) => {
      if (err) reject(err);
      else {
        const filteredRes = helpers.filterBySearch(search, res);
        const result = filteredRes.map(item => {
          const { author, first_name, last_name, sc } = item;
          return { author, first_name, last_name, sc };
        });

        resolve(helpers.filterDataForBar(result));
      }
    });
  });
};

module.exports = {
  getFilteredPosts,
  getInfo,
  getKeywords,
  getCount,
  deleteKey,
  addNewKey,
  getDataForLineChart,
  getDataForBarChart,
};
