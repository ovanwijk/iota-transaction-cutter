

//These const are mainly for explanations not neccerly used as parameters.
const IOTA_MESSAGE_SIZE = 2187;
const SPLIT_MESSAGE_INDEX = [2, 4]; // 2-6 ( 5^26) reserved for messageIndexes. 843414404553 Trytes per distinct message.
const SPLIT_MESSAGE_COUNT = [5, 7]
const TRYTES = "9ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const SPLIT_MESSAGE_NR_LENGTH = [0, 1]; //0-1 reserved for message nr 2^27 = 729 distinct messages per bundle
const SPLIT_MESSAGE_SIGNATURE_PATTERN = [TRYTES.indexOf("S"),TRYTES.indexOf("P"),TRYTES.indexOf("L"),TRYTES.indexOf("T")]
const SPLIT_MESSAGE_SIGNATURE = [8, 11];

function splitValue(value, index) {
    return [value.substring(0, index), value.substring(index)];
}
function splitPatternToTryte(splitPattern) {
    return splitPattern.map(v => {
        return TRYTES[v];
    }).join('')
}

function increamentMessageNrPattern(splitPattern) {
    var increased = false;
    var currentIndex = SPLIT_MESSAGE_NR_LENGTH[1];
    while (!increased && currentIndex >= SPLIT_MESSAGE_NR_LENGTH[0]) {
        splitPattern[currentIndex] += 1;
        if (splitPattern[currentIndex] <= 26) {
            increased = true;
        } else {
            splitPattern[currentIndex] = 0;
            currentIndex -= 1;
        }
    }
    splitPattern[2] = 0;
    splitPattern[3] = 0;
    splitPattern[4] = 0;
    splitPattern[5] = 0;
    splitPattern[6] = 0;
    splitPattern[7] = 0;    
    return splitPattern;
}



function setMessageSizeSplitPattern(splitPattern, size) {
    var msgInTrytes = [Math.floor(size / (26 * 26)), Math.floor(size / (26)), size % 26];    
    splitPattern[5] = msgInTrytes[0];
    splitPattern[6] = msgInTrytes[1];
    splitPattern[7] = msgInTrytes[2];
    return splitPattern;
}

function increamentMessageSplitPattern(splitPattern) {
    var increased = false;
    var currentIndex = SPLIT_MESSAGE_INDEX[1];
    while (!increased && currentIndex >= SPLIT_MESSAGE_INDEX[0]) {
        splitPattern[currentIndex] += 1;
        if (splitPattern[currentIndex] <= 26) {
            increased = true;
        } else {
            splitPattern[currentIndex] = 0;
            currentIndex -= 1;
        }
    }
    return splitPattern;
}

export function glueTransactionMessages(transfers = []) {
    //We do expect them in order
    var toReturn = [];
    var previousIdentifier = "NEXT";
    var combinedMessage = "";
    var previousTransfer = null;
    
    console.log("Transfer count", transfers.length);
    var count = 1;
    transfers.forEach(transfer => {
       
        if(transfer.value > 0){
            if(previousTransfer !== null && combinedMessage !== ""){
                previousTransfer.message = combinedMessage;        
                toReturn.push(previousTransfer);
                previousIdentifier = "NEXT";
                previousTransfer = null;
                combinedMessage = "";
            }
            console.log(transfer)
            toReturn.push(transfer);
        }else{
             if(transfer.message.substring(SPLIT_MESSAGE_SIGNATURE[0], SPLIT_MESSAGE_SIGNATURE[1] + 1) == "SPLT"){
                
                if(previousIdentifier == "NEXT" || transfer.message.substring(SPLIT_MESSAGE_NR_LENGTH[0], SPLIT_MESSAGE_NR_LENGTH[1] + 1) == previousIdentifier){
                    previousIdentifier = transfer.message.substring(SPLIT_MESSAGE_NR_LENGTH[0], SPLIT_MESSAGE_NR_LENGTH[1] + 1);
                    combinedMessage += transfer.message.substring(SPLIT_MESSAGE_SIGNATURE[1] + 1);
                    previousTransfer = Object.assign({}, transfer);
                }else{   
                    previousTransfer.message = combinedMessage;
                    toReturn.push(previousTransfer);
                    previousIdentifier = transfer.message.substring(SPLIT_MESSAGE_NR_LENGTH[0], SPLIT_MESSAGE_NR_LENGTH[1] + 1);
                    combinedMessage = transfer.message.substring(SPLIT_MESSAGE_SIGNATURE[1] + 1);
                    previousTransfer = Object.assign({}, transfer);
                    
                } 
            }else{
                console.log("Found a non split transaction");
                toReturn.push(transfer);
                previousIdentifier = "NEXT";
            }
        }
        count += 1;
    })
    if(previousTransfer !== null && combinedMessage !== ""){
        console.log("Combining last message: " + combinedMessage.substring(0, 15));
        previousTransfer.message = combinedMessage;        
        toReturn.push(previousTransfer);
    }
    console.log("Returning", toReturn.length)
    return toReturn;

}

export function cutTransactionMessages(transfers = []) {
    
    var splitPattern = [0, 0, 0, 0, 0, 0, 0, 0].concat(SPLIT_MESSAGE_SIGNATURE_PATTERN);

    var newTransfers = [];
    transfers.forEach(transfer => {
        //console.log(transfer);
        //We don't split up value transfers.
        if (transfer.value > 0) {
            newTransfers.push(transfer);
        } else {
            var leftoverMessage = transfer.message;
            var maxMessages = Math.ceil(leftoverMessage.length / (IOTA_MESSAGE_SIZE - splitPattern.length));
            splitPattern = setMessageSizeSplitPattern(splitPattern, maxMessages)
            var result = [];
            //console.log(leftoverMessage);
            while (leftoverMessage.length > 0) {
                
                var split = splitValue(leftoverMessage, IOTA_MESSAGE_SIZE - splitPattern.length);
                
                leftoverMessage = split[1];
                var newTransfer = Object.assign({}, transfer);
                newTransfer.message = splitPatternToTryte(splitPattern) + split[0]
                console.log(newTransfer.message.substring(0, 15));
                newTransfers.push(newTransfer);
                splitPattern = increamentMessageSplitPattern(splitPattern);
            }
            splitPattern = increamentMessageNrPattern(splitPattern);
            console.log(splitPattern);
        } 
    })
    return newTransfers;
}

