const transactionModel = require("../models/transcation");
const ledgerModel = require("../models/ledger");
const accountModel = require("../models/account.model");
const emailService = require("../services/email.service");


async function createTransaction(req,res){
  const {fromAccount,toAccount, amount,idempotencyKey} = req.body;
  if(!fromAccount || !toAccount || !amount || !idempotencyKey){
    return res.status(400).json({
        message :"FromAccount, toAccount, amount and idempotencyKey"
    });
  }

  const fromUserAccount = await accountModel.findOne({
      _id:fromAccount,
  });
  const toUserAccount = await accountModel.findOne({
      _id:toAccount,
  });
  if(!fromUserAccount || !toUserAccount){
    return res.status(400).json({
      message:"Invalid fromAccount or toAccount"
    })
  }

}