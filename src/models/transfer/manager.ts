import { EntityManager } from "typeorm";
import { BankApi } from "../../lib/bank-api";
import type { Account } from "../account/entity";
import { Transfer } from "./entity";

interface ICreateTransferOptions {
  fromAccount: Account;
  toAccount: Account;
  amount: number;
  processImmediately?: boolean;
}

export class TransferManager {
  constructor(private transactionManager: EntityManager) {}

  private get repository() {
    return this.transactionManager.getRepository(Transfer);
  }

  public async getTransfer(id: number) {
    return this.repository.findOneByOrFail({
      id,
    });
  }

  // Not sure based on the instructions if we should consider
  // if the funds have been transferred or not
  public async getTransfersTotal(accountId: number) {
    const credits = await this.repository.sum("amount", {
      toAccount: {
        id: accountId,
      },
    });

    const debits = await this.repository.sum("amount", {
      fromAccount: {
        id: accountId,
      },
    });

    return credits - debits;
  }

  public async markTransferComplete(id: number) {
    return this.repository.update(
      { id },
      {
        processed: true,
      }
    );
  }

  public async createTransfer(
    {
      fromAccount,
      toAccount,
      amount,
      processImmediately,
    }: ICreateTransferOptions,
    entityManager: EntityManager
  ) {
    const newTransfer = await this.repository.save({
      fromAccount,
      toAccount,
      amount,
    });

    if (processImmediately) {
      await BankApi.sendMoney(
        newTransfer.id,
        fromAccount.id,
        toAccount.id,
        amount,
        entityManager
      );
      return this.repository.findOne({
        where: {
          id: newTransfer.id,
        },
      });
    }

    return newTransfer;
  }
}
