module.exports=(condition=[],logicalOperator=[])=>{
    const clause=[];
    const value=[];
    array.forEach( (element,i) => {
       const {col,value,operator=" = "}=element;
       const clauseSet=`${col} ${operator} $${i+1}`;
       

    });

}