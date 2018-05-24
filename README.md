# iota-transaction-cutter
Zero value IOTA data transactions can only be 2187 Trytes long. 

This library takes a list of transfer objects and cuts them up in such a way we can easily reconstruct the messages later.

It does this by cutting up the transaction message into different identical transactions (so tag etc stays the same).
It then prefixes the transactions with 12 Trytes.

    Message NR   Current Index   Message Count  Split   Remainder
    99           999             99A            SPLT    AAAAAAAAAAAAA


This comes down to a potential 27 * 27 = 729 Splitted messages within a bundle.
With each message having a potential 27 * 27 * 27 = 19683 Transactions in them.
19683 * 2175 = 42.810.525 Trytes per message.

This is just a means to split up an already encoded tryte message inside a transfer object. It could be placed inside one bundle but it is also possible to send them as a stream in a MAM channel or Flash channel.


    npm install iotatransactioncutter

    var cutter = require("iotatransactioncutter");
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
    var cutUpTransctions = cutter.cutTransactionMessages(transactions)
    var gluedTranscations = cutter.glueTransactionMessages(cutUpTransctions);
    var transactionsEqual = true;
    
    for (var i = 0; i < transactions.length; i++) {
        Object.keys(transactions[i]).forEach(key => {
            if (transactions[i][key] !== gluedTranscations[i][key]) {
                transactionsEqual = false;
            }
        })
    }    
    console.log("Does it equal?", transactionsEqual);













