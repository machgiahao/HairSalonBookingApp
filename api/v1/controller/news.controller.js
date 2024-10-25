const baseModel = require("../../../model/base.model");
const newsTable = require("../../../model/table/news.table");
const managerTable = require("../../../model/table/manager.table");
const dateRefactor = require("../../../helper/dateRefactor.helper");
const extractBody = require("../../../helper/getColsVals.helper");
const isValidId = require("../../../validates/reqIdParam.validate");

module.exports.create = async (req, res) => {
    const managerID = req.query.id;
    
    // Validate manager ID
    if (!isValidId(managerID)) {
        return res.status(404).json({
            message: "Invalid id"
        });
    }

    try {
        // Extract columns and values from the request body
        const { columns, values } = extractBody.getColsVals(newsTable, req.body);

        const result = await baseModel.executeTransaction(async () => {
            // Create news entry
            return baseModel.create(newsTable.name, columns, values);
        });

        return res.status(201).json({
            data: result
        });

    } catch (error) {

        return res.status(500).json({
            error: error.message
        });
    }
};

module.exports.update = async (req, res) => {
    const newsID = req.query.id;
    
    // Validate manager ID
    if (!isValidId(newsID)) {
        return res.status(404).json({
            message: "Invalid id"
        });
    }

    try {
        const { columns, values } = extractBody.getColsVals(newsTable, req.body);

        const result = await baseModel.executeTransaction(async () => {
            let conditions=[
                {columns:newsTable.columns.newsID,values:newsID}
            ]
            return baseModel.updateWithConditions(newsTable.name, columns, values,conditions);
        });

        return res.status(201).json({
            data: result[0]
        });

    } catch (error) {

        return res.status(500).json({
            error: error.message
        });
    }
};

module.exports.softDelete = async (req, res) => {
    const newsID = req.query.id;
    
    // Validate manager ID
    if (!isValidId(newsID)) {
        return res.status(404).json({
            message: "Invalid id"
        });
    }

    try {
        let columns=[]
        let values=[]
        let conditions= [
            
                {columns:newsTable.columns.newsID,values:newsID}
            
        ] 

        const news = await baseModel.findWithConditionsJoin(newsTable.name, undefined,conditions)

        if(!news.length>0){
            return res.status(404).json({
                message: "No news found"
            });
        }

        console.log(news)
        let status =  !news[0]?.deleted 
        const result = await baseModel.executeTransaction(async () => {
            columns.push(newsTable.columns.deleted)
            values.push(status)
            return baseModel.updateWithConditions(newsTable.name, columns, values,conditions);
        });

        return res.status(201).json({
            data: result[0]
        });

    } catch (error) {

        return res.status(500).json({
            error: error.message
        });
    }
};

module.exports.delete = async (req, res) => {
    const newsID = req.query.id;
        if (!isValidId(newsID)) {
        return res.status(404).json({
            message: "Invalid id"
        });
    }

    try {
        let conditions = [
            { column: newsTable.columns.newsID, value: newsID }
        ];
        
        const result = await baseModel.executeTransaction(async () => {
            return baseModel.deleteWithConditionsJoin(newsTable.name,conditions);
        });
        
          
          console.log(`Deleted rows: ${result}`);

        return res.status(201).json({
            data: result
        });

    } catch (error) {

        return res.status(500).json({
            error: error.message
        });
    }
};

module.exports.getAll = async (req, res) => {
    try {
        const limit = Math.abs(parseInt(req.query.perpage)) || 10; 

        const offset = Math.abs(parseInt(req.query.page)) || 0; 

        const columns = ['*'];

        let conditions=[]
        let logicalOperator=[]
        let join=[]
        let orderDirection = ["ASC", "DESC"].includes(req.query.order?.toUpperCase()) 
        ? req.query.order.toUpperCase() 
        : "DESC";
        let order = [
            { column: newsTable.columns.newsID, direction: orderDirection }
        ];

        if(req.query.id){
            conditions.push({columns:newsTable.columns.newsID,value:req.query.id})
        }

        const news = await baseModel.findWithConditionsJoin(
            newsTable.name,  // main table name
            undefined,            // columns
            undefined,         // conditions (can be added later)
            logicalOperator,    // logical operators (defaults to AND)
            join,               //join
            order,              // order (can be added later)
            limit,              // limit
            offset              // offset for pagination
        );

        if (!news || news.length === 0) {
            return res.status(404).json({
                message: "No news found"
            });
        }

        // Return the retrieved stylist list with pagination info
         return res.status(200).json({
            data: news
        });
    } catch (error) {
        console.error("Error retrieving stylist list:", error);
        return handleResponse(res, 500, { error: error.message });
    }
};

