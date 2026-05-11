const cron = require ("node-cron");
const baseModel = require("../model/base.model");
const workShiftTable = require("../model/table/workshift.table")
const stylistWorkShiftTable = require("../model/table/stylistWorkshift.table");


cron.schedule(`59 23 * * sun `,async ()=>{
    let columns=[stylistWorkShiftTable.columns.status];
    let values=['active']
    const result = await baseModel.updateWithConditions(stylistWorkShiftTable.name,columns,values);
    console.log(result);
})