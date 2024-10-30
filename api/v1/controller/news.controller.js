const baseModel = require("../../../model/base.model");
const newsTable = require("../../../model/table/news.table");
const managerTable = require("../../../model/table/manager.table");
const dateRefactor = require("../../../helper/dateRefactor.helper");
const extractBody = require("../../../helper/getColsVals.helper");
const isValidId = require("../../../validates/reqIdParam.validate");
const handleError = require("../../../helper/handleError.helper");
const handleResponse = require("../../../helper/handleReponse.helper");
let statusCode;

// Create news entry
module.exports.create = async (req, res) => {
    const managerID = req.query.id;
    
    try {
        if (!isValidId(managerID)) {
            statusCode = 400;
            throw new Error("Invalid manager ID");
        }

        const { columns, values } = extractBody.getColsVals(newsTable, req.body);

        const result = await baseModel.executeTransaction(async () => {
            return await baseModel.create(newsTable.name, columns, values);
        });

        handleResponse(res, 201, { data: result });
    } catch (error) {
        handleError(res, statusCode , error);
    }
};

// Update news entry
module.exports.update = async (req, res) => {
    const newsID = req.query.id;
    
    try {
        if (!isValidId(newsID)) {
            statusCode = 400;
            throw new Error("Invalid news ID");
        }

        const { columns, values } = extractBody.getColsVals(newsTable, req.body);

        const result = await baseModel.executeTransaction(async () => {
            let conditions = [{ column: newsTable.columns.newsID, value: newsID }];
            return await baseModel.updateWithConditions(newsTable.name, columns, values, conditions);
        });

        if(result.length<=0 || !result){
            statusCode=404
            throw new Error("No news with id : " + newsID)
        }

        handleResponse(res, 200, { data: result[0] });
    } catch (error) {
        handleError(res, statusCode , error);
    }
};

// Soft delete news entry
module.exports.softDelete = async (req, res) => {
    const newsID = req.query.id;

    try {
        if (!isValidId(newsID)) {
            statusCode = 400;
            throw new Error("Invalid news ID");
        }

        let conditions = [{ column: newsTable.columns.newsID, value: newsID }];
        const news = await baseModel.findWithConditionsJoin(newsTable.name, undefined, conditions);

        if (!news || news.length === 0) {
            statusCode = 404;
            throw new Error("No news found with ID: " + newsID);
        }

        const status = !news[0]?.deleted;
        const result = await baseModel.executeTransaction(async () => {
            const columns = [newsTable.columns.deleted];
            const values = [status];
            return await baseModel.updateWithConditions(newsTable.name, columns, values, conditions);
        });

        handleResponse(res, 200, { data: result[0] });
    } catch (error) {
        handleError(res, statusCode , error);
    }
};

// Hard delete news entry
module.exports.delete = async (req, res) => {
    const newsID = req.query.id;

    try {
        if (!isValidId(newsID)) {
            statusCode = 400;
            throw new Error("Invalid news ID");
        }

        let conditions = [{ column: newsTable.columns.newsID, value: newsID }];
        
        const result = await baseModel.executeTransaction(async () => {
            return await baseModel.deleteWithConditionsJoin(newsTable.name, conditions);
        });

        handleResponse(res, 200, { data: result });
    } catch (error) {
        handleError(res, statusCode || 500, error);
    }
};

// Retrieve all news entries with pagination
module.exports.getAll = async (req, res) => {
    try {
        const limit = Math.abs(parseInt(req.query.perpage)) || null;
        const offset = (Math.abs(parseInt(req.query.page) || 1) - 1) * limit;
        const orderDirection = ["ASC", "DESC"].includes(req.query.order?.toUpperCase()) 
            ? req.query.order.toUpperCase() 
            : "DESC";

        const conditions = req.query.id ? [{ column: newsTable.columns.newsID, value: req.query.id }] : [];
        const order = [{ column: newsTable.columns.newsID, direction: orderDirection }];

        const news = await baseModel.findWithConditionsJoin(
            newsTable.name,
            undefined,
            conditions,
            [],
            [],
            order,
            limit,
            offset
        );

        if (!news || news.length === 0) {
            statusCode = 404;
            throw new Error("No news found");
        }

        handleResponse(res, 200, { data: news });
    } catch (error) {
        handleError(res, statusCode , error);
    }
};

// Get detail of specific news entry
module.exports.getDetail = async (req, res) => {
    try {
        const id = req.query.id;

        if (!isValidId(id)) {
            statusCode = 400;
            throw new Error("Invalid id");
        }

        const conditions = [{ column: newsTable.columns.newsID, value: id }];
        const news = await baseModel.findWithConditionsJoin(newsTable.name, undefined, conditions);

        if (!news || news.length === 0) {
            statusCode = 404;
            throw new Error("No news found with id: " + id);
        }

        handleResponse(res, 200, { data: news[0] });
    } catch (error) {
        handleError(res, statusCode , error);
    }
};
