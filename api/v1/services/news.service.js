const newsTable = require("../../../model/table/news.table");
const { getColsVals } = require("../../../helper/getColsVals.helper");
const newsRepository = require("../repositories/news.repository");
const isValidId = require("../../../validates/reqIdParam.validate");

class NewsService {
    async create(managerID, data) {
        if (!isValidId(managerID)) {
            throw { statusCode: 400, message: "Invalid manager ID" };
        }

        const { columns, values } = getColsVals(newsTable, data);
        const result = await newsRepository.create(columns, values);
        return { data: result };
    }

    async update(newsID, data) {
        if (!isValidId(newsID)) {
            throw { statusCode: 400, message: "Invalid news ID" };
        }

        const { columns, values } = getColsVals(newsTable, data);
        const conditions = [{ column: newsTable.columns.newsID, value: newsID }];
        const result = await newsRepository.updateWithConditions(columns, values, conditions);

        if (!result || result.length <= 0) {
            throw { statusCode: 404, message: "No news with id: " + newsID };
        }

        return { data: result[0] };
    }

    async softDelete(newsID) {
        if (!isValidId(newsID)) {
            throw { statusCode: 400, message: "Invalid news ID" };
        }

        const conditions = [{ column: newsTable.columns.newsID, value: newsID }];
        const news = await newsRepository.findById(newsID);

        if (!news || news.length === 0) {
            throw { statusCode: 404, message: "No news found with ID: " + newsID };
        }

        const status = !news[0]?.deleted;
        const result = await newsRepository.transaction(async () => {
            return await newsRepository.updateWithConditions([newsTable.columns.deleted], [status], conditions);
        });

        return { data: result[0] };
    }

    async delete(newsID) {
        if (!isValidId(newsID)) {
            throw { statusCode: 400, message: "Invalid news ID" };
        }

        const conditions = [{ column: newsTable.columns.newsID, value: newsID }];
        const result = await newsRepository.deleteWithConditions(conditions);
        return { data: result };
    }

    async getAll(query) {
        const limit = Math.abs(parseInt(query.perpage)) || null;
        const offset = (Math.abs(parseInt(query.page) || 1) - 1) * limit;
        const orderDirection = ["ASC", "DESC"].includes(query.order?.toUpperCase())
            ? query.order.toUpperCase()
            : "DESC";

        const conditions = query.id ? [{ column: newsTable.columns.newsID, value: query.id }] : [];
        const order = [{ column: newsTable.columns.newsID, direction: orderDirection }];

        const news = await newsRepository.findAll(limit, offset, order, conditions);

        if (!news || news.length === 0) {
            throw { statusCode: 404, message: "No news found" };
        }

        return { data: news };
    }

    async getDetail(newsID) {
        if (!isValidId(newsID)) {
            throw { statusCode: 400, message: "Invalid id" };
        }

        const conditions = [{ column: newsTable.columns.newsID, value: newsID }];
        const news = await newsRepository.findById(newsID);

        if (!news || news.length === 0) {
            throw { statusCode: 404, message: "No news found with id: " + newsID };
        }

        return { data: news[0] };
    }
}

module.exports = new NewsService();