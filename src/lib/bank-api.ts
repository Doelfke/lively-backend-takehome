import { EntityManager } from "typeorm";
import { AccountManager } from "../models/account/manager";
import { TransferManager } from "../models/transfer/manager";

export class BankApi {
  static async sendMoney(
    transferId: number,
    fromAccountId: number,
    toAccountId: number,
    amount: number,
    entityManager: EntityManager
  ) {
    const queryRunner = entityManager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const transferManager = new TransferManager(entityManager);
    const accountManager = new AccountManager(entityManager);

    try {
      const foundTransfer = await transferManager.getTransfer(transferId);
      if (foundTransfer.processed) {
        throw `Transfer ${foundTransfer.id} already processed`;
      }

      const fromAccount = await accountManager.getAccount(fromAccountId);
      if (fromAccount.balance < amount) {
        throw `Balance for account ${fromAccount.id} is insufficient`;
      }
      accountManager.updateBalance(fromAccountId, fromAccount.balance - amount);

      const toAccount = await accountManager.getAccount(toAccountId);
      accountManager.updateBalance(toAccount.id, fromAccount.balance + amount);

      transferManager.markTransferComplete(foundTransfer.id);

      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}
