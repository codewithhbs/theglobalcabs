class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    ['page', 'sort', 'limit', 'fields', 'search'].forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in)\b/g, (m) => `$${m}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  search(fields = []) {
    if (this.queryString.search && fields.length) {
      const regex = { $regex: this.queryString.search, $options: 'i' };
      this.query = this.query.find({ $or: fields.map((f) => ({ [f]: regex })) });
    }
    return this;
  }

  sort() {
    this.query = this.queryString.sort
      ? this.query.sort(this.queryString.sort.split(',').join(' '))
      : this.query.sort('-createdAt');
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      this.query = this.query.select(this.queryString.fields.split(',').join(' '));
    }
    return this;
  }

  paginate() {
    const page = Math.max(parseInt(this.queryString.page, 10) || 1, 1);
    const limit = Math.min(parseInt(this.queryString.limit, 10) || 20, 100);
    this.query = this.query.skip((page - 1) * limit).limit(limit);
    this.pagination = { page, limit };
    return this;
  }
}
module.exports = APIFeatures;
