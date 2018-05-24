(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["iotatransactioncutter"] = factory();
	else
		root["iotatransactioncutter"] = factory();
})(global, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/iota-transaction-cutter.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/iota-transaction-cutter.js":
/*!****************************************!*\
  !*** ./src/iota-transaction-cutter.js ***!
  \****************************************/
/*! exports provided: glueTransactionMessages, cutTransactionMessages */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"glueTransactionMessages\", function() { return glueTransactionMessages; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"cutTransactionMessages\", function() { return cutTransactionMessages; });\n\n\n//These const are mainly for explanations not neccerly used as parameters.\nconst IOTA_MESSAGE_SIZE = 2187;\nconst SPLIT_MESSAGE_INDEX = [2, 4]; // 2-6 ( 5^26) reserved for messageIndexes. 843414404553 Trytes per distinct message.\nconst SPLIT_MESSAGE_COUNT = [5, 7];\nconst TRYTES = \"9ABCDEFGHIJKLMNOPQRSTUVWXYZ\";\nconst SPLIT_MESSAGE_NR_LENGTH = [0, 1]; //0-1 reserved for message nr 2^27 = 729 distinct messages per bundle\nconst SPLIT_MESSAGE_SIGNATURE_PATTERN = [TRYTES.indexOf(\"S\"), TRYTES.indexOf(\"P\"), TRYTES.indexOf(\"L\"), TRYTES.indexOf(\"T\")];\nconst SPLIT_MESSAGE_SIGNATURE = [8, 11];\n\nfunction splitValue(value, index) {\n    return [value.substring(0, index), value.substring(index)];\n}\nfunction splitPatternToTryte(splitPattern) {\n    return splitPattern.map(v => {\n        return TRYTES[v];\n    }).join('');\n}\n\nfunction increamentMessageNrPattern(splitPattern) {\n    var increased = false;\n    var currentIndex = SPLIT_MESSAGE_NR_LENGTH[1];\n    while (!increased && currentIndex >= SPLIT_MESSAGE_NR_LENGTH[0]) {\n        splitPattern[currentIndex] += 1;\n        if (splitPattern[currentIndex] <= 26) {\n            increased = true;\n        } else {\n            splitPattern[currentIndex] = 0;\n            currentIndex -= 1;\n        }\n    }\n    splitPattern[2] = 0;\n    splitPattern[3] = 0;\n    splitPattern[4] = 0;\n    splitPattern[5] = 0;\n    splitPattern[6] = 0;\n    splitPattern[7] = 0;\n    return splitPattern;\n}\n\nfunction setMessageSizeSplitPattern(splitPattern, size) {\n    var msgInTrytes = [Math.floor(size / (26 * 26)), Math.floor(size / 26), size % 26];\n    splitPattern[5] = msgInTrytes[0];\n    splitPattern[6] = msgInTrytes[1];\n    splitPattern[7] = msgInTrytes[2];\n    return splitPattern;\n}\n\nfunction increamentMessageSplitPattern(splitPattern) {\n    var increased = false;\n    var currentIndex = SPLIT_MESSAGE_INDEX[1];\n    while (!increased && currentIndex >= SPLIT_MESSAGE_INDEX[0]) {\n        splitPattern[currentIndex] += 1;\n        if (splitPattern[currentIndex] <= 26) {\n            increased = true;\n        } else {\n            splitPattern[currentIndex] = 0;\n            currentIndex -= 1;\n        }\n    }\n    return splitPattern;\n}\n\nfunction glueTransactionMessages(transfers = []) {\n    //We do expect them in order\n    var toReturn = [];\n    var previousIdentifier = \"NEXT\";\n    var combinedMessage = \"\";\n    var previousTransfer = null;\n    var count = 1;\n    transfers.forEach(transfer => {\n\n        if (transfer.value > 0) {\n            if (previousTransfer !== null && combinedMessage !== \"\") {\n                previousTransfer.message = combinedMessage;\n                toReturn.push(previousTransfer);\n                previousIdentifier = \"NEXT\";\n                previousTransfer = null;\n                combinedMessage = \"\";\n            }\n\n            toReturn.push(transfer);\n        } else {\n            if (transfer.message.substring(SPLIT_MESSAGE_SIGNATURE[0], SPLIT_MESSAGE_SIGNATURE[1] + 1) == \"SPLT\") {\n\n                if (previousIdentifier == \"NEXT\" || transfer.message.substring(SPLIT_MESSAGE_NR_LENGTH[0], SPLIT_MESSAGE_NR_LENGTH[1] + 1) == previousIdentifier) {\n                    previousIdentifier = transfer.message.substring(SPLIT_MESSAGE_NR_LENGTH[0], SPLIT_MESSAGE_NR_LENGTH[1] + 1);\n                    combinedMessage += transfer.message.substring(SPLIT_MESSAGE_SIGNATURE[1] + 1);\n                    previousTransfer = Object.assign({}, transfer);\n                } else {\n                    previousTransfer.message = combinedMessage;\n                    toReturn.push(previousTransfer);\n                    previousIdentifier = transfer.message.substring(SPLIT_MESSAGE_NR_LENGTH[0], SPLIT_MESSAGE_NR_LENGTH[1] + 1);\n                    combinedMessage = transfer.message.substring(SPLIT_MESSAGE_SIGNATURE[1] + 1);\n                    previousTransfer = Object.assign({}, transfer);\n                }\n            } else {\n                console.log(\"Found a non split transaction\");\n                toReturn.push(transfer);\n                previousIdentifier = \"NEXT\";\n            }\n        }\n        count += 1;\n    });\n    if (previousTransfer !== null && combinedMessage !== \"\") {\n\n        previousTransfer.message = combinedMessage;\n        toReturn.push(previousTransfer);\n    }\n    return toReturn;\n}\n\nfunction cutTransactionMessages(transfers = []) {\n\n    var splitPattern = [0, 0, 0, 0, 0, 0, 0, 0].concat(SPLIT_MESSAGE_SIGNATURE_PATTERN);\n\n    var newTransfers = [];\n    transfers.forEach(transfer => {\n        //console.log(transfer);\n        //We don't split up value transfers.\n        if (transfer.value > 0) {\n            newTransfers.push(transfer);\n        } else {\n            var leftoverMessage = transfer.message;\n            var maxMessages = Math.ceil(leftoverMessage.length / (IOTA_MESSAGE_SIZE - splitPattern.length));\n            splitPattern = setMessageSizeSplitPattern(splitPattern, maxMessages);\n            var result = [];\n            //console.log(leftoverMessage);\n            while (leftoverMessage.length > 0) {\n\n                var split = splitValue(leftoverMessage, IOTA_MESSAGE_SIZE - splitPattern.length);\n\n                leftoverMessage = split[1];\n                var newTransfer = Object.assign({}, transfer);\n                newTransfer.message = splitPatternToTryte(splitPattern) + split[0];\n                console.log(newTransfer.message.substring(0, 15));\n                newTransfers.push(newTransfer);\n                splitPattern = increamentMessageSplitPattern(splitPattern);\n            }\n            splitPattern = increamentMessageNrPattern(splitPattern);\n            console.log(splitPattern);\n        }\n    });\n    return newTransfers;\n}\n\n//# sourceURL=webpack://iotatransactioncutter/./src/iota-transaction-cutter.js?");

/***/ })

/******/ });
});