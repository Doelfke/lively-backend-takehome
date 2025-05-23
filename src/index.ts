import "reflect-metadata";
import { AccountManager } from "./models/account/manager";
import { TransferManager } from "./models/transfer/manager";
import { createConnection } from "./lib/datasource";

createConnection()
  .then(async (connection) => {
    const accountManager = new AccountManager(connection.manager);

    const account1 = await accountManager.createAccount(50);
    console.log("account 1:");
    console.log(account1);
    console.log();

    const account2 = await accountManager.createAccount(50);
    console.log("account 2:");
    console.log(account2);
    console.log();

    const transferManager = new TransferManager(connection.manager);

    console.log("transfer 1:");
    await connection.transaction(async (transactionalEntityManager) => {
      const transfer = await transferManager.createTransfer(
        {
          fromAccount: account1,
          toAccount: account2,
          amount: 10,
          processImmediately: true,
        },
        transactionalEntityManager
      );

      console.log(transfer);
      console.log();
    });

    console.log("Reconcile account 1:");
    await accountManager.reconcileBalances(account1.id);
    console.log();

    console.log("transfer 2:");
    await connection.transaction(async (transactionalEntityManager) => {
      const transfer = await transferManager.createTransfer(
        {
          fromAccount: account1,
          toAccount: account2,
          amount: 100,
          processImmediately: false,
        },
        transactionalEntityManager
      );

      console.log(transfer);
    });

    console.log("Reconcile account 2:");
    await accountManager.reconcileBalances(account2.id);
    console.log();
  })
  .catch((error) => console.log(error));
