import { TransferManager } from "../transfer/manager";
import { Account } from "./entity";
import { EntityManager } from "typeorm/entity-manager/EntityManager";

export class AccountManager {
  constructor(private transactionManager: EntityManager) {}

  private get repository() {
    return this.transactionManager.getRepository(Account);
  }

  public async getAccount(id: number) {
    return this.repository.findOneByOrFail({
      id,
    });
  }

  public async createAccount(balance: number): Promise<Account> {
    return this.repository.save({ balance, initialBalance: balance });
  }

  public async updateBalance(id: number, newBalance: number) {
    return this.repository.update(
      { id },
      {
        balance: newBalance,
      }
    );
  }

  // This doesn't really seem like it belongs in a manager
  public async reconcileBalances(id: number) {
    const account = await this.getAccount(id);

    const transferManager = new TransferManager(this.transactionManager);
    const totalTransferred = await transferManager.getTransfersTotal(id);

    const expectedBalance = account.initialBalance + totalTransferred;

    if (expectedBalance !== account.balance) {
      throw `Balance expected to be ${expectedBalance}, but it is ${account.balance}`;
    }
  }
}
