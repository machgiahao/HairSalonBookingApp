const baseModel = require("../../../model/base.model")
const serviceTable = require("../../../model/table/service.table")

const serviceController = {
    detail: async (req, res) => {
        try {
            const id = req.query.id;

            const service = await baseModel.findById("Service", "serviceID", id);
            if (!service) {
                return res.status(400).json({
                    success: false,
                    msg: "Service not found"
                })
            }
            return res.status(200).json({
                success: true,
                service: service
            })

        } catch (error) {
            return res.status(500).json({
                success: false,
                msg: "Internal server error"
            })
        }
    },

    getAll: async (req, res) => {
        try {
            const serviceList = await baseModel.find("Service");

            if (!serviceList || serviceList.length === 0) {
                return res.status(404).json({
                    success: false,
                    msg: 'No user found'
                });
            }

            res.status(200).json({
                success: true,
                userList: serviceList
            })

        } catch (error) {
            return res.status(500).json({
                success: false,
                msg: "Internal server error"
            })
        }
    },

    create: async (req, res) => {
        try {

            const columns = [];
            const values = [];
            
            for(const key in req.body) {
                if(serviceTable.columns[key] !== undefined && req.body[key] != "") {
                    columns.push(serviceTable.columns[key]);
                    if (key === 'price') {
                        values.push(parseFloat(req.body[key]));  
                    } else if (key === 'duration') {
                        values.push(parseInt(req.body[key])); 
                    } else {
                        values.push(req.body[key]);  
                    }
                }
            }

            const newService = await baseModel.create("Service", columns, values);
            return res.status(200).json({
                success: true,
                data: newService
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                success: false,
                msg: "Internal server error"
            })
        }
    },

    update: async (req, res) => {
        try {
            const id = req.query.id;

            const columns = [];
            const values = [];

            for (const key in req.body) {
                if (serviceTable.columns[key] !== undefined && req.body[key] !== "" ) {  // Ensure the key is a valid column
                    columns.push(serviceTable.columns[key]);
                    if (key === 'price') {
                        values.push(parseFloat(req.body[key]));  
                    } else if (key === 'duration') {
                        values.push(parseInt(req.body[key])); 
                    } else {
                        values.push(req.body[key]);  
                    }
                }
            }

            if (columns.length === 0) {
                return res.status(400).json({
                    success: false,
                    msg: "No valid data to update"
                });
            }

            const updateService = await baseModel.update(serviceTable.name, serviceTable.columns.serviceID, id, columns, values);
            
            if (!updateService) {
                return res.status(400).json({
                    success: false,
                    msg: "Service not found"
                })
            }
            return res.status(200).json({
                success: true,
                msg: "Update successfully",
                data: updateService
            })
        } catch (error) {
            console.error("Error in update:", error);  // Ghi lại lỗi chi tiết
            return res.status(500).json({
                success: false,
                msg: "Internal server error",
                error: error.message  // Thêm thông tin chi tiết về lỗi
            });
        }
        
    },

    delete: async (req, res) => {
        try {
            const id = req.query.id;

            const service = {
                deleted: true
            }

            const update = await baseModel.update("Service", "serviceID", id, Object.keys(service), Object.values(service));
            if (!update) {
                return res.status(404).json({
                    success: false,
                    msg: "Delete fail"
                });
            }
            res.status(200).json({
                success: true,
                msg: "Delete successfully",
                data: update
            })

        } catch (error) {
            return res.status(500).json({
                success: false,
                msg: "Internal server error"
            })
        }
    },

}

module.exports = serviceController;