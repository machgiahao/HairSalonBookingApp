
const pool = require("../config/connection");
pool.connect();

const transactionModel = {
    executeTransaction: async (queries) => {
        try {
            await client.query('BEGIN'); // Bắt đầu transaction

            let results = [];

            // Thực thi từng truy vấn trong danh sách
            for (let i = 0; i < queries.length; i++) {
                const { text, values } = queries[i];
                const result = await client.query(text, values); // Thực hiện truy vấn
                results.push(result.rows); // Lưu kết quả của từng truy vấn
            }

            await client.query('COMMIT'); // Commit nếu không có lỗi
            return results; // Trả về kết quả của tất cả truy vấn
        } catch (error) {
            await client.query('ROLLBACK'); // Rollback nếu có lỗi
            throw error; // Ném lỗi ra ngoài để controller xử lý
        } finally {
            client.release(); // Giải phóng kết nối
        }
    }
};

module.exports = transactionModel;



