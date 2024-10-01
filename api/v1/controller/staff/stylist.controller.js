const baseModel=require("../../../../model/base.model")

module.exports.getAll= async (req,res) => {
    try {
        const list = await baseModel.find('"actor"');
        console.log(list)

        if (list) {
            res.status(200).json(list);
        } else {
            res.status(404).json({ message: 'List not found' }); 
        }
    } catch (error) {
        console.error("Error fetching actor details:", error);
        res.status(500).json({ message: 'Server error' }); 
    }
}

module.exports.getDetails= async (req,res) => {
    try {
        const userId = req.params.id; 
        const user = await baseModel.findById('"actor"', '"actor_id"', userId); 
        console.log(user)

        if (user) {
            res.status(200).json(user); 
        } else {
            res.status(404).json({ message: 'user not found' }); 
        }
    } catch (error) {
        console.error("Error fetching actor details:", error);
        res.status(500).json({ message: 'Server error' }); 
    }
}

module.exports.update= async (req,res) => {
    const id=req.params.id;
    const columns=req.body.columns;
    const values=req.body.values
    const result =await baseModel.update('"actor"', '"actor_id"', 2,columns,values);
    if (result) {
        res.status(200).json(result);
    } else {
        res.status(404).json({ message: 'user not found' }); 
    }
}