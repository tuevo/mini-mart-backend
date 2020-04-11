const sortByCreatedAt = (collection, option) => {
  collection.sort((a, b) => {
    const time1 = new Date(a.createdAt).getTime();
    const time2 = new Date(b.createdAt).getTime();
    return option === 'desc' ? (time2 - time1) : (time1 - time2);
  });
}

module.exports = {
  sortByCreatedAt
}