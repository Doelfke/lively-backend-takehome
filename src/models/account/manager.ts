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
    return this.repository.save({ balance });
  }

  public async updateBalance(accountId: number, newBalance: number) {
    return this.repository.update(
      { id: accountId },
      {
        balance: newBalance,
      }
    );
  }

  static async reconcileBalances(id: string) {}
}
