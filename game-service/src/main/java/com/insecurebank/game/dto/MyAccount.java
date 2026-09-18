package com.insecurebank.game.dto;

import java.math.BigDecimal;

/**
 * Read-only projection of a row from the bank's transaction_db.accounts
 * table, returned by GET /rewards/my-accounts so the redeem UI can offer a
 * dropdown of the caller's own accounts.
 */
public class MyAccount {
    private final String accountNumber;
    private final String accountType;
    private final BigDecimal balance;

    public MyAccount(String accountNumber, String accountType, BigDecimal balance) {
        this.accountNumber = accountNumber;
        this.accountType = accountType;
        this.balance = balance;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public String getAccountType() {
        return accountType;
    }

    public BigDecimal getBalance() {
        return balance;
    }
}
