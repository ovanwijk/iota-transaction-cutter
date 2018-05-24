

var iotaPay = require("./dist/iota-transaction-cutter.js");
//Create messages that are too long.
var msg1 = "A".repeat(1000) + "B".repeat(1000) + "C".repeat(1000) + "D".repeat(1000) + "E".repeat(1000) + "F".repeat(1000)
var msg2 = "G".repeat(3000) + "H".repeat(500) + "I".repeat(100) + "J".repeat(3000) + "K".repeat(2000) + "L".repeat(985)
var msg3 = "M".repeat(1000) + "N".repeat(2000) + "O".repeat(1000) + "P".repeat(3000) + "Q".repeat(3000) + "R".repeat(3000)

// MSG is 6000 characters long Math.ceil(6000/2176) = 3 transactions needed to encode.
//Mock transfer object.
var transactions = [
    { value: 0, message: msg1 },
    { value: 1, message: "" },
    { value: 0, message: msg2 },
    { value: 0, message: msg3 },

];
var cutUpTransctions = iotaPay.cutTransactionMessages(transactions)
var gluedTranscations = iotaPay.glueTransactionMessages(cutUpTransctions);
var transactionsEqual = true;

for (var i = 0; i < transactions.length; i++) {
    Object.keys(transactions[i]).forEach(key => {
        if (transactions[i][key] !== gluedTranscations[i][key]) {
            transactionsEqual = false;
        }
    })
}

//console.log(gluedTranscations);
console.log("Does it equal?", transactionsEqual);
/*  
    aa = [{
        value:0,
        message: "999999CSPLTAAAAAAA..."
    },
    {
        value:0,
        message: "999A99CSPLTCCCCCCC..."
    },
    {
        value:0,
        message: "999B99CSPLTEEEEEEE..."
    }]


*/