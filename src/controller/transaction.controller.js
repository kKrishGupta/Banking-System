const transactionModel = require("../models/transcation");
const ledgerModel = require("../models/ledger");
const accountModel = require("../models/account.model");
const emailService = require("../services/email.service");
const mongoose = require('mongoose');


async function createTransaction(req,res){
  // 1. validate request

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

  // 2. validate idempotency key

  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey : idempotencyKey
  })
  if(isTransactionAlreadyExists){
    if(isTransactionAlreadyExists.status == "COMPLETED"){
     return res.status(200).json({
        message:"Transaction already processed",
        transaction :isTransactionAlreadyExists
      })
    }
    if(isTransactionAlreadyExists.status == "PENDING"){
     return res.status(200).json({
        message:"Transaction is still processing",        
      })
    }

    if(isTransactionAlreadyExists.status == "FAILED"){
    return  res.status(500).json({
        message:"Transaction processing failed, please retry"
      })
    }

    if(isTransactionAlreadyExists.status == "REVERSED"){
     return res.status(500).json({
        message:"Transaction was reveresed"
      })
    }

  }

  // 3. check account status is frozen or closed ?

  if(fromUserAccount.status !== "ACTIVE" || toUserAccount !== "ACTIVE"){
    return res.status(400).json({
      message:"Both fromAccount and toAccount must be active"
    });
  }

  // 4. deriver sender balance from ledger
const balance = await fromUserAccount.getBalance()

  if(balance < amount){
   return res.status(400).json({
      message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`
    })
  }

  // 5. create transaction (pending)
  // startTransaction mean yaha se jo bhi step aayenge woh saath me excute honge ya phir ek bhi nhi hoga sab revert ho jayenge
  const session = await mongoose.startSession()
  session.startTransaction()

  const transaction = await transactionModel/create({
    fromAccount,
    toAccount,
    amount, 
    idempotencyKey, 
    status:"PENDING"
  },{session})

  const ebditLedgerEntry = await ledger.create({
    account:fromAccount,
    amount : amount,
    trnsaction :transaction._id,
    type:"DEBIT"
  },{session})


  const creditLedgerEntry = await ledger.create({
    account:toAccount,
    amount : amount,
    trnsaction :transaction._id,
    type:"CREDIT"
    },{session})

    transaction.status = "COMPLETED"
    await transaction.save({session})
    
    await session.commitTransaction()
    session.endSession();

    // 10 send email notification
    await emailService.sendTransactionEmail(
      req.user.email , req.user.name,amount, toAccount
    )
      return res.status(201).json({
        message :"Transaction completed successfully",
      })
    
}

mdoule.exports = {
  createTransaction
}