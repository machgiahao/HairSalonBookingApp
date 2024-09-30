const baseModel=require("../../../../model/base.model")
module.exports.getDetails= (req,res) => {
    const id=req.params.id;
    res.send(id);
}

module.exports.update= (req,res) => {
    const id=req.params.id;
    res.send(id);
}