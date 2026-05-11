const baseModel = require("../../../model/base.model");
const newsTable = require("../../../model/table/news.table");

class NewsRepository {
    async findById(newsID) {
        const conditions = [{ column: newsTable.columns.newsID, value: newsID }];
        return await baseModel.findWithConditionsJoin(newsTable.name, undefined, conditions);
    }

    async findAll(limit, offset, order, conditions = []) {
        return await baseModel.findWithConditionsJoin(
            newsTable.name, undefined, conditions, [], [], order, limit, offset
        );
    }

    async create(columns, values) {
        return await baseModel.create(newsTable.name, columns, values);
    }

    async updateWithConditions(columns, values, conditions) {
        return await baseModel.updateWithConditions(newsTable.name, columns, values, conditions);
    }

    async deleteWithConditions(conditions) {
        return await baseModel.deleteWithConditionsJoin(newsTable.name, conditions);
    }

    async transaction(callback) {
        return await baseModel.executeTransaction(callback);
    }
}

module.exports = new NewsRepository();