const filterBySearch = (search, res) => {
  if (search) {
    const result = res.rows.filter(
      item =>
        item.text.toLowerCase().includes(search.toLowerCase()) ||
        item.first_name.toLowerCase().includes(search.toLowerCase()) ||
        item.last_name.toLowerCase().includes(search.toLowerCase()),
    );

    return result;
  } else {
    const result = res.rows;
    return result;
  }
};

const sliceContent = (items, parameter) => {
  for (const item of items) {
    item[parameter] = item[parameter].slice(0, 100) + '...';
  }

  return items;
};

const makeGetKeywordsRequest = () => 'select label from keywords order by label;';

const makeGetInfoRequest = id => {
  if (id) {
    return `select posts.post_id, posts.date_time as date, posts.content as text, authors.first_name, authors.last_name, posts.likes_count + 3*posts.reposts_count+ 2*posts.comments_count as sc, comments.text_of_the_comment as comment, keys_to_posts.label as keyword from posts join authors on posts.from_id = authors.profile_id left join comments on posts.post_id = comments.post_id join keys_to_posts on posts.post_id = keys_to_posts.post_id where posts.post_id = ${id} limit 10;`;
  } else {
    return `select posts.post_id, posts.date_time as date, authors.first_name, authors.last_name, posts.likes_count + 3*posts.reposts_count+ 2*posts.comments_count as sc, comments.text_of_the_comment as comment, keys_to_posts.label as keyword from posts join authors on posts.from_id = authors.profile_id left join comments on posts.post_id = comments.post_id join keys_to_posts on posts.post_id = keys_to_posts.post_id limit 10;`;
  }
};

const getComments = items => {
  return items
    .map(item => item.comment)
    .filter((comment, index, array) => array.indexOf(comment) === index);
};

const getKeywordsForItem = items => {
  return items
    .map(item => item.keyword)
    .filter((keyword, index, array) => array.indexOf(keyword) === index);
};

const filterDataForBar = data => {
  const authors = data
    .map(item => item.author)
    .filter((item, index, array) => array.indexOf(item) === index);

  const numberOfPosts = [];
  const names = [];
  const socialScore = [];
  for (const author of authors) {
    const itemForAuthor = data.filter(item => item.author === author)[0];
    names.push(`${itemForAuthor.first_name} ${itemForAuthor.last_name}`);
    numberOfPosts.push(data.filter(item => item.author === author).length);
    socialScore.push(
      data.filter(item => item.author === author).reduce((acc, item) => (acc += item.sc), 0),
    );
  }

  const filteredData = [];
  for (let i = 0; i < authors.length; i += 1) {
    filteredData.push({
      id: authors[i],
      name: names[i],
      countOfPosts: numberOfPosts[i],
      countOfSC: socialScore[i],
    });
  }

  const sortedData = [...filteredData].sort((a, b) => b.countOfPosts - a.countOfPosts);

  const dataForBar = sortedData.slice(0, 10);

  console.log(dataForBar);

  const authorsForBar = dataForBar.map(item => item.id);
  const namesForBar = dataForBar.map(item => item.name);
  const countsForBar = dataForBar.map(item => item.countOfPosts);
  const scForBar = dataForBar.map(item => item.countOfSC);

  return { authorsForBar, namesForBar, countsForBar, scForBar };
};

module.exports = {
  filterBySearch,
  sliceContent,
  makeGetInfoRequest,
  makeGetKeywordsRequest,
  getComments,
  getKeywordsForItem,
  filterDataForBar,
};
