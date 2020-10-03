import * as dotenv from "dotenv";
import express from "express";
import fetch from "node-fetch";
import Constants from "../Constants";
import { AccountModel } from "../models/AccountModel";
import { AccountRequest } from "../models/AccountRequest";

const router = express();

dotenv.config();
const port = process.env.PORT;

//Teste
router.get("/api/accounts", async (req, res) => {
  const accounts = await (await fetch(Constants.ACCOUNTS_URL)).json();
  res.send(accounts);
});

//Somatório dos depósitos
router.get("/api/sum", async (req, res) => {
  const agencia = req.body.agencia;
  console.log(typeof agencia);
  const accounts: AccountModel[] = await (
    await fetch(Constants.ACCOUNTS_URL)
  ).json();

  const agencyAccountsSum = accounts
    .filter((account: AccountModel) => {
      if (account.agencia === agencia) {
        return account.balance;
      }
      if (!agencia) {
        return account.balance;
      }
    })
    .map((account) => account.balance)
    .reduce((previous, current) => {
      return previous + current;
    }, 0);

  res.send(`Somatório dos depósitos: R$ ${agencyAccountsSum}`);
});

//Número total de contas por agencia
router.get("/api/accountsTotal", async (req, res) => {
  const balance = req.body.balance || 0;
  const agency = req.body.agencia;
  console.log(agency);

  const accounts: AccountModel[] = await (
    await fetch(Constants.ACCOUNTS_URL)
  ).json();

  const AccountsTotal = accounts.filter((account: AccountModel) => {
    if (!!agency && agency === account.agencia && account.balance > balance) {
      return account;
    }
  }).length;

  res.send(
    `Número total de contas com mais de R$ ${balance} : ${AccountsTotal}`
  );
});

//Agência com maior saldo
router.get("/api/highestbalance", async (req, res) => {
  try {
    const accounts: AccountModel[] = await (
      await fetch(Constants.ACCOUNTS_URL)
    ).json();

    const highestBalanceAccount = accounts.sort((a, b) => {
      return b.balance - a.balance;
    })[0];

    res.send(
      `Agência com maior saldo: ${highestBalanceAccount.agencia} -> R$ ${highestBalanceAccount.balance}`
    );
  } catch (error) {
    throw new Error("Erro na obtenção do maior saldo...");
  }
});

// Agência com menor saldo
router.get("/api/lowestbalance", async (req, res) => {
  try {
    const accounts: AccountModel[] = await (
      await fetch(Constants.ACCOUNTS_URL)
    ).json();

    const highestBalanceAccount = accounts.sort((a, b) => {
      return a.balance - b.balance;
    })[0];

    res.send(
      `Agência com menor saldo: ${highestBalanceAccount.agencia} -> R$ ${highestBalanceAccount.balance}`
    );
  } catch (error) {
    throw new Error("Erro na obtenção do menor saldo...");
  }
});

//Somatório dos maiores saldos de cada agência
router.get("/api/sumofhighestbalances", async (req, res) => {
  try {
    const accounts: AccountModel[] = await (
      await fetch(Constants.ACCOUNTS_URL)
    ).json();

    let currentAgency: number = 0;
    const topAccounts: AccountModel[] = [];

    const orderedAccountsByAgency = accounts.sort(
      (a, b) => a.agencia - b.agencia
    );

    orderedAccountsByAgency.map(
      (account: AccountModel, index: number, array: AccountModel[]) => {
        if (currentAgency === 0 || currentAgency !== account.agencia) {
          currentAgency = account.agencia;

          const highestBalanceAccount: AccountModel = array
            .filter((item: AccountModel) => item.agencia === currentAgency)
            .sort(
              (a: AccountModel, b: AccountModel) => b.balance - a.balance
            )[0];

          if (
            (topAccounts.length > 0 &&
              topAccounts[topAccounts.length - 1].balance !==
                highestBalanceAccount.balance) ||
            topAccounts.length === 0
          ) {
            topAccounts.push(highestBalanceAccount);
          }
        }
      }
    );
    const balanceSum: number = topAccounts.reduce(
      (sum: number, account: AccountModel) => sum + account.balance,
      0
    );

    res.send(
      `Somatório dos valores das melhores contas de cada agência: R$ ${balanceSum}.`
    );
  } catch (error) {
    throw new Error(error);
  }
});

//Maior saldo de determinada agência
router.get("/api/topclient", async (req, res) => {
  try {
    const body: AccountRequest = req.body;
    const agency: number = (req.body as AccountRequest).agencia as number;

    const accounts: AccountModel[] = await (
      await fetch(Constants.ACCOUNTS_URL)
    ).json();

    const topAccount: AccountModel = accounts
      .filter((account: AccountModel) => account.agencia === agency)
      .sort((a, b) => b.balance - a.balance)[0];

    res.send(
      `Nome do cliente mais rico da agência ${agency}: ${topAccount.name} -> Valor: R$ ${topAccount.balance}.`
    );
  } catch (error) {
    throw new Error(error);
  }
});

//Menor saldo de determinada agência
router.get("/api/poorestclient", async (req, res) => {
  try {
    const body: AccountRequest = req.body;
    const agency: number = (req.body as AccountRequest).agencia as number;

    const accounts: AccountModel[] = await (
      await fetch(Constants.ACCOUNTS_URL)
    ).json();

    const topAccount: AccountModel = accounts
      .filter((account: AccountModel) => account.agencia === agency)
      .sort((a, b) => a.balance - b.balance)[0];

    res.send(
      `Nome do cliente mais pobre da agência ${agency}: ${topAccount.name} -> Valor: R$ ${topAccount.balance}.`
    );
  } catch (error) {
    throw new Error(error);
  }
});

//Menores saldo de determinada agência
router.get("/api/poorestclients", async (req, res) => {
  try {
    const agency: number = (req.body as AccountRequest).agencia as number;

    const accounts: AccountModel[] = await (
      await fetch(Constants.ACCOUNTS_URL)
    ).json();

    const poorestClients: string = accounts
      .filter((account: AccountModel) => account.agencia === agency)
      .sort((a, b) => a.balance - b.balance)
      .filter((account: AccountModel, index: number) => index < 3)
      .map((account: AccountModel) => account.name)
      .join("; ");

    res.send(`Clientes mais pobres da agência ${agency}: ${poorestClients}`);
  } catch (error) {
    throw new Error(error);
  }
});

//Quantidade de clientes de determinada agência
router.get("/api/clientsamount", async (req, res) => {
  try {
    const body: AccountRequest = req.body;
    const agency: number = (req.body as AccountRequest).agencia as number;

    const accounts: AccountModel[] = await (
      await fetch(Constants.ACCOUNTS_URL)
    ).json();

    const clientsAmount: number = accounts.filter(
      (account: AccountModel) => account.agencia === agency
    ).length;

    res.send(`Quantidade de clientes da agência ${agency}: ${clientsAmount}`);
  } catch (error) {
    throw new Error(error);
  }
});

//Quantidade de clientes de determinada agência com mesmo nome
router.get("/api/clientswithsamename", async (req, res) => {
  try {
    const body: AccountRequest = req.body;
    const { agencia, name } = req.body as AccountRequest;

    const regexName = new RegExp(name as string);

    const accounts: AccountModel[] = await (
      await fetch(Constants.ACCOUNTS_URL)
    ).json();

    const clientsAmount: number = accounts.filter(
      (account: AccountModel) =>
        account.agencia === agencia && account.name.match(regexName)
    ).length;

    res.send(
      `Quantidade de clientes da agência ${agencia} com nome ${name}: ${clientsAmount}`
    );
  } catch (error) {
    throw new Error(error);
  }
});

//Próximo ID disponível
router.get("/api/nextid", async (req, res) => {
  try {
    const accounts: AccountModel[] = await (
      await fetch(Constants.ACCOUNTS_URL)
    ).json();

    const nextId: number = accounts.sort((a, b) => b.id - a.id)[0].id + 1;
    res.send(`Próximo ID: ${nextId}`);
  } catch (error) {
    throw new Error(error);
  }
});

export default router;
