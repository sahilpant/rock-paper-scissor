const x = [
    {player1:{
        card_type:String,
        card_number:Number,
        timestamp:Date
    },
    player2:{
        card_type:String,
        card_number:Number,
        timestamp:Date
    }     
}
]
let obj = {
    player1:{
        card_type:"123",
        card_number:1,
        timestamp:new Date
    },
    player2:{
        card_type:"123",
        card_number:1,
        timestamp:new Date
    }  
}
x.push(obj);
x.push(obj);

console.log(x);